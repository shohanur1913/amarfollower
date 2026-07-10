import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getNextOrderId } from "@/lib/order-id";

// POST /api/v1/orders/mass — Mass/bulk order
// Body: { orders: [{ serviceId, link, quantity }] }
export async function POST(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return apiError("orders array is required and must not be empty");
    }

    if (orders.length > 100) {
      return apiError("Maximum 100 orders per request");
    }

    // Check user can order
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return apiError("User not found", 404);
    if (!dbUser.canOrder) return apiError("Your account is restricted from placing orders");

    // Pre-validate all services and calculate total charge
    const results: Array<{
      index: number;
      serviceId: number;
      link: string;
      quantity: number;
      orderId?: number;
      charge?: number;
      error?: string;
    }> = [];

    let totalCharge = 0;
    const validatedOrders: Array<{
      serviceId: number;
      link: string;
      quantity: number;
      providerId: number | null;
      charge: number;
      index: number;
    }> = [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const serviceId = Number(order.serviceId);
      const link = order.link;
      const quantity = Number(order.quantity);

      if (!serviceId || !link || !quantity) {
        results.push({ index: i, serviceId, link, quantity, error: "serviceId, link, and quantity are required" });
        continue;
      }

      if (quantity < 1) {
        results.push({ index: i, serviceId, link, quantity, error: "Quantity must be at least 1" });
        continue;
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId, status: 1, isDeleted: false },
      });

      if (!service) {
        results.push({ index: i, serviceId, link, quantity, error: "Service not found" });
        continue;
      }

      if (quantity < service.min || quantity > service.max) {
        results.push({ index: i, serviceId, link, quantity, error: `Quantity must be between ${service.min} and ${service.max}` });
        continue;
      }

      const charge = (quantity / service.perAmount) * Number(service.pricePerK);
      totalCharge += charge;
      validatedOrders.push({ serviceId, link, quantity, providerId: service.providerId, charge, index: i });
    }

    // Check total balance
    if (Number(dbUser.balance) < totalCharge) {
      return apiError("Insufficient balance for all orders");
    }

    // Process all orders in a transaction with unique custom IDs
    const createdOrders = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const vo of validatedOrders) {
        const id = await getNextOrderId(tx);
        const order = await tx.order.create({
          data: {
            id,
            userId: user.id,
            serviceId: vo.serviceId,
            providerId: vo.providerId,
            link: vo.link,
            quantity: vo.quantity,
            charge: vo.charge,
            status: "pending",
          },
        });
        results.push(order);
      }
      return results;
    });

    // Deduct total balance
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: totalCharge } },
    });

    // Merge results
    for (let i = 0; i < createdOrders.length; i++) {
      results.push({
        index: validatedOrders[i].index,
        serviceId: validatedOrders[i].serviceId,
        link: validatedOrders[i].link,
        quantity: validatedOrders[i].quantity,
        orderId: createdOrders[i].id,
        charge: Number(createdOrders[i].charge),
      });
    }

    results.sort((a, b) => a.index - b.index);

    return apiSuccess(
      { results, totalCharge: Number(totalCharge), successCount: createdOrders.length, failCount: results.length - createdOrders.length },
      201
    );
  } catch (error) {
    console.error("Failed to create mass order:", error);
    return apiError("Internal server error", 500);
  }
}
