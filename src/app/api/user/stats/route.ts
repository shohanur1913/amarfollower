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
      select: { balance: true, username: true },
    });

    const [totalOrders, pendingOrders, completedOrders, inProgressOrders, totalSpendResult] =
      await Promise.all([
        prisma.order.count({ where: { userId: user.id } }),
        prisma.order.count({ where: { userId: user.id, status: "pending" } }),
        prisma.order.count({ where: { userId: user.id, status: "completed" } }),
        prisma.order.count({
          where: { userId: user.id, status: "in_progress" },
        }),
        prisma.order.aggregate({
          _sum: { charge: true },
          where: { userId: user.id, status: { not: "cancelled" } },
        }),
      ]);

    const recentOrders = await prisma.order.findMany({
      where: { userId: user.id },
      take: 5,
      include: { service: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      username: dbUser?.username || "",
      balance: Number(dbUser?.balance || 0),
      totalSpend: Number(totalSpendResult._sum.charge || 0),
      totalOrders,
      pendingOrders,
      completedOrders,
      inProgressOrders,
      recentOrders,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
