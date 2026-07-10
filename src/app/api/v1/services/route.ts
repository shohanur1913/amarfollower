import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "20")));
    const platformId = url.searchParams.get("platformId");
    const categoryId = url.searchParams.get("categoryId");
    const search = url.searchParams.get("search");

    const where: Record<string, unknown> = { status: 1, isDeleted: false };

    // Filter by platform
    if (platformId) {
      where.category = { platformId: Number(platformId) };
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    // Search by name
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: {
            include: { platform: { select: { id: true, name: true } } },
          },
        },
        orderBy: { id: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.service.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const formattedServices = services.map((s) => ({
      id: s.id,
      name: s.name,
      platform: s.category.platform.name,
      category: s.category.name,
      pricePerK: Number(s.pricePerK),
      perAmount: s.perAmount,
      min: s.min,
      max: s.max,
      startTime: s.startTime,
      speed: s.speed,
      guarantee: s.guarantee,
      quality: s.quality,
      description: s.description,
    }));

    return apiPaginated(formattedServices, { page, pageSize, total, totalPages });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return apiError("Failed to fetch services", 500);
  }
}
