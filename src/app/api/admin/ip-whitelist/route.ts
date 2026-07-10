import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [whitelist, blacklist] = await Promise.all([
      prisma.ipWhitelist.findMany({
        include: { user: { select: { id: true, username: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ipBlacklist.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ whitelist, blacklist });
  } catch (error) {
    console.error("Failed to fetch IP list:", error);
    return NextResponse.json({ whitelist: [], blacklist: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ipAddress, reason, label, userId } = body;

    if (type === "blacklist") {
      const entry = await prisma.ipBlacklist.create({
        data: { ipAddress, reason: reason || null },
      });
      return NextResponse.json({ success: true, entry });
    }

    if (type === "whitelist") {
      if (!userId) {
        return NextResponse.json({ error: "userId is required for whitelist" }, { status: 400 });
      }
      const entry = await prisma.ipWhitelist.create({
        data: { userId, ipAddress, label: label || null },
      });
      return NextResponse.json({ success: true, entry });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Failed to manage IP:", error);
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
    const { id, type, isActive, label } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (type === "whitelist") {
      const updated = await prisma.ipWhitelist.update({
        where: { id: parseInt(id) },
        data: {
          isActive: isActive,
          ...(label !== undefined && { label }),
        },
      });
      return NextResponse.json({ success: true, entry: updated });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update IP entry:", error);
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
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (type === "blacklist") {
      await prisma.ipBlacklist.delete({ where: { id: parseInt(id) } });
    } else if (type === "whitelist") {
      await prisma.ipWhitelist.delete({ where: { id: parseInt(id) } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete IP entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
