import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  const debug = request.headers.get("x-debug") === "1";
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const isEmail = email.includes("@");
    const user = isEmail
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findFirst({
          where: {
            OR: [
              { phone: email },
              { phone: `+88${email}` },
            ],
          },
        });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({
        require2FA: true,
        userId: user.id,
        email: user.email,
      });
    }

    await createSession({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      balance: Number(user.balance),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Login error:", error);
    const msg = debug && error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
