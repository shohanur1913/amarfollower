import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const refills = await prisma.refill.findMany({
      where: { userId: user.id },
      include: { order: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(refills);
  } catch (error) {
    console.error("Failed to fetch refills:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const refill = await prisma.refill.create({
      data: {
        userId: user.id,
        orderId,
        amount: order.charge,
        reason,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, refill });
  } catch (error) {
    console.error("Failed to create refill:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
