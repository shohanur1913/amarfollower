import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [adminCount, userCount, roleCount, settingCount] = await Promise.all([
      prisma.admin.count(),
      prisma.user.count(),
      prisma.role.count(),
      prisma.setting.count(),
    ]);

    return NextResponse.json({
      admins: adminCount,
      users: userCount,
      roles: roleCount,
      settings: settingCount,
      hasAdmin: adminCount > 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
