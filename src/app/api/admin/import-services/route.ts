import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providers = await prisma.provider.findMany({
      select: { id: true, name: true, apiUrl: true, apiKey: true },
      where: { status: 1 },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Failed to fetch providers:", error);
    return NextResponse.json([], { status: 500 });
  }
}
