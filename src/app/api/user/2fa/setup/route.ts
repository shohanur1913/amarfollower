import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, generateTwoFactorSecret, generateTwoFactorUri } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = generateTwoFactorSecret();
    const uri = generateTwoFactorUri(user.username, secret);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({ secret, uri });
  } catch (error) {
    console.error("Failed to setup 2FA:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
