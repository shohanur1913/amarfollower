import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";

// GET /api/v1/refills — List refills
export async function GET(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "20")));

    const [refills, total] = await Promise.all([
      prisma.refill.findMany({
        where: { userId: user.id },
        include: {
          order: {
            select: { id: true, link: true, quantity: true, service: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.refill.count({ where: { userId: user.id } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const formatted = refills.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      orderLink: r.order.link,
      service: r.order.service.name,
      amount: Number(r.amount),
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt,
    }));

    return apiPaginated(formatted, { page, pageSize, total, totalPages });
  } catch (error) {
    console.error("Failed to fetch refills:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/v1/refills — Request a refill
export async function POST(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) return apiError("orderId is required");

    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), userId: user.id },
    });

    if (!order) return apiError("Order not found", 404);

    if (order.status !== "completed") {
      return apiError("Refill is only available for completed orders");
    }

    const refill = await prisma.refill.create({
      data: {
        userId: user.id,
        orderId: Number(orderId),
        amount: order.charge,
        reason: reason || null,
        status: "pending",
      },
    });

    return apiSuccess({ id: refill.id, orderId: refill.orderId, status: refill.status }, 201);
  } catch (error) {
    console.error("Failed to create refill:", error);
    return apiError("Internal server error", 500);
  }
}
