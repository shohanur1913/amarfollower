import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const platforms = await prisma.platform.findMany({
      include: {
        _count: { select: { categories: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(platforms);
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.id) {
      const { id, ...data } = body;
      const platform = await prisma.platform.update({
        where: { id: Number(id) },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.icon_class !== undefined && { icon_class: data.icon_class }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
          ...(data.status !== undefined && { status: data.status }),
        },
      });
      return NextResponse.json({ success: true, platformId: platform.id });
    }

    const platform = await prisma.platform.create({ data: body });
    return NextResponse.json({ success: true, platformId: platform.id });
  } catch (error) {
    console.error("Failed to save platform:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    await prisma.platform.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete platform:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
