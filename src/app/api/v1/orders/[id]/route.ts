import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

// GET /api/v1/orders/:id — Single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId)) return apiError("Invalid order ID");

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true, platform: { select: { name: true } } } },
          },
        },
      },
    });

    if (!order) return apiError("Order not found", 404);

    return apiSuccess({
      id: order.id,
      service: {
        id: order.service.id,
        name: order.service.name,
        platform: order.service.category.platform.name,
        category: order.service.category.name,
      },
      link: order.link,
      quantity: order.quantity,
      charge: Number(order.charge),
      status: order.status,
      apiOrderId: order.apiOrderId,
      startCount: order.startCount,
      remains: order.remains,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return apiError("Internal server error", 500);
  }
}
