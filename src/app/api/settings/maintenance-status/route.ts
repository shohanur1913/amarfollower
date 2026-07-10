import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "maintenance_mode" },
    });

    const response = NextResponse.json({
      maintenance: setting?.value === "on",
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    const response = NextResponse.json({ maintenance: false });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }
}
