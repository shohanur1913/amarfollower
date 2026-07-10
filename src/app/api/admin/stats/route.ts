import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalOrders, pendingOrders, completedOrders, totalRevenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.order.count({ where: { status: "completed" } }),
        prisma.order.aggregate({
          _sum: { charge: true },
          where: { status: "completed" },
        }),
      ]);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        user: { select: { username: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: Number(totalRevenue._sum.charge || 0),
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
