import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

// GET /api/v1/tickets/:id — Ticket with messages
export async function GET(
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

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId: user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!ticket) return apiError("Ticket not found", 404);

    return apiSuccess({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      messages: ticket.messages.map((m) => ({
        id: m.id,
        senderRole: m.senderRole,
        message: m.message,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch ticket:", error);
    return apiError("Internal server error", 500);
  }
}
