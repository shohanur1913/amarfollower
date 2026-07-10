import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";

// GET /api/v1/payments — Payment history
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

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const formatted = payments.map((p) => ({
      id: p.id,
      transactionId: p.transactionId,
      amount: Number(p.amount),
      feeAmount: Number(p.feeAmount),
      gateway: p.gateway,
      status: p.status,
      createdAt: p.createdAt,
    }));

    return apiPaginated(formatted, { page, pageSize, total, totalPages });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/v1/payments — Initiate a payment
export async function POST(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { gateway, amount } = body;

    if (!gateway || !amount || Number(amount) <= 0) {
      return apiError("gateway and amount are required. amount must be greater than 0");
    }

    // Get fee settings
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["processing_fee_percent"] } },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const feePercent = Number(map.processing_fee_percent || "0");
    const feeAmount = (Number(amount) * feePercent) / 100;
    const finalAmount = Number(amount) + feeAmount;

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        gateway,
        amount: finalAmount,
        feeAmount,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        status: "pending",
      },
    });

    return apiSuccess(
      {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: Number(payment.amount),
        feeAmount: Number(payment.feeAmount),
        gateway: payment.gateway,
        status: payment.status,
        createdAt: payment.createdAt,
      },
      201
    );
  } catch (error) {
    console.error("Payment creation error:", error);
    return apiError("Failed to process payment", 500);
  }
}
