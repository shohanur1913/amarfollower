import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await verifyPassword(password, dbUser.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disable 2FA:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
