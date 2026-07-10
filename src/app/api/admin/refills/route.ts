import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const refills = await prisma.refill.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        order: { select: { id: true, link: true, quantity: true, charge: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(refills);
  } catch (error) {
    console.error("Failed to fetch refills:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const refill = await prisma.refill.findUnique({ where: { id } });
    if (!refill) {
      return NextResponse.json({ error: "Refill not found" }, { status: 404 });
    }

    if (status === "approved") {
      const order = await prisma.order.findUnique({ where: { id: refill.orderId } });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      await prisma.$transaction([
        prisma.refill.update({ where: { id }, data: { status } }),
        prisma.user.update({
          where: { id: refill.userId },
          data: { balance: { increment: Number(order.charge) } },
        }),
      ]);
    } else {
      await prisma.refill.update({ where: { id }, data: { status } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update refill:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
