import { Prisma } from "@/generated/prisma/client";

const MIN_ID = 2000;
const GAP_MIN = 3;
const GAP_MAX = 15;

export async function getNextOrderId(tx: Prisma.TransactionClient) {
  const result = await tx.$queryRawUnsafe<{ max: number | null }[]>("SELECT MAX(id) as max FROM orders FOR UPDATE");
  const currentMax = result[0]?.max ?? 0;
  const base = Math.max(currentMax, MIN_ID);
  const gap = Math.floor(Math.random() * (GAP_MAX - GAP_MIN + 1)) + GAP_MIN;
  return base + gap;
}
