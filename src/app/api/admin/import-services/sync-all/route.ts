import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providers = await prisma.provider.findMany({
      where: { status: 1 },
    });

    if (providers.length === 0) {
      return NextResponse.json({ error: "No active providers found" }, { status: 404 });
    }

    const usdRateSetting = await prisma.setting.findUnique({ where: { key: "usd_rate" } });
    const usdRate = parseFloat(usdRateSetting?.value || "120");
    const markup = 20;

    const results: Array<{
      providerId: number;
      providerName: string;
      created: number;
      updated: number;
      deleted: number;
      total: number;
      error?: string;
    }> = [];

    for (const provider of providers) {
      let externalServices: Array<{ service: string | number; name: string; category: string; rate: string; min: string | number; max: string | number }> = [];

      try {
        const url = new URL(provider.apiUrl);
        const response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: provider.apiKey, action: "services" }),
          signal: AbortSignal.timeout(15000),
        });
        externalServices = await response.json();
        if (!Array.isArray(externalServices)) {
          results.push({ providerId: provider.id, providerName: provider.name, created: 0, updated: 0, deleted: 0, total: 0, error: "Invalid response" });
          continue;
        }
      } catch {
        results.push({ providerId: provider.id, providerName: provider.name, created: 0, updated: 0, deleted: 0, total: 0, error: "Connection failed" });
        continue;
      }

      const existingServices = await prisma.service.findMany({
        where: { providerId: provider.id },
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
          const defaultPlatform = await prisma.platform.findFirst({ where: { status: 1 } });
          if (!defaultPlatform) continue;

          let localCategoryId: number;
          const existingCategory = await prisma.category.findFirst({
            where: { name: ext.category || "Uncategorized", platformId: defaultPlatform.id },
          });

          if (existingCategory) {
            localCategoryId = existingCategory.id;
          } else {
            const newCategory = await prisma.category.create({
              data: { platformId: defaultPlatform.id, name: ext.category || "Uncategorized", status: 1 },
            });
            localCategoryId = newCategory.id;
          }

          await prisma.service.create({
            data: {
              name: ext.name,
              categoryId: localCategoryId,
              providerId: provider.id,
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

      results.push({
        providerId: provider.id,
        providerName: provider.name,
        created,
        updated,
        deleted,
        total: externalServices.length,
      });
    }

    const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);

    await prisma.cronLog.create({
      data: {
        action: "sync_all_providers",
        result: `Created: ${totalCreated}, Updated: ${totalUpdated}, Deleted: ${totalDeleted}, Providers: ${results.length}`,
      },
    });

    return NextResponse.json({
      success: true,
      results,
      summary: { created: totalCreated, updated: totalUpdated, deleted: totalDeleted },
    });
  } catch (error) {
    console.error("Failed to sync all services:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
