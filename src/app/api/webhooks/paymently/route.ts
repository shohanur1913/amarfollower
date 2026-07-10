import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, status, amount, gateway } = body;

    if (!transaction_id || !status) {
      return NextResponse.json({ error: "transaction_id and status are required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { transactionId: transaction_id },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "pending") {
      return NextResponse.json({ success: true, message: "Payment already processed" });
    }

    const newStatus = status === "success" ? "completed" : "failed";

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    if (newStatus === "completed") {
      await prisma.user.update({
        where: { id: payment.userId },
        data: { balance: { increment: Number(payment.amount) } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process payment webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
