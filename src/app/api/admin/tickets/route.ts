import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      include: {
        user: { select: { username: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, message, aiMuted } = body;

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const updateData: { status?: string; aiMuted?: boolean } = {};
    if (status !== undefined) updateData.status = status;
    if (aiMuted !== undefined) updateData.aiMuted = aiMuted;

    const ticket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    if (message) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: parseInt(id),
          senderRole: "admin",
          message,
        },
      });
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error("Failed to update ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
