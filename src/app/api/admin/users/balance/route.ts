import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || amount === undefined || amount === null) {
      return NextResponse.json({ error: "userId and amount are required" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { balance: { increment: numericAmount } },
    });

    return NextResponse.json({ success: true, balance: updated.balance });
  } catch (error) {
    console.error("Failed to adjust balance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
