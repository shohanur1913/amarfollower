import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = adminLoginSchema.parse(body);

    // Query the SEPARATE admins table, not the users table
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (admin.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login time
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await createSession(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: "admin",
        status: admin.status,
        balance: 0,
      },
      "admin"
    );

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
