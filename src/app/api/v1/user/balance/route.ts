import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    // Get currency from settings
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["currency_code"] } },
    });
    const currencyMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const currency = (currencyMap.currency_code as string) || "BDT";

    return apiSuccess({
      balance: Number(dbUser?.balance || 0),
      currency,
    });
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return apiError("Internal server error", 500);
  }
}
