import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "15")));

    const where = { userId: user.id };

    const [orders, total] = await Promise.all([
      prisma.scheduledOrder.findMany({
        where,
        include: { service: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.scheduledOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Failed to fetch scheduled orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, link, quantity, intervalHours, maxRuns } = body;

    if (!serviceId || !link || !quantity || !intervalHours) {
      return NextResponse.json({ error: "serviceId, link, quantity, and intervalHours are required" }, { status: 400 });
    }

    if (quantity < 1) return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
    if (intervalHours < 1) return NextResponse.json({ error: "intervalHours must be at least 1" }, { status: 400 });

    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId), status: 1, isDeleted: false },
    });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

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

    return NextResponse.json({ success: true, order: scheduledOrder }, { status: 201 });
  } catch (error) {
    console.error("Failed to create scheduled order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
