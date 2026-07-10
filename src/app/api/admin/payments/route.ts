import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "20")));
    const status = url.searchParams.get("status");
    const userId = url.searchParams.get("userId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (userId) where.userId = Number(userId);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { user: { select: { id: true, username: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount, gateway, transactionId, status } = body;

    if (!userId || !amount || !gateway || !transactionId) {
      return NextResponse.json({ error: "userId, amount, gateway, and transactionId are required" }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: Number(userId),
        amount: Number(amount),
        gateway,
        transactionId,
        status: status || "completed",
      },
    });

    if (payment.status === "completed") {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { balance: { increment: Number(amount) } },
      });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const existing = await prisma.payment.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const updated = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status },
    });

    if (status === "completed" && existing.status !== "completed") {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { balance: { increment: Number(existing.amount) } },
      });
    }

    if (status === "failed" && existing.status === "completed") {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { balance: { decrement: Number(existing.amount) } },
      });
    }

    return NextResponse.json({ success: true, payment: updated });
  } catch (error) {
    console.error("Failed to update payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
