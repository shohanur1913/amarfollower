import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

// DELETE /api/v1/scheduled-orders/:id — Cancel a scheduled order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId)) return apiError("Invalid scheduled order ID");

    const order = await prisma.scheduledOrder.findFirst({
      where: { id: orderId, userId: user.id },
    });

    if (!order) return apiError("Scheduled order not found", 404);

    await prisma.scheduledOrder.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    return apiSuccess({ id: orderId, status: "cancelled" });
  } catch (error) {
    console.error("Failed to cancel scheduled order:", error);
    return apiError("Internal server error", 500);
  }
}
