import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceId = Number(id);

    if (isNaN(serviceId)) {
      return apiError("Invalid service ID");
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId, status: 1, isDeleted: false },
      include: {
        category: {
          include: { platform: true },
        },
      },
    });

    if (!service) {
      return apiError("Service not found", 404);
    }

    return apiSuccess({
      id: service.id,
      name: service.name,
      platform: service.category.platform.name,
      categoryId: service.category.id,
      category: service.category.name,
      pricePerK: Number(service.pricePerK),
      perAmount: service.perAmount,
      min: service.min,
      max: service.max,
      startTime: service.startTime,
      speed: service.speed,
      guarantee: service.guarantee,
      quality: service.quality,
      description: service.description,
    });
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return apiError("Failed to fetch service", 500);
  }
}
