import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      include: {
        category: { include: { platform: true } },
        provider: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
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
    const service = await prisma.service.create({ data: body });

    return NextResponse.json({ success: true, serviceId: service.id });
  } catch (error) {
    console.error("Failed to create service:", error);
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
    const { id, name, categoryId, providerId, pricePerK, min, max, status, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const updated = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name,
        categoryId: parseInt(categoryId),
        providerId: providerId ? parseInt(providerId) : null,
        pricePerK: parseFloat(pricePerK),
        min: parseInt(min),
        max: parseInt(max),
        status: parseInt(status),
        description,
      },
    });

    return NextResponse.json({ success: true, serviceId: updated.id });
  } catch (error) {
    console.error("Failed to update service:", error);
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
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
