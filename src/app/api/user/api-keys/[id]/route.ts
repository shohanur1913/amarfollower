import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const apiKeyId = parseInt(id);

    if (isNaN(apiKeyId)) {
      return NextResponse.json({ error: "Invalid API key ID" }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });
    if (!apiKey || apiKey.userId !== user.id) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id: apiKeyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
