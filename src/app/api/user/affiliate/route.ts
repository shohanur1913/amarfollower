import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { referralCode: true },
    });

    const [totalReferrals, referralRows] = await Promise.all([
      prisma.referral.count({ where: { referrerId: user.id } }),
      prisma.referral.findMany({
        where: { referrerId: user.id },
        include: {
          referred: { select: { username: true, email: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalCommission = await prisma.referral.aggregate({
      _sum: { commission: true },
      where: { referrerId: user.id },
    });

    const pendingCommission = await prisma.referral.aggregate({
      _sum: { commission: true },
      where: { referrerId: user.id, status: "pending" },
    });

    return NextResponse.json({
      referralCode: dbUser?.referralCode || "",
      totalReferrals,
      totalCommission: Number(totalCommission._sum.commission || 0),
      pendingCommission: Number(pendingCommission._sum.commission || 0),
      referrals: referralRows.map((r) => ({
        id: r.id,
        username: r.referred.username,
        email: r.referred.email,
        commission: Number(r.commission),
        status: r.status,
        date: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Affiliate API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
