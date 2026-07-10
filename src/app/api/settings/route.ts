import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["site_name", "site_logo", "logo_url", "favicon_url", "primary_color", "secondary_color", "currency_symbol", "currency_code", "usd_rate", "processing_fee_percent", "google_client_id", "maintenance_mode", "maintenance_title", "maintenance_message", "maintenance_contact", "site_url"] } },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    return NextResponse.json(map);
  } catch {
    return NextResponse.json({});
  }
}
