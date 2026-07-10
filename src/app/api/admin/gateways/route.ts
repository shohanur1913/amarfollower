import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gateways = await prisma.gateway.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(gateways);
  } catch (error) {
    console.error("Failed to fetch gateways:", error);
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
    const gateway = await prisma.gateway.create({
      data: {
        name: body.name,
        displayName: body.displayName,
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        currency: body.currency,
        status: parseInt(body.status ?? 1),
      },
    });

    return NextResponse.json({ success: true, gatewayId: gateway.id });
  } catch (error) {
    console.error("Failed to create gateway:", error);
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
    const { id, name, displayName, apiKey, baseUrl, currency, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Gateway ID is required" }, { status: 400 });
    }

    const updated = await prisma.gateway.update({
      where: { id: parseInt(id) },
      data: {
        name,
        displayName,
        apiKey,
        baseUrl,
        currency,
        status: parseInt(status),
      },
    });

    return NextResponse.json({ success: true, gatewayId: updated.id });
  } catch (error) {
    console.error("Failed to update gateway:", error);
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
      return NextResponse.json({ error: "Gateway ID is required" }, { status: 400 });
    }

    await prisma.gateway.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete gateway:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
