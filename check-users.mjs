import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: "postgresql://postgres:postgres@localhost:5432/amarfollower" });
const prisma = new PrismaClient({ adapter });

const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true, username: true, email: true, role: true, status: true } });
console.log("Admin users:");
admins.forEach(u => console.log("  ", u.id, u.username, u.email, u.role, u.status));

const users = await prisma.user.findMany({ where: { role: "user" }, take: 3, select: { id: true, username: true, email: true, role: true, status: true, balance: true } });
console.log("\nRegular users (first 3):");
users.forEach(u => console.log("  ", u.id, u.username, u.email, u.role, u.status, "balance:" + u.balance));

await prisma.$disconnect();
