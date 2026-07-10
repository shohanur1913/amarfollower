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
    const { providerId, platformId, categoryName, apiServiceId, name, price, min, max } = body;

    if (!providerId || !platformId || !apiServiceId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let localCategoryId: number;

    const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryName || "Uncategorized",
        platformId: parseInt(platformId),
      },
    });

    if (existingCategory) {
      localCategoryId = existingCategory.id;
    } else {
      const newCategory = await prisma.category.create({
        data: {
          platformId: parseInt(platformId),
          name: categoryName || "Uncategorized",
          status: 1,
        },
      });
      localCategoryId = newCategory.id;
    }

    const existingService = await prisma.service.findFirst({
      where: {
        providerId: parseInt(providerId),
        apiServiceId: parseInt(apiServiceId),
      },
    });

    if (existingService) {
      const updated = await prisma.service.update({
        where: { id: existingService.id },
        data: {
          name,
          categoryId: localCategoryId,
          pricePerK: parseFloat(price) || existingService.pricePerK,
          min: parseInt(min) || existingService.min,
          max: parseInt(max) || existingService.max,
        },
      });
      return NextResponse.json({ success: true, serviceId: updated.id, action: "updated" });
    }

    const service = await prisma.service.create({
      data: {
        name,
        categoryId: localCategoryId,
        providerId: parseInt(providerId),
        apiServiceId: parseInt(apiServiceId),
        pricePerK: parseFloat(price) || 0,
        min: parseInt(min) || 100,
        max: parseInt(max) || 100000,
        status: 1,
      },
    });

    return NextResponse.json({ success: true, serviceId: service.id, action: "created" });
  } catch (error) {
    console.error("Failed to import service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
