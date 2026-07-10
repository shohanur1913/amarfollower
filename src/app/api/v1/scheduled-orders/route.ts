import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";

// GET /api/v1/scheduled-orders — List scheduled orders
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
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.scheduledOrder.findMany({
        where,
        include: {
          service: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.scheduledOrder.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const formatted = orders.map((o) => ({
      id: o.id,
      service: o.service.name,
      link: o.link,
      quantity: o.quantity,
      intervalHours: o.intervalHours,
      nextRunAt: o.nextRunAt,
      totalRuns: o.totalRuns,
      maxRuns: o.maxRuns,
      status: o.status,
      createdAt: o.createdAt,
    }));

    return apiPaginated(formatted, { page, pageSize, total, totalPages });
  } catch (error) {
    console.error("Failed to fetch scheduled orders:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/v1/scheduled-orders — Create scheduled order
export async function POST(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { serviceId, link, quantity, intervalHours, maxRuns } = body;

    if (!serviceId || !link || !quantity || !intervalHours) {
      return apiError("serviceId, link, quantity, and intervalHours are required");
    }

    if (quantity < 1) return apiError("Quantity must be at least 1");
    if (intervalHours < 1) return apiError("intervalHours must be at least 1");

    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId), status: 1, isDeleted: false },
    });
    if (!service) return apiError("Service not found", 404);

    const nextRunAt = new Date();
    nextRunAt.setHours(nextRunAt.getHours() + Number(intervalHours));

    const scheduledOrder = await prisma.scheduledOrder.create({
      data: {
        userId: user.id,
        serviceId: Number(serviceId),
        link,
        quantity: Number(quantity),
        intervalHours: Number(intervalHours),
        maxRuns: maxRuns ? Number(maxRuns) : null,
        nextRunAt,
        status: "active",
      },
    });

    return apiSuccess(
      {
        id: scheduledOrder.id,
        serviceId: scheduledOrder.serviceId,
        link: scheduledOrder.link,
        quantity: scheduledOrder.quantity,
        intervalHours: scheduledOrder.intervalHours,
        nextRunAt: scheduledOrder.nextRunAt,
        status: scheduledOrder.status,
      },
      201
    );
  } catch (error) {
    console.error("Failed to create scheduled order:", error);
    return apiError("Internal server error", 500);
  }
}
