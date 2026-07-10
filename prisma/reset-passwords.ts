import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/amarfollower",
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "password123";

async function main() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const result = await prisma.user.updateMany({
    where: {
      password: { not: "" },
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log(`Reset ${result.count} user passwords to: ${DEFAULT_PASSWORD}`);
  console.log("Admin password remains: Admin@123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
