import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextOrderId } from "@/lib/order-id";

function v2Error(error: string, status: number = 400): Response {
  return Response.json({ error }, { status });
}

function v2Success(data: Record<string, unknown>, status: number = 200): Response {
  return Response.json(data, { status });
}

async function authenticateV2(request: NextRequest): Promise<{
  user: { id: number; balance: number; canOrder: boolean; username: string } | null;
  error: Response | null;
}> {
  // Try Bearer header first (new api_keys table)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice(7).trim();
    if (key) {
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { key },
        include: { user: true },
      });
      if (
        apiKeyRecord?.isActive &&
        apiKeyRecord.user.status === "active" &&
        (!apiKeyRecord.expiresAt || apiKeyRecord.expiresAt > new Date())
      ) {
        prisma.apiKey.update({ where: { id: apiKeyRecord.id }, data: { lastUsed: new Date() } }).catch(() => {});
        return {
          user: { id: apiKeyRecord.userId, balance: Number(apiKeyRecord.user.balance), canOrder: apiKeyRecord.user.canOrder, username: apiKeyRecord.user.username },
          error: null,
        };
      }
      return { user: null, error: v2Error("Authentication failed or account suspended", 401) };
    }
  }

  // Fallback: POST body "key" (legacy support — matches users.api_key)
  try {
    const text = await request.clone().text();
    const params = new URLSearchParams(text);
    const legacyKey = params.get("key") || "";
    if (legacyKey) {
      const user = await prisma.user.findUnique({ where: { apiKey: legacyKey } });
      if (user && user.status === "active") {
        return {
          user: { id: user.id, balance: Number(user.balance), canOrder: user.canOrder, username: user.username },
          error: null,
        };
      }
      return { user: null, error: v2Error("Authentication failed or account suspended", 401) };
    }
  } catch {}

  return { user: null, error: v2Error("Invalid API Key", 401) };
}

async function getBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return await request.clone().json();
    }
    const text = await request.clone().text();
    const params = new URLSearchParams(text);
    const obj: Record<string, unknown> = {};
    for (const [k, v] of params) obj[k] = v;
    return obj;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await authenticateV2(request);
  if (error) return error;
  if (!user) return v2Error("Invalid API Key", 401);

  try {
    const body = await getBody(request);
    const action = (body.action as string) || "";

    if (!action) {
      return v2Error("Invalid Action");
    }

    switch (action) {
      case "balance": {
        return v2Success({
          balance: user.balance.toFixed(4),
          currency: "BDT",
        });
      }

      case "services": {
        const services = await prisma.service.findMany({
          where: { status: 1, isDeleted: false },
          include: { category: { select: { name: true } } },
          orderBy: { id: "asc" },
        });

        const list = services.map((s) => ({
          service: s.id,
          name: s.name,
          type: "Default",
          category: s.category.name,
          rate: Number(s.pricePerK).toFixed(2),
          min: s.min,
          max: s.max,
          refill: s.guarantee ? "true" : "false",
          cancel: "true",
        }));

        return Response.json(list);
      }

      case "add": {
        const serviceId = Number(body.service) || 0;
        const link = (body.link as string) || "";
        const quantity = Number(body.quantity) || 0;

        if (!serviceId || !link || !quantity) {
          return v2Error("Missing parameters. Required: service, link, quantity");
        }

        const service = await prisma.service.findUnique({
          where: { id: serviceId, status: 1, isDeleted: false },
        });
        if (!service) return v2Error("Invalid Service ID", 404);
        if (quantity < service.min || quantity > service.max) {
          return v2Error(`Quantity out of range (Min: ${service.min} Max: ${service.max})`);
        }

        if (!user.canOrder) {
          return v2Error("Your account is restricted from ordering via API");
        }

        const charge = (quantity / service.perAmount) * Number(service.pricePerK);

        if (user.balance < charge) {
          return v2Error("Insufficient balance");
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

        return v2Success({ order: order.id }, 200);
      }

      case "status": {
        const singleOrderId = body.order ? Number(body.order) : 0;
        const bulkOrderIds = body.orders ? String(body.orders) : "";

        if (singleOrderId) {
          const order = await prisma.order.findFirst({
            where: { id: singleOrderId, userId: user.id },
          });
          if (!order) return v2Error("Order not found", 404);

          return v2Success({
            charge: Number(order.charge).toFixed(2),
            start_count: order.startCount || "0",
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            remains: order.remains || "0",
            currency: "BDT",
          });
        }

        if (bulkOrderIds) {
          const ids = bulkOrderIds.split(",").map((s) => Number(s.trim())).filter(Boolean);
          const results: Record<string, unknown> = {};

          for (const id of ids) {
            const order = await prisma.order.findFirst({
              where: { id, userId: user.id },
            });
            if (order) {
              results[String(id)] = {
                charge: Number(order.charge).toFixed(2),
                status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                remains: order.remains || "0",
                start_count: order.startCount || "0",
              };
            } else {
              results[String(id)] = { error: "Order not found" };
            }
          }
          return Response.json(results);
        }

        return v2Error("Missing parameter. Use: order=ID or orders=ID1,ID2,ID3");
      }

      case "refill": {
        const orderId = Number(body.order) || 0;
        if (!orderId) return v2Error("Missing order parameter");

        const order = await prisma.order.findFirst({
          where: { id: orderId, userId: user.id, status: "completed" },
        });
        if (!order) return v2Error("Order not eligible for refill (Must be completed)");

        const refill = await prisma.refill.create({
          data: { userId: user.id, orderId, status: "pending" },
        });

        return v2Success({ refill: refill.id }, 200);
      }

      default:
        return v2Error("Invalid Action");
    }
  } catch (err) {
    console.error("v2 API error:", err);
    return v2Error("Server failed to record order", 500);
  }
}
