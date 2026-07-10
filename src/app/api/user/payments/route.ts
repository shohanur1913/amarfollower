import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "20")));
    const statusFilter = url.searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };
    if (statusFilter) {
      where.status = statusFilter;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          transactionId: true,
          amount: true,
          feeAmount: true,
          gateway: true,
          status: true,
          createdAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gateway, amount } = body;

    if (!gateway || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const numAmount = Number(amount);

    // Fetch gateway details
    const gw = await prisma.gateway.findFirst({
      where: { name: gateway, status: 1 },
      select: { id: true, name: true, displayName: true, apiKey: true, baseUrl: true, currency: true },
    });

    if (!gw) {
      return NextResponse.json({ error: "Invalid payment gateway" }, { status: 400 });
    }

    // Fetch settings
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["processing_fee_percent", "currency_symbol", "site_url"] } },
    });

    const settingMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const feePercent = Number(settingMap.processing_fee_percent || "0");
    const feeAmount = (numAmount * feePercent) / 100;
    const finalAmount = numAmount + feeAmount;
    const siteUrl = (settingMap.site_url || "").replace(/\/$/, "");

    // Generate order ID (like old version: DEP-timestamp-userId)
    const orderId = `DEP-${Date.now()}-${user.id}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        transactionId: orderId,
        gateway,
        amount: finalAmount,
        feeAmount: feeAmount,
        status: "pending",
      },
    });

    if (gateway === "cryptomus") {
      return await handleCryptomusPayment(gw, user, finalAmount, feeAmount, orderId, payment.id, siteUrl);
    }

    // Default: piprapay-style gateway
    return await handlePiprapayPayment(gw, user, finalAmount, feeAmount, orderId, payment.id, siteUrl);
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}

async function handleCryptomusPayment(
  gw: { name: string; apiKey: string; baseUrl: string; currency: string },
  user: { id: number; username: string; email: string },
  finalAmount: number,
  feeAmount: number,
  orderId: string,
  paymentId: number,
  siteUrl: string,
) {
  const payload = {
    amount: finalAmount.toFixed(2),
    currency: gw.currency,
    order_id: orderId,
    url_callback: `${siteUrl}/api/payments/callback`,
    url_return: `${siteUrl}/add-funds`,
    is_payment_multiple: false,
  };

  const jsonPayload = JSON.stringify(payload);
  const encoded = Buffer.from(jsonPayload).toString("base64");
  const sign = crypto.createHash("md5").update(encoded + gw.apiKey).digest("hex");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let gatewayRes: Response;
  try {
    gatewayRes = await fetch("https://api.cryptomus.com/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        merchant: gw.baseUrl,
        sign,
      },
      body: jsonPayload,
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timeout);
    await markFailed(paymentId);
    return NextResponse.json({ error: "Gateway timeout. Please try again." }, { status: 502 });
  }

  clearTimeout(timeout);

  if (!gatewayRes.ok) {
    await markFailed(paymentId);
    const errText = await gatewayRes.text().catch(() => "Gateway rejected the request.");
    return NextResponse.json({ error: `Gateway rejected the request (${gatewayRes.status}).` }, { status: 502 });
  }

  const gatewayData = await gatewayRes.json();

  if (gatewayData?.state === 0 && gatewayData?.result?.url) {
    return NextResponse.json({
      success: true,
      pp_url: gatewayData.result.url,
      transactionId: orderId,
    });
  }

  await markFailed(paymentId);
  return NextResponse.json({ error: "Gateway returned an invalid response." }, { status: 502 });
}

async function handlePiprapayPayment(
  gw: { name: string; apiKey: string; baseUrl: string; currency: string },
  user: { id: number; username: string; email: string },
  finalAmount: number,
  feeAmount: number,
  orderId: string,
  paymentId: number,
  siteUrl: string,
) {
  const postData = {
    full_name: user.username,
    email_mobile: user.email,
    amount: finalAmount.toFixed(2),
    metadata: { order_id: orderId, user_id: user.id },
    redirect_url: `${siteUrl}/transactions?status=success&tid=${orderId}`,
    cancel_url: `${siteUrl}/transactions?status=cancel&tid=${orderId}`,
    webhook_url: `${siteUrl}/api/payments/callback`,
    return_type: "GET",
    currency: gw.currency,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let gatewayRes: Response;
  try {
    gatewayRes = await fetch(`${gw.baseUrl}/api/create-charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "mh-piprapay-api-key": gw.apiKey,
      },
      body: JSON.stringify(postData),
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timeout);
    await markFailed(paymentId);
    return NextResponse.json({ error: "Gateway timeout. Please try again." }, { status: 502 });
  }

  clearTimeout(timeout);

  if (!gatewayRes.ok) {
    await markFailed(paymentId);
    const errText = await gatewayRes.text().catch(() => "Gateway rejected the request.");
    return NextResponse.json({ error: `Gateway rejected the request (${gatewayRes.status}).` }, { status: 502 });
  }

  const gatewayData = await gatewayRes.json();

  if (gatewayData?.pp_url) {
    return NextResponse.json({
      success: true,
      pp_url: gatewayData.pp_url,
      transactionId: orderId,
    });
  }

  await markFailed(paymentId);
  return NextResponse.json({ error: "Gateway returned an invalid response." }, { status: 502 });
}

async function markFailed(paymentId: number) {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "failed" },
  });
}

