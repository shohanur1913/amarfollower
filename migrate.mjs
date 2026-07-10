import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { execSync } from "child_process";
import { readFileSync } from "fs";

const pgAdapter = new PrismaPg({ connectionString: "postgresql://postgres:postgres@localhost:5432/amarfollower" });
const prisma = new PrismaClient({ adapter: pgAdapter });

const MYSQL = "D:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysql.exe";
const DB = "amarfollower";

function mysqlQuery(sql) {
  const result = execSync(`"${MYSQL}" -u root --skip-column-names --batch -e "${sql.replace(/"/g, '\\"')}" ${DB}`, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  return result.trim().split("\n").filter(Boolean);
}

function mysqlQueryTsv(sql) {
  const result = execSync(`"${MYSQL}" -u root --skip-column-names --batch -e "${sql.replace(/"/g, '\\"')}" ${DB}`, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  return result.trim().split("\n").filter(Boolean).map(line => line.split("\t"));
}

console.log("=== MySQL -> PostgreSQL Migration ===\n");

// 1. Platforms
console.log("Migrating platforms...");
const platforms = mysqlQueryTsv("SELECT id, name, IFNULL(icon_class,''), sort_order, status FROM platforms ORDER BY id");
for (const p of platforms) {
  await prisma.platform.upsert({
    where: { id: parseInt(p[0]) },
    update: { name: p[1], iconClass: p[2] || null, sortOrder: parseInt(p[3]), status: parseInt(p[4]) },
    create: { id: parseInt(p[0]), name: p[1], iconClass: p[2] || null, sortOrder: parseInt(p[3]), status: parseInt(p[4]) },
  });
}
console.log(`  -> ${platforms.length} platforms`);

// 2. Categories
console.log("Migrating categories...");
const categories = mysqlQueryTsv("SELECT id, platform_id, name, sort_order, status FROM categories ORDER BY id");
for (const c of categories) {
  await prisma.category.upsert({
    where: { id: parseInt(c[0]) },
    update: { platformId: parseInt(c[1]), name: c[2], sortOrder: parseInt(c[3]), status: parseInt(c[4]) },
    create: { id: parseInt(c[0]), platformId: parseInt(c[1]), name: c[2], sortOrder: parseInt(c[3]), status: parseInt(c[4]) },
  });
}
console.log(`  -> ${categories.length} categories`);

// 3. Providers
console.log("Migrating providers...");
const providers = mysqlQueryTsv("SELECT id, name, api_url, api_key, status FROM providers ORDER BY id");
for (const p of providers) {
  await prisma.provider.upsert({
    where: { id: parseInt(p[0]) },
    update: { name: p[1], apiUrl: p[2], apiKey: p[3], status: parseInt(p[4]) },
    create: { id: parseInt(p[0]), name: p[1], apiUrl: p[2], apiKey: p[3], status: parseInt(p[4]) },
  });
}
console.log(`  -> ${providers.length} providers`);

// 4. Services (batch insert for speed)
console.log("Migrating services (this may take a moment)...");
const services = mysqlQueryTsv("SELECT id, name, category_id, IFNULL(provider_id,0), IFNULL(api_service_id,0), price_per_k, per_amount, min, max, IFNULL(start_time,''), IFNULL(speed,''), IFNULL(guarantee,''), IFNULL(quality,''), status, IFNULL(is_deleted,0) FROM services ORDER BY id");
const serviceBatch = [];
for (const s of services) {
  serviceBatch.push({
    id: parseInt(s[0]), name: s[1], categoryId: parseInt(s[2]),
    providerId: parseInt(s[3]) || null, apiServiceId: parseInt(s[4]) || null,
    pricePerK: parseFloat(s[5]), perAmount: parseInt(s[6]),
    min: parseInt(s[7]), max: parseInt(s[8]),
    startTime: s[9] || null, speed: s[10] || null,
    guarantee: s[11] || null, quality: s[12] || null,
    description: null, status: parseInt(s[13]),
    isDeleted: s[14] === "1",
  });
  if (serviceBatch.length >= 500) {
    await prisma.service.createMany({ data: serviceBatch, skipDuplicates: true });
    serviceBatch.length = 0;
  }
}
if (serviceBatch.length > 0) {
  await prisma.service.createMany({ data: serviceBatch, skipDuplicates: true });
}
console.log(`  -> ${services.length} services`);

// 5. Users
console.log("Migrating users...");
const users = mysqlQueryTsv("SELECT id, username, email, password, balance, role, status, IFNULL(can_order,1), IFNULL(remember_token,''), IFNULL(api_key,''), IFNULL(google_id,''), created_at FROM users ORDER BY id");
for (const u of users) {
  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  await prisma.user.upsert({
    where: { id: parseInt(u[0]) },
    update: {},
    create: {
      id: parseInt(u[0]), username: u[1], email: u[2], password: u[3],
      balance: parseFloat(u[4]), role: u[5], status: u[6],
      canOrder: u[7] === "1", rememberToken: u[8] || null,
      apiKey: u[9] || null, googleId: u[10] || null,
      twoFactorSecret: null, twoFactorEnabled: false,
      referredBy: null, referralCode,
      createdAt: new Date(u[11]),
    },
  });
}
console.log(`  -> ${users.length} users`);

// 6. Gateways
console.log("Migrating gateways...");
const gateways = mysqlQueryTsv("SELECT id, name, display_name, api_key, base_url, currency, status FROM gateways ORDER BY id");
for (const g of gateways) {
  await prisma.gateway.upsert({
    where: { id: parseInt(g[0]) },
    update: { name: g[1], displayName: g[2], apiKey: g[3], baseUrl: g[4], currency: g[5], status: parseInt(g[6]) },
    create: { id: parseInt(g[0]), name: g[1], displayName: g[2], apiKey: g[3], baseUrl: g[4], currency: g[5], status: parseInt(g[6]) },
  });
}
console.log(`  -> ${gateways.length} gateways`);

// 7. Orders
console.log("Migrating orders...");
const orders = mysqlQueryTsv("SELECT id, user_id, service_id, IFNULL(provider_id,0), link, quantity, charge, status, IFNULL(api_order_id,0), created_at FROM orders ORDER BY id");
const orderBatch = [];
for (const o of orders) {
  orderBatch.push({
    id: parseInt(o[0]), userId: parseInt(o[1]), serviceId: parseInt(o[2]),
    providerId: parseInt(o[3]) || null, link: o[4], quantity: parseInt(o[5]),
    charge: parseFloat(o[6]), status: o[7], apiOrderId: parseInt(o[8]),
    startCount: null, remains: "0",
    createdAt: new Date(o[9]),
  });
  if (orderBatch.length >= 500) {
    await prisma.order.createMany({ data: orderBatch, skipDuplicates: true });
    orderBatch.length = 0;
  }
}
if (orderBatch.length > 0) {
  await prisma.order.createMany({ data: orderBatch, skipDuplicates: true });
}
console.log(`  -> ${orders.length} orders`);

// 8. Payments
console.log("Migrating payments...");
const payments = mysqlQueryTsv("SELECT id, user_id, transaction_id, amount, IFNULL(fee_amount,0), gateway, status, created_at FROM payments ORDER BY id");
for (const p of payments) {
  await prisma.payment.upsert({
    where: { id: parseInt(p[0]) },
    update: {},
    create: {
      id: parseInt(p[0]), userId: parseInt(p[1]), transactionId: p[2],
      amount: parseFloat(p[3]), feeAmount: parseFloat(p[4]),
      gateway: p[5], status: p[6], createdAt: new Date(p[7]),
    },
  });
}
console.log(`  -> ${payments.length} payments`);

// 9. Tickets
console.log("Migrating tickets...");
const tickets = mysqlQueryTsv("SELECT id, user_id, subject, status, IF(ai_muted,1,0), created_at FROM tickets ORDER BY id");
for (const t of tickets) {
  await prisma.ticket.upsert({
    where: { id: parseInt(t[0]) },
    update: {},
    create: {
      id: parseInt(t[0]), userId: parseInt(t[1]), subject: t[2],
      status: t[3], aiMuted: t[4] === "1", createdAt: new Date(t[5]),
    },
  });
}
console.log(`  -> ${tickets.length} tickets`);

// 10. Ticket Messages
console.log("Migrating ticket_messages...");
const messages = mysqlQueryTsv("SELECT id, ticket_id, sender_role, message, created_at FROM ticket_messages ORDER BY id");
const msgBatch = [];
for (const m of messages) {
  msgBatch.push({
    id: parseInt(m[0]), ticketId: parseInt(m[1]), senderRole: m[2],
    message: m[3], createdAt: new Date(m[4]),
  });
  if (msgBatch.length >= 500) {
    await prisma.ticketMessage.createMany({ data: msgBatch, skipDuplicates: true });
    msgBatch.length = 0;
  }
}
if (msgBatch.length > 0) {
  await prisma.ticketMessage.createMany({ data: msgBatch, skipDuplicates: true });
}
console.log(`  -> ${messages.length} ticket_messages`);

// 11. Todo List
console.log("Migrating todo_list...");
const todos = mysqlQueryTsv("SELECT id, ticket_id, task_description, IF(is_completed,1,0) FROM todo_list ORDER BY id");
for (const t of todos) {
  await prisma.todoItem.upsert({
    where: { id: parseInt(t[0]) },
    update: {},
    create: { id: parseInt(t[0]), ticketId: parseInt(t[1]), taskDescription: t[2], isCompleted: t[3] === "1" },
  });
}
console.log(`  -> ${todos.length} todo_list`);

// 12. Refills
console.log("Migrating refills...");
const refills = mysqlQueryTsv("SELECT id, user_id, order_id, status, created_at FROM refills ORDER BY id");
for (const r of refills) {
  await prisma.refill.upsert({
    where: { id: parseInt(r[0]) },
    update: {},
    create: { id: parseInt(r[0]), userId: parseInt(r[1]), orderId: parseInt(r[2]), status: r[3], createdAt: new Date(r[4]) },
  });
}
console.log(`  -> ${refills.length} refills`);

// 13. Settings (map old keys to new schema)
console.log("Migrating settings...");
const settings = mysqlQueryTsv("SELECT s_key, s_value FROM settings");
for (const s of settings) {
  await prisma.setting.upsert({
    where: { key: s[0] },
    update: { value: s[1] },
    create: { key: s[0], value: s[1] },
  });
}
console.log(`  -> ${settings.length} settings`);

// 14. Cron Logs (last 5000)
console.log("Migrating cron_logs (last 5000)...");
const crons = mysqlQueryTsv("SELECT id, action, result, created_at FROM cron_logs ORDER BY id DESC LIMIT 5000");
const cronBatch = [];
for (const c of crons) {
  cronBatch.push({
    id: parseInt(c[0]), action: c[1], result: c[2], createdAt: new Date(c[3]),
  });
  if (cronBatch.length >= 500) {
    await prisma.cronLog.createMany({ data: cronBatch, skipDuplicates: true });
    cronBatch.length = 0;
  }
}
if (cronBatch.length > 0) {
  await prisma.cronLog.createMany({ data: cronBatch, skipDuplicates: true });
}
console.log(`  -> ${crons.length} cron_logs`);

// Reset sequences
console.log("\nResetting sequences...");
const seqTables = ["platforms", "categories", "providers", "services", "users", "gateways", "orders", "payments", "tickets", "ticket_messages", "todo_list", "refills", "cron_logs"];
for (const t of seqTables) {
  try {
    await prisma.$queryRawUnsafe(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT MAX(id) FROM ${t}), 1))`);
  } catch {}
}

// Verify
console.log("\n=== Verification ===");
const tables = ["users", "platforms", "categories", "services", "providers", "orders", "payments", "gateways", "tickets", "ticket_messages", "todo_list", "refills", "settings", "cron_logs"];
for (const t of tables) {
  const [result] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM ${t}`);
  console.log(`${t}: ${result.cnt} rows`);
}

await prisma.$disconnect();
console.log("\n=== Migration Complete! ===");
