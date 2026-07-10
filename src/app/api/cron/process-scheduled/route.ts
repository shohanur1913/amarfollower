import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextOrderId } from "@/lib/order-id";

// This endpoint should be called by an external cron service (e.g., cron-job.org, Vercel Cron, or Coolify)
// It processes scheduled orders that are due

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find scheduled orders that are due
    const dueScheduledOrders = await prisma.scheduledOrder.findMany({
      where: {
        status: "active",
        nextRunAt: { lte: now },
      },
      include: {
        service: true,
        user: true,
      },
    });

    let processedCount = 0;

    for (const scheduled of dueScheduledOrders) {
      try {
        // Check user balance
        const user = await prisma.user.findUnique({
          where: { id: scheduled.userId },
        });

        // Calculate charge from service pricePerK and quantity
        const charge = (Number(scheduled.service.pricePerK) * scheduled.quantity) / scheduled.service.perAmount;

        if (!user || Number(user.balance) < charge) {
          // Skip - insufficient balance, pause the schedule
          await prisma.scheduledOrder.update({
            where: { id: scheduled.id },
            data: { status: "paused" },
          });
          continue;
        }

        // Create the order with custom ID
        await prisma.$transaction(async (tx) => {
          const id = await getNextOrderId(tx);
          await tx.order.create({
            data: {
              id,
              userId: scheduled.userId,
              serviceId: scheduled.serviceId,
              providerId: scheduled.service.providerId,
              link: scheduled.link,
              quantity: scheduled.quantity,
              charge: charge,
              status: "pending",
            },
          });

          await tx.user.update({
            where: { id: scheduled.userId },
            data: { balance: { decrement: charge } },
          });
        });

        // Calculate next run time
        const nextRun = new Date(now.getTime() + scheduled.intervalHours * 60 * 60 * 1000);

        // Update the scheduled order
        await prisma.scheduledOrder.update({
          where: { id: scheduled.id },
          data: {
            nextRunAt: nextRun,
            totalRuns: { increment: 1 },
          },
        });

        processedCount++;
      } catch (error) {
        console.error(`Failed to process scheduled order ${scheduled.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total: dueScheduledOrders.length,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
