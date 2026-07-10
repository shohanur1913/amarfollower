import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
