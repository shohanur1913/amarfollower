import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const where = userId ? { userId: parseInt(userId) } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { username: true, email: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true, charge: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    if (status === "cancelled" && order.status !== "cancelled") {
      await prisma.user.update({
        where: { id: order.userId },
        data: { balance: { increment: order.charge } },
      });
    }

    return NextResponse.json({ success: true, orderId: updated.id });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
