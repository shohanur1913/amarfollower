import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/amarfollower",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@amarfollower.com";
  const adminPassword = "Admin@123456";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin user already exists:", adminEmail);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      status: "active",
      canOrder: true,
      referralCode,
    },
  });

  console.log("Admin user created:", admin.email);

  const defaultRoles = [
    { name: "admin", displayName: "Administrator", permissions: JSON.stringify(["*"]), isDefault: false, isSystem: true },
    { name: "user", displayName: "User", permissions: JSON.stringify(["order.create", "order.read", "ticket.create", "ticket.read"]), isDefault: true, isSystem: true },
    { name: "staff", displayName: "Staff", permissions: JSON.stringify(["order.read", "ticket.read", "ticket.update"]), isDefault: false, isSystem: false },
    { name: "order_manager", displayName: "Order Manager", permissions: JSON.stringify(["order.read", "order.update", "order.refill"]), isDefault: false, isSystem: false },
    { name: "support_agent", displayName: "Support Agent", permissions: JSON.stringify(["ticket.read", "ticket.update"]), isDefault: false, isSystem: false },
  ];

  for (const role of defaultRoles) {
    const existing = await prisma.role.findUnique({ where: { name: role.name } });
    if (!existing) {
      await prisma.role.create({ data: role });
      console.log("Role created:", role.name);
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
