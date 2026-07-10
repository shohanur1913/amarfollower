import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = await prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Failed to fetch roles:", error);
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
    const { name, displayName, permissions, isDefault } = body;

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        permissions: JSON.stringify(permissions || []),
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ success: true, roleId: role.id });
  } catch (error) {
    console.error("Failed to create role:", error);
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
    const { id, name, displayName, permissions, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        displayName,
        permissions: typeof permissions === "string" ? permissions : JSON.stringify(permissions || []),
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ success: true, roleId: role.id });
  } catch (error) {
    console.error("Failed to update role:", error);
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
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: "Cannot delete system roles" }, { status: 400 });
    }

    const userCount = await prisma.user.count({ where: { roleId: parseInt(id) } });
    if (userCount > 0) {
      return NextResponse.json({ error: `Cannot delete role with ${userCount} users` }, { status: 400 });
    }

    await prisma.role.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
