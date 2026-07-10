import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.cronLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch cron logs:", error);
    return NextResponse.json([], { status: 500 });
  }
}
