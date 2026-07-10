import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface CallbackData {
  order_id?: string;
  status?: string;
  amount?: number;
  pp_id?: number;
  metadata?: { order_id?: string; user_id?: number };
}

interface GatewayInfo {
  name: string;
  apiKey: string;
  baseUrl: string;
}

interface PaymentInfo {
  id: number;
  userId: number;
  amount: number;
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const data = JSON.parse(raw) as CallbackData;

    // Determine gateway from order_id prefix or body field
    const orderId = data.order_id || data.metadata?.order_id || null;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { transactionId: orderId },
    });

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" });
    }

    if (payment.status === "completed") {
      return NextResponse.json({ message: "Already processed" });
    }

    if (payment.status === "failed") {
      return NextResponse.json({ message: "Payment was marked as failed" });
    }

    const gw = await prisma.gateway.findFirst({
      where: { name: payment.gateway },
      select: { name: true, apiKey: true, baseUrl: true },
    });

    if (!gw) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    const paymentArgs = { id: payment.id, userId: payment.userId, amount: Number(payment.amount) };

    if (gw.name === "cryptomus") {
      return await handleCryptomusCallback(request, raw, data, paymentArgs, gw);
    }

    // Default: piprapay callback
    return await handlePiprapayCallback(request, data, paymentArgs, gw);
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleCryptomusCallback(
  request: Request,
  raw: string,
  data: CallbackData,
  payment: PaymentInfo,
  gw: GatewayInfo,
) {
  const headers = Object.fromEntries(request.headers.entries());
  const receivedSign = headers["sign"] || "";

  const encoded = Buffer.from(raw).toString("base64");
  const expectedSign = crypto.createHash("md5").update(encoded + gw.apiKey).digest("hex");

  if (receivedSign !== expectedSign) {
    return NextResponse.json({ error: "Invalid sign" }, { status: 401 });
  }

  if (data.status !== "paid" && data.status !== "paid_over") {
    return NextResponse.json({ message: "Payment not completed" });
  }

  const amount = data.amount ? Number(data.amount) : Number(payment.amount);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "completed" },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { balance: { increment: amount } },
    }),
  ]);

  return NextResponse.json({ message: "Balance Updated Successfully" });
}

async function handlePiprapayCallback(
  request: Request,
  data: CallbackData,
  payment: PaymentInfo,
  gw: GatewayInfo,
) {
  const headers = Object.fromEntries(request.headers.entries());
  const receivedKey = headers["mh-piprapay-api-key"] || "";

  if (receivedKey !== gw.apiKey) {
    return NextResponse.json({ error: "Invalid Auth" }, { status: 401 });
  }

  const ppId = data.pp_id ?? null;
  const userId = Number(data.metadata?.user_id ?? 0);

  if (!ppId || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let verifyResult: { status?: string };
  try {
    const verifyRes = await fetch(`${gw.baseUrl}/api/verify-payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mh-piprapay-api-key": gw.apiKey,
      },
      body: JSON.stringify({ pp_id: ppId }),
    });
    verifyResult = await verifyRes.json();
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }

  const isCompleted =
    typeof verifyResult?.status === "string" &&
    verifyResult.status.toLowerCase() === "completed";

  if (!isCompleted) {
    return NextResponse.json({ message: "Payment not completed" });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "completed" },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: payment.amount } },
    }),
  ]);

  return NextResponse.json({ message: "Balance Updated Successfully" });
}
