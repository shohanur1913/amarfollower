import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";

// GET /api/v1/tickets — List tickets
export async function GET(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "20")));
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const formatted = tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      createdAt: t.createdAt,
    }));

    return apiPaginated(formatted, { page, pageSize, total, totalPages });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/v1/tickets — Create ticket
export async function POST(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) return apiError("subject and message are required");
    if (message.length < 10) return apiError("Message must be at least 10 characters");

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

    return apiSuccess(
      {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      201
    );
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return apiError("Internal server error", 500);
  }
}
