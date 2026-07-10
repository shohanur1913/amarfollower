import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      include: {
        referrer: { select: { id: true, username: true, email: true } },
        referred: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Failed to fetch affiliates:", error);
    return NextResponse.json([], { status: 500 });
  }
}
