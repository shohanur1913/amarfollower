import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

// POST /api/v1/tickets/:id/reply — Reply to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const ticketId = Number(id);

    if (isNaN(ticketId)) return apiError("Invalid ticket ID");

    const body = await request.json();
    const { message } = body;

    if (!message || message.length < 1) return apiError("message is required");

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId: user.id },
    });

    if (!ticket) return apiError("Ticket not found", 404);

    if (ticket.status === "closed") return apiError("Cannot reply to a closed ticket");

    const msg = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderRole: "user",
        message,
      },
    });

    return apiSuccess(
      { id: msg.id, senderRole: msg.senderRole, message: msg.message, createdAt: msg.createdAt },
      201
    );
  } catch (error) {
    console.error("Failed to reply to ticket:", error);
    return apiError("Internal server error", 500);
  }
}
