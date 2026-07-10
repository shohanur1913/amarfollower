import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true, username: true },
    });

    const [totalOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders, totalSpendResult] =
      await Promise.all([
        prisma.order.count({ where: { userId: user.id } }),
        prisma.order.count({ where: { userId: user.id, status: "pending" } }),
        prisma.order.count({ where: { userId: user.id, status: "processing" } }),
        prisma.order.count({ where: { userId: user.id, status: "completed" } }),
        prisma.order.count({ where: { userId: user.id, status: "cancelled" } }),
        prisma.order.aggregate({
          _sum: { charge: true },
          where: { userId: user.id, status: { not: "cancelled" } },
        }),
      ]);

    return apiSuccess({
      username: dbUser?.username || "",
      balance: Number(dbUser?.balance || 0),
      totalSpend: Number(totalSpendResult._sum.charge || 0),
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return apiError("Internal server error", 500);
  }
}
