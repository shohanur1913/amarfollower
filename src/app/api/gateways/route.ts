import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gateways = await prisma.gateway.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        displayName: true,
        currency: true,
        status: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(gateways);
  } catch (error) {
    console.error("Failed to fetch public gateways:", error);
    return NextResponse.json([], { status: 500 });
  }
}
