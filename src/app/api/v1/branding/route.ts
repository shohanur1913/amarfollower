import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

// GET /api/v1/branding — Public endpoint for theme colors, logo, site info
// Used by the Kotlin app (or any client) to sync its colors with the website.
export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "site_name",
            "site_logo",
            "logo_url",
            "favicon_url",
            "primary_color",
            "secondary_color",
            "currency_symbol",
            "currency_code",
          ],
        },
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    return apiSuccess({
      siteName: map.site_name || "AmarFollower",
      logoUrl: map.logo_url || map.site_logo || null,
      faviconUrl: map.favicon_url || null,
      colors: {
        primary: map.primary_color || "#6366f1",
        secondary: map.secondary_color || "#8b5cf6",
      },
      currency: {
        symbol: map.currency_symbol || "৳",
        code: map.currency_code || "BDT",
      },
    });
  } catch (error) {
    console.error("Failed to fetch branding:", error);
    return apiError("Failed to fetch branding", 500);
  }
}
