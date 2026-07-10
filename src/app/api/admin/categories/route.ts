import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        platform: true,
        _count: { select: { services: true } },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const category = await prisma.category.create({ data: body });

    return NextResponse.json({ success: true, categoryId: category.id });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, platformId, status, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        platformId: parseInt(platformId),
        status: parseInt(status),
        sortOrder: parseInt(sortOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, categoryId: updated.id });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const serviceCount = await prisma.service.count({ where: { categoryId: parseInt(id) } });
    if (serviceCount > 0) {
      return NextResponse.json({ error: `Cannot delete category with ${serviceCount} services` }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
