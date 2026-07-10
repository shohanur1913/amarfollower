import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, expiresAt } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const key = `af_${crypto.randomBytes(32).toString("hex")}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        key,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, apiKey });
  } catch (error) {
    console.error("Failed to create API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
