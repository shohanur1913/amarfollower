import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, createSession, verifyToken } from "@/lib/auth";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-change-me";

export async function POST(request: NextRequest) {
  try {
    const admin = await getSession("admin");
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "User account is not active" }, { status: 400 });
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      balance: Number(user.balance),
    };

    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({ success: true, redirect: "/dashboard" });

    response.cookies.set("user-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login as user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
