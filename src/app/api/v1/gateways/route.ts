import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const gateways = await prisma.gateway.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        displayName: true,
        currency: true,
      },
      orderBy: { id: "asc" },
    });

    return apiSuccess(gateways);
  } catch (error) {
    console.error("Failed to fetch gateways:", error);
    return apiError("Failed to fetch gateways", 500);
  }
}
