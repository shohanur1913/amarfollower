import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      where: { status: 1 },
      include: {
        categories: {
          where: { status: 1 },
          include: {
            services: {
              where: { status: 1, isDeleted: false },
              orderBy: { id: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(platforms);
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return NextResponse.json([], { status: 500 });
  }
}
