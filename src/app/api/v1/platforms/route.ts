import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      where: { status: 1 },
      include: {
        categories: {
          where: { status: 1 },
          select: {
            id: true,
            name: true,
            sortOrder: true,
            _count: { select: { services: { where: { status: 1, isDeleted: false } } } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const formatted = platforms.map((p) => ({
      id: p.id,
      name: p.name,
      categories: p.categories.map((c) => ({
        id: c.id,
        name: c.name,
        serviceCount: c._count.services,
      })),
    }));

    return apiSuccess(formatted);
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return apiError("Failed to fetch platforms", 500);
  }
}
