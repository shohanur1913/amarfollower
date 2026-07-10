import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        referralCode: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    return NextResponse.json(fullUser);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, phone, currentPassword, newPassword } = body;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (newPassword && currentPassword) {
      const bcrypt = await import("bcryptjs");
      const valid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    const updateData: { username?: string; email?: string; phone?: string | null; password?: string } = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (newPassword) {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    await prisma.user.update({ where: { id: user.id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
