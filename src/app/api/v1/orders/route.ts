import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";
import { getNextOrderId } from "@/lib/order-id";

// GET /api/v1/orders — List orders with pagination & filtering
export async function GET(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "20")));
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true, platform: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      service: o.service.name,
      platform: o.service.category.platform.name,
      link: o.link,
      quantity: o.quantity,
      charge: Number(o.charge),
      status: o.status,
      startCount: o.startCount,
      remains: o.remains,
      createdAt: o.createdAt,
    }));

    return apiPaginated(formattedOrders, { page, pageSize, total, totalPages });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/v1/orders — Create a new order
export async function POST(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { serviceId, link, quantity } = body;

    if (!serviceId || !link || !quantity) {
      return apiError("serviceId, link, and quantity are required");
    }

    if (quantity < 1) {
      return apiError("Quantity must be at least 1");
    }

    // Check user can order
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return apiError("User not found", 404);
    if (!dbUser.canOrder) return apiError("Your account is restricted from placing orders");

    // Validate service
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId), status: 1, isDeleted: false },
    });

    if (!service) return apiError("Service not found", 404);

    if (quantity < service.min || quantity > service.max) {
      return apiError(`Quantity must be between ${service.min} and ${service.max}`);
    }

    // Calculate charge
    const charge = (quantity / service.perAmount) * Number(service.pricePerK);

    // Check balance
    if (Number(dbUser.balance) < charge) {
      return apiError("Insufficient balance");
    }

    // Create order with custom ID in transaction
    const order = await prisma.$transaction(async (tx) => {
      const id = await getNextOrderId(tx);
      return tx.order.create({
        data: {
          id,
          userId: user.id,
          serviceId: Number(serviceId),
          providerId: service.providerId,
          link,
          quantity,
          charge,
          status: "pending",
        },
      });
    });

    // Deduct balance
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: charge } },
    });

    return apiSuccess(
      { id: order.id, charge: Number(order.charge), status: order.status, link: order.link, quantity: order.quantity },
      201
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return apiError("Internal server error", 500);
  }
}
