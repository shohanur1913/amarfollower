import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const pageSizeParam = url.searchParams.get("pageSize") || "20";
    const pageSize = pageSizeParam.toLowerCase() === "all" ? Infinity : Number(pageSizeParam);

    const where = { status: 1, isDeleted: false };

    const totalPromise = prisma.service.count({ where });

    const servicesPromise = prisma.service.findMany({
      where,
      include: {
        category: {
          include: { platform: true },
        },
      },
      orderBy: { id: "asc" },
      skip: pageSize === Infinity ? 0 : Math.max(0, (page - 1) * pageSize),
      take: pageSize === Infinity ? undefined : pageSize,
    });

    const [services, total] = await Promise.all([servicesPromise, totalPromise]);

    const totalPages = pageSize === Infinity ? 1 : Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data: services,
      page: pageSize === Infinity ? 1 : page,
      pageSize: pageSize === Infinity ? total : pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { data: [], page: 1, pageSize: 20, total: 0, totalPages: 1 },
      { status: 500 }
    );
  }
}
