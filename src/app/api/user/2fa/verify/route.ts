import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyTwoFactorToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not initialized" }, { status: 400 });
    }

    const valid = await verifyTwoFactorToken(token, dbUser.twoFactorSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to verify 2FA:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
