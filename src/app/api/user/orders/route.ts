import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getNextOrderId } from "@/lib/order-id";

export async function GET(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "15")));
    const statusFilter = url.searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };
    if (statusFilter) {
      where.status = statusFilter;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { service: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
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
    const { serviceId, link, quantity } = body;

    if (!serviceId || !link || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (quantity < service.min || quantity > service.max) {
      return NextResponse.json(
        { error: `Quantity must be between ${service.min} and ${service.max}` },
        { status: 400 }
      );
    }

    const charge = (quantity / service.perAmount) * Number(service.pricePerK);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || Number(dbUser.balance) < charge) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const id = await getNextOrderId(tx);
      return tx.order.create({
        data: {
          id,
          userId: user.id,
          serviceId,
          providerId: service.providerId,
          link,
          quantity,
          charge,
          status: "pending",
        },
      });
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: charge } },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
