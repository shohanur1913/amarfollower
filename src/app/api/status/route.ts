import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};

  checks.timestamp = new Date().toISOString();
  checks.node = process.version;
  checks.platform = process.platform;
  checks.memory = process.memoryUsage();

  // Prisma DB check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.db = { status: "ok", latency: `${Date.now() - start}ms` };
  } catch (e) {
    checks.db = { status: "error", message: (e as Error).message };
  }

  // Setting table check
  try {
    const count = await prisma.setting.count();
    checks.settings = { status: "ok", count };
  } catch (e) {
    checks.settings = { status: "error", message: (e as Error).message };
  }

  // User table check
  try {
    const count = await prisma.user.count();
    checks.users = { status: "ok", count };
  } catch (e) {
    checks.users = { status: "error", message: (e as Error).message };
  }

  // Env vars (masked)
  checks.env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✓ set" : "✗ missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✓ set" : "✗ missing",
    DATABASE_URL: process.env.DATABASE_URL ? "✓ set" : "✗ missing",
    SMTP_HOST: process.env.SMTP_HOST ? "✓ set" : "✗ missing",
    CRON_SECRET: process.env.CRON_SECRET ? "✓ set" : "✗ missing",
  };

  const allOk = Object.values(checks).every(
    (v) => typeof v !== "object" || v === null || (v as Record<string, unknown>).status !== "error"
  );

  return NextResponse.json(
    { status: allOk ? "healthy" : "degraded", checks },
    { status: allOk ? 200 : 503 }
  );
}
