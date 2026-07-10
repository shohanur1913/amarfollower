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
      include: {
        _count: { select: { services: true } },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Failed to fetch providers:", error);
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
    const provider = await prisma.provider.create({ data: body });

    return NextResponse.json({ success: true, providerId: provider.id });
  } catch (error) {
    console.error("Failed to create provider:", error);
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
    const { id, name, apiUrl, apiKey, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
    }

    const updated = await prisma.provider.update({
      where: { id: parseInt(id) },
      data: {
        name,
        apiUrl,
        apiKey,
        status: parseInt(status),
      },
    });

    return NextResponse.json({ success: true, providerId: updated.id });
  } catch (error) {
    console.error("Failed to update provider:", error);
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
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
    }

    const serviceCount = await prisma.service.count({ where: { providerId: parseInt(id) } });
    if (serviceCount > 0) {
      return NextResponse.json({ error: `Cannot delete provider with ${serviceCount} services` }, { status: 400 });
    }

    await prisma.provider.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete provider:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
