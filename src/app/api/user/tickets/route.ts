import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      include: {
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

export async function POST(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        subject,
        messages: {
          create: {
            senderRole: "user",
            message,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession("user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, message } = body;

    if (!id || !message) {
      return NextResponse.json({ error: "Ticket ID and message are required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id: parseInt(id), userId: user.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Cannot reply to a closed ticket" }, { status: 400 });
    }

    await prisma.ticketMessage.create({
      data: {
        ticketId: parseInt(id),
        senderRole: "user",
        message,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reply to ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
