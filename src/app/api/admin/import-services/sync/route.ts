import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { providerId, platformId, markup = 20 } = body;

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID required" }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(providerId) },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    let externalServices: Array<{ service: string | number; name: string; category: string; rate: string; min: string | number; max: string | number }> = [];

    try {
      const url = new URL(provider.apiUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      let response: Response;
      try {
        response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: provider.apiKey, action: "services" }),
          signal: controller.signal,
        });
      } catch (sendError) {
        try {
          response = await fetch(url.toString(), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });
        } catch (getError) {
          clearTimeout(timeoutId);
          const message =
            sendError instanceof Error &&
            (sendError.message.includes("aborted") ||
              sendError.name === "AbortError")
              ? "Provider API request timed out after 30s"
              : "Failed to connect to provider API";
          console.error("Provider API sync error:", sendError, getError);
          return NextResponse.json({ error: message }, { status: 502 });
        }
      } finally {
        clearTimeout(timeoutId);
      }

      externalServices = await response.json().catch(() => []);
      if (!Array.isArray(externalServices)) {
        return NextResponse.json({ error: "Invalid provider response" }, { status: 502 });
      }
    } catch {
      return NextResponse.json({ error: "Failed to connect to provider API" }, { status: 502 });
    }

    const usdRateSetting = await prisma.setting.findUnique({ where: { key: "usd_rate" } });
    const usdRate = parseFloat(usdRateSetting?.value || "123");

    const existingServices = await prisma.service.findMany({
      where: { providerId: parseInt(providerId) },
    });

    const externalIds = new Set(externalServices.map((s) => String(s.service)));
    const existingMap = new Map(existingServices.map((s) => [String(s.apiServiceId), s]));

    let created = 0;
    let updated = 0;
    let deleted = 0;

    for (const ext of externalServices) {
      const extId = String(ext.service);
      const existing = existingMap.get(extId);

      const price = ((parseFloat(ext.rate) * usdRate) * (1 + markup / 100)).toFixed(2);

      if (existing) {
        if (existing.pricePerK.toString() !== price || existing.min !== parseInt(String(ext.min)) || existing.max !== parseInt(String(ext.max))) {
          await prisma.service.update({
            where: { id: existing.id },
            data: {
              pricePerK: parseFloat(price),
              min: parseInt(String(ext.min)) || existing.min,
              max: parseInt(String(ext.max)) || existing.max,
            },
          });
          updated++;
        }
      } else {
        if (!platformId) continue;

        let localCategoryId: number;
        const existingCategory = await prisma.category.findFirst({
          where: { name: ext.category || "Uncategorized", platformId: parseInt(platformId) },
        });

        if (existingCategory) {
          localCategoryId = existingCategory.id;
        } else {
          const newCategory = await prisma.category.create({
            data: { platformId: parseInt(platformId), name: ext.category || "Uncategorized", status: 1 },
          });
          localCategoryId = newCategory.id;
        }

        await prisma.service.create({
          data: {
            name: ext.name,
            categoryId: localCategoryId,
            providerId: parseInt(providerId),
            apiServiceId: parseInt(extId),
            pricePerK: parseFloat(price),
            min: parseInt(String(ext.min)) || 100,
            max: parseInt(String(ext.max)) || 100000,
            status: 1,
          },
        });
        created++;
      }
    }

    for (const existing of existingServices) {
      if (existing.apiServiceId && !externalIds.has(String(existing.apiServiceId))) {
        await prisma.service.delete({ where: { id: existing.id } });
        deleted++;
      }
    }

    await prisma.cronLog.create({
      data: {
        action: `sync_provider_${providerId}`,
        result: `Created: ${created}, Updated: ${updated}, Deleted: ${deleted}, External: ${externalServices.length}`,
      },
    });

    return NextResponse.json({
      success: true,
      created,
      updated,
      deleted,
      total: externalServices.length,
    });
  } catch (error) {
    console.error("Failed to sync services:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
