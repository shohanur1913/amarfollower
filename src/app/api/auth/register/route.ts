import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, phone, password, referralCode } = registerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already exists" },
        { status: 409 }
      );
    }

    let referredBy: number | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode },
      });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const hashedPassword = await hashPassword(password);
    const userReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const user = await prisma.user.create({
      data: {
        username,
        email,
        phone: phone || null,
        password: hashedPassword,
        referralCode: userReferralCode,
        referredBy,
      },
    });

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
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
