# AmarFollower — Migration Plan

**বর্তমান:** PHP 8.2 / MySQL (mysqli_*) / Alpine.js / Tailwind CDN
**নতুন:** Next.js 14+ / TypeScript / Prisma ORM / PostgreSQL / shadcn/ui / animate-ui

> Partner/Reseller/Child Panel → `future_plan.md` তে আছে

---

## Architecture

```
একটাই Codebase → একটাই Repo → একটাই Deployment
GitHub: amarfollower-next
Deploy: Coolify (Docker)

sysadmin.amarfollower.com  → Admin Panel
amarfollower.com           → User Panel

Backend: Next.js API Routes (Node.js) — আলাদা backend server লাগে না
Database: PostgreSQL
ORM: Prisma
UI: shadcn/ui + animate-ui.com
```

---

## যে Agent কে বলবে সে যেন এগুলো জানে

### কী বিল্ড করতে হবে

1. **Admin Panel** — `sysadmin.amarfollower.com` (24 pages)
2. **User Panel** — `amarfollower.com` (14 pages)
3. **API Routes** — 35+ endpoints (Node.js, Next.js App Router)
4. **Database** — PostgreSQL via Prisma ORM

### কোন Tools ব্যবহার করতে হবে

| কাজ | Tool |
|---|---|
| UI Components | **shadcn/ui** (NOT tailwind CDN, NOT custom CSS) |
| Animations | **animate-ui.com** (page transitions, hover effects, loading states) |
| Icons | **Lucide React** |
| Charts | **recharts** (shadcn এর সাথে ভালো মানে) |
| Forms | **react-hook-form + zod** |
| Data Fetching | **@tanstack/react-query** |
| Styling | **Tailwind CSS** (via tailwind.config.ts) |

### কোন Tools ব্যবহার করতে হবে না

| Tool | কেন না |
|---|---|
| ~~Alpine.js~~ | React hooks দিয়ে replace |
| ~~Tailwind CDN~~ | tailwind.config.ts থেকে |
| ~~Font Awesome~~ | Lucide React |
| ~~Chart.js~~ | recharts |
| ~~Custom SPA~~ | Next.js App Router |

---

## Phase 0: প্রস্তুতি

### 0.1 — MySQL ব্যাকআপ

```bash
mysqldump -u root amarfollower > amarfollower_mysql_backup.sql
```

### 0.2 — PostgreSQL সেটআপ

```bash
createdb amarfollower
```

---

## Phase 1: Project Setup

### 1.1 — Next.js + সবকিছু ইনস্টল

```bash
npx create-next-app@latest amarfollower-next --typescript --tailwind --app --src-dir
cd amarfollower-next

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label table dialog dropdown-menu
npx shadcn@latest add tabs select textarea badge separator sheet
npx shadcn@latest add avatar popover command navigation-menu
npx shadcn@latest add form use-toast sonner

# animate-ui
npm install animate-ui

# Backend (Node.js — Next.js API Routes)
npm install prisma @prisma/client
npm install bcryptjs @types/bcryptjs
npm install jsonwebtoken @types/jsonwebtoken
npm install zod

# Frontend
npm install @tanstack/react-query lucide-react
npm install recharts
npm install react-hook-form @hookform/resolvers
npm install date-fns

# Features
npm install otplib qrcode           # 2FA
npm install nodemailer @types/nodemailer  # Email
npm install twilio                   # SMS
npm install @upstash/ratelimit @upstash/redis  # Rate limiting

# Init Prisma
npx prisma init
```

### 1.2 — `.env.local`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/amarfollower"

# Auth
NEXTAUTH_SECRET="generate-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI
GEMINI_API_KEY="..."

# Captcha
CAPTCHA_SITE_KEY="..."
CAPTCHA_SECRET_KEY="..."

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="app-password"
EMAIL_FROM="AmarFollower <noreply@amarfollower.com>"

# SMS
TWILIO_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE="+1234567890"

# Redis
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## Phase 2: Database Schema

### Prisma Schema — সব tables

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// EXISTING TABLES
// ============================================

model User {
  id              Int       @id @default(autoincrement())
  username        String    @unique
  email           String    @unique
  password        String
  balance         Decimal   @default(0) @db.Decimal(12, 2)
  role            String    @default("user")
  status          String    @default("active")
  canOrder        Boolean   @default(true)
  rememberToken   String?   @map("remember_token")
  apiKey          String?   @unique @map("api_key")
  googleId        String?   @unique @map("google_id")
  twoFactorSecret String?   @map("two_factor_secret")
  twoFactorEnabled Boolean @default(false) @map("two_factor_enabled")
  referredBy      Int?      @map("referred_by")
  referralCode    String?   @unique @map("referral_code")
  createdAt       DateTime  @default(now()) @map("created_at")

  orders          Order[]
  payments        Payment[]
  tickets         Ticket[]
  refills         Refill[]
  scheduledOrders ScheduledOrder[]
  referrals       Referral[]  @relation("Referrer")
  referredUsers   User[]      @relation("ReferredBy", fields: [referredBy], references: [id])
  ipWhitelists    IpWhitelist[]
  apiKeys         ApiKey[]

  @@map("users")
}

model Platform {
  id        Int        @id @default(autoincrement())
  name      String
  iconClass String?    @map("icon_class")
  sortOrder Int        @default(0) @map("sort_order")
  status    Int        @default(1)

  categories Category[]

  @@map("platforms")
}

model Category {
  id         Int      @id @default(autoincrement())
  platformId Int      @map("platform_id")
  name       String
  sortOrder  Int      @default(0) @map("sort_order")
  status     Int      @default(1)

  platform  Platform  @relation(fields: [platformId], references: [id])
  services  Service[]

  @@map("categories")
}

model Provider {
  id     Int      @id @default(autoincrement())
  name   String
  apiUrl String   @map("api_url")
  apiKey String   @map("api_key")
  status Int      @default(1)

  services Service[]
  orders   Order[]

  @@map("providers")
}

model Service {
  id            Int      @id @default(autoincrement())
  name          String
  categoryId    Int      @map("category_id")
  providerId    Int?     @map("provider_id")
  apiServiceId  Int?     @map("api_service_id")
  pricePerK     Decimal  @map("price_per_k") @db.Decimal(12, 2)
  perAmount     Int      @default(1000) @map("per_amount")
  min           Int
  max           Int
  startTime     String?  @map("start_time")
  speed         String?
  guarantee     String?
  quality       String?
  description   String?
  status        Int      @default(1)
  isDeleted     Boolean  @default(false) @map("is_deleted")

  category  Category   @relation(fields: [categoryId], references: [id])
  provider  Provider?  @relation(fields: [providerId], references: [id])
  orders    Order[]

  @@map("services")
}

model Order {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  serviceId    Int      @map("service_id")
  providerId   Int?     @map("provider_id")
  link         String
  quantity     Int
  charge       Decimal  @db.Decimal(12, 2)
  status       String   @default("pending")
  apiOrderId   Int      @default(0) @map("api_order_id")
  startCount   String?  @map("start_count")
  remains      String?  @default("0")
  createdAt    DateTime @default(now()) @map("created_at")

  user     User      @relation(fields: [userId], references: [id])
  service  Service   @relation(fields: [serviceId], references: [id])
  provider Provider? @relation(fields: [providerId], references: [id])
  refills  Refill[]

  @@map("orders")
}

model Payment {
  id            Int      @id @default(autoincrement())
  userId        Int      @map("user_id")
  transactionId String   @unique @map("transaction_id")
  amount        Decimal  @db.Decimal(12, 2)
  feeAmount     Decimal  @default(0) @map("fee_amount") @db.Decimal(12, 2)
  gateway       String
  status        String   @default("pending")
  createdAt     DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("payments")
}

model Gateway {
  id          Int    @id @default(autoincrement())
  name        String @unique
  displayName String @map("display_name")
  apiKey      String @map("api_key")
  baseUrl     String @map("base_url")
  currency    String
  status      Int    @default(1)

  @@map("gateways")
}

model Ticket {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  subject   String
  status    String   @default("open")
  aiMuted   Boolean  @default(false) @map("ai_muted")
  createdAt DateTime @default(now()) @map("created_at")

  user     User            @relation(fields: [userId], references: [id])
  messages TicketMessage[]
  todoList TodoItem[]

  @@map("tickets")
}

model TicketMessage {
  id         Int      @id @default(autoincrement())
  ticketId   Int      @map("ticket_id")
  senderRole String   @map("sender_role")
  message    String
  createdAt  DateTime @default(now()) @map("created_at")

  ticket Ticket @relation(fields: [ticketId], references: [id])

  @@map("ticket_messages")
}

model TodoItem {
  id              Int      @id @default(autoincrement())
  ticketId        Int      @map("ticket_id")
  taskDescription String   @map("task_description")
  isCompleted     Boolean  @default(false) @map("is_completed")

  ticket Ticket @relation(fields: [ticketId], references: [id])

  @@map("todo_list")
}

model Refill {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  orderId   Int      @map("order_id")
  status    String   @default("pending")
  createdAt DateTime @default(now()) @map("created_at")

  user  User  @relation(fields: [userId], references: [id])
  order Order @relation(fields: [orderId], references: [id])

  @@map("refills")
}

model Setting {
  key   String @id
  value String

  @@map("settings")
}

model CronLog {
  id        Int      @id @default(autoincrement())
  action    String
  result    String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("cron_logs")
}

// ============================================
// NEW TABLES
// ============================================

model Role {
  id          Int    @id @default(autoincrement())
  name        String @unique
  displayName String @map("display_name")
  permissions String @db.Text
  isDefault   Boolean @default(false) @map("is_default")
  isSystem    Boolean @default(false) @map("is_system")

  users User[]

  @@map("roles")
}

model Referral {
  id          Int      @id @default(autoincrement())
  referrerId  Int      @map("referrer_id")
  referredId  Int      @map("referred_id")
  commission  Decimal  @default(0) @db.Decimal(12, 2)
  status      String   @default("pending")
  createdAt   DateTime @default(now()) @map("created_at")

  referrer User @relation("Referrer", fields: [referrerId], references: [id])
  referred User @relation("ReferredBy", fields: [referredId], references: [id])

  @@map("referrals")
}

model AffiliateReward {
  id          Int      @id @default(autoincrement())
  referralId  Int      @map("referral_id")
  amount      Decimal  @db.Decimal(12, 2)
  type        String
  createdAt   DateTime @default(now()) @map("created_at")

  referral Referral @relation(fields: [referralId], references: [id])

  @@map("affiliate_rewards")
}

model ScheduledOrder {
  id              Int      @id @default(autoincrement())
  userId          Int      @map("user_id")
  serviceId       Int      @map("service_id")
  link            String
  quantity        Int
  intervalHours   Int      @map("interval_hours")
  nextRunAt       DateTime @map("next_run_at")
  totalRuns       Int      @default(0) @map("total_runs")
  maxRuns         Int?     @map("max_runs")
  status          String   @default("active")
  createdAt       DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id])
  service Service @relation(fields: [serviceId], references: [id])

  @@map("scheduled_orders")
}

model IpWhitelist {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  ipAddress String   @map("ip_address")
  label     String?
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, ipAddress])
  @@map("ip_whitelists")
}

model IpBlacklist {
  id        Int      @id @default(autoincrement())
  ipAddress String   @unique @map("ip_address")
  reason    String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("ip_blacklists")
}

model ApiKey {
  id         Int       @id @default(autoincrement())
  userId     Int       @map("user_id")
  name       String
  key        String    @unique
  ipWhitelist String?  @map("ip_whitelist")
  isActive   Boolean   @default(true) @map("is_active")
  lastUsed   DateTime? @map("last_used_at")
  createdAt  DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("api_keys")
}

model EmailLog {
  id        Int      @id @default(autoincrement())
  to        String
  subject   String
  body      String   @db.Text
  status    String
  error     String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("email_logs")
}

model SmsLog {
  id        Int      @id @default(autoincrement())
  phone     String
  message   String
  status    String
  error     String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("sms_logs")
}

model NotificationSetting {
  id       Int    @id @default(autoincrement())
  event    String @unique
  email    Boolean @default(true)
  sms      Boolean @default(false)
  inApp    Boolean @default(true) @map("in_app")

  @@map("notification_settings")
}
```

---

## Phase 3: Authentication

### Login — Admin/User আলাদা

```
/admin/login  → Admin Login (আলাদা UI, আলাদা session cookie)
/login        → User Login (Google OAuth + Remember Me)
```

### Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!request.cookies.get('admin-session')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // User protected routes
  const protectedRoutes = ['/dashboard', '/orders', '/new-order', '/mass-order',
    '/transactions', '/tickets', '/profile', '/apis', '/affiliate', '/scheduled-orders']
  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!request.cookies.get('user-session')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
```

---

## Phase 4: API Routes (Backend — Node.js)

### All Endpoints

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login` | POST | No | User login |
| `/api/auth/admin/login` | POST | No | Admin login |
| `/api/auth/register` | POST | No | User register |
| `/api/auth/logout` | POST | No | Logout |
| `/api/auth/google` | POST | No | Google OAuth |
| `/api/auth/2fa/setup` | POST | Yes | 2FA setup |
| `/api/auth/2fa/verify` | POST | Yes | 2FA verify |
| `/api/auth/2fa/disable` | POST | Yes | 2FA disable |
| `/api/user/orders` | POST | Yes | Place order |
| `/api/user/orders` | GET | Yes | Order history |
| `/api/user/mass-order` | POST | Yes | Bulk order |
| `/api/user/profile` | PATCH | Yes | Update profile |
| `/api/user/tickets` | POST | Yes | Create ticket |
| `/api/user/tickets` | GET | Yes | List tickets |
| `/api/user/payments` | POST | Yes | Initiate payment |
| `/api/user/refills` | POST | Yes | Request refill |
| `/api/user/scheduled` | GET/POST | Yes | Recurring orders |
| `/api/user/affiliate` | GET | Yes | Referral stats |
| `/api/v2` | POST | API Key | Public API v2 |
| `/api/admin/users` | GET/POST | Admin | User management |
| `/api/admin/orders` | GET/POST | Admin | Order management |
| `/api/admin/services` | GET/POST | Admin | Service CRUD |
| `/api/admin/categories` | GET/POST | Admin | Category CRUD |
| `/api/admin/platforms` | GET/POST | Admin | Platform CRUD |
| `/api/admin/providers` | GET/POST | Admin | Provider CRUD |
| `/api/admin/payments` | POST | Admin | Payment management |
| `/api/admin/gateways` | GET/POST | Admin | Gateway CRUD |
| `/api/admin/tickets` | POST | Admin | Ticket management |
| `/api/admin/refills` | POST | Admin | Refill management |
| `/api/admin/settings` | POST | Admin | Save settings |
| `/api/admin/import` | POST | Admin | Import services |
| `/api/admin/roles` | GET/POST | Admin | Role management |
| `/api/admin/affiliates` | GET | Admin | Affiliate stats |
| `/api/admin/ip-whitelist` | GET/POST | Admin | IP management |
| `/api/webhooks/paymently` | POST | Webhook | Payment callback |
| `/api/cron` | GET | Secret | Cron jobs |

---

## Phase 5: Frontend

### UI Design System

```
shadcn/ui components:
  - Button, Card, Input, Label, Table, Dialog
  - Tabs, Select, Textarea, Badge, Separator
  - Sheet, Avatar, Popover, Command
  - NavigationMenu, Form, Toast, Sonner

animate-ui.com animations:
  - Page transitions (fade, slide, scale)
  - Hover effects on cards/buttons
  - Loading skeletons
  - Toast notifications animation
  - Modal/Dialog enter/exit
  - Table row hover effects
  - Sidebar collapse animation
```

### User Panel Pages (14)

| Page | Route | File |
|---|---|---|
| Landing | `/` | `src/app/page.tsx` |
| Login | `/login` | `src/app/(auth)/login/page.tsx` |
| Register | `/register` | `src/app/(auth)/register/page.tsx` |
| Forgot Password | `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` |
| Dashboard | `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` |
| Services | `/services` | `src/app/(dashboard)/services/page.tsx` |
| New Order | `/new-order` | `src/app/(dashboard)/new-order/page.tsx` |
| Mass Order | `/mass-order` | `src/app/(dashboard)/mass-order/page.tsx` |
| Orders | `/orders` | `src/app/(dashboard)/orders/page.tsx` |
| Transactions | `/transactions` | `src/app/(dashboard)/transactions/page.tsx` |
| Tickets | `/tickets` | `src/app/(dashboard)/tickets/page.tsx` |
| View Ticket | `/view-ticket` | `src/app/(dashboard)/view-ticket/page.tsx` |
| Profile | `/profile` | `src/app/(dashboard)/profile/page.tsx` |
| API Docs | `/apis` | `src/app/(dashboard)/apis/page.tsx` |
| Affiliate | `/affiliate` | `src/app/(dashboard)/affiliate/page.tsx` |
| Scheduled Orders | `/scheduled-orders` | `src/app/(dashboard)/scheduled-orders/page.tsx` |

### Admin Panel Pages (24)

| Page | Route | File |
|---|---|---|
| Login | `/admin/login` | `src/app/admin/login/page.tsx` |
| Dashboard | `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` |
| Users | `/admin/users` | `src/app/admin/users/page.tsx` |
| Orders | `/admin/orders` | `src/app/admin/orders/page.tsx` |
| Services | `/admin/services` | `src/app/admin/services/page.tsx` |
| Categories | `/admin/categories` | `src/app/admin/categories/page.tsx` |
| Platforms | `/admin/platforms` | `src/app/admin/platforms/page.tsx` |
| Providers | `/admin/providers` | `src/app/admin/providers/page.tsx` |
| Transactions | `/admin/transactions` | `src/app/admin/transactions/page.tsx` |
| Gateways | `/admin/gateways` | `src/app/admin/gateways/page.tsx` |
| Tickets | `/admin/tickets` | `src/app/admin/tickets/page.tsx` |
| Refills | `/admin/refills` | `src/app/admin/refills/page.tsx` |
| Settings | `/admin/settings` | `src/app/admin/settings/page.tsx` |
| Cron | `/admin/cron` | `src/app/admin/cron/page.tsx` |
| Import Services | `/admin/import-services` | `src/app/admin/import-services/page.tsx` |
| Roles | `/admin/roles` | `src/app/admin/roles/page.tsx` |
| Affiliates | `/admin/affiliates` | `src/app/admin/affiliates/page.tsx` |
| IP Whitelist | `/admin/ip-whitelist` | `src/app/admin/ip-whitelist/page.tsx` |

---

## Phase 6: New Features

### 6.1 — Multi-Role System
- Roles: admin, user, staff, order_manager, support_agent
- Permissions JSON per role
- Admin assigns roles

### 6.2 — Mass Order
- Format: `service_id | link | quantity` (one per line)
- CSV upload
- Real-time validation

### 6.3 — Recurring Orders
- Interval in hours
- Max runs limit
- Pause/Resume

### 6.4 — Affiliate/Referral
- Unique referral code
- Commission on deposits + orders
- Admin configurable rates

### 6.5 — Email Notifications
- Order events, payment events, ticket events
- SMTP configurable
- Admin enable/disable per event

### 6.6 — SMS Notifications
- Same events as email
- Twilio integration

### 6.7 — Two-Factor Auth
- Google Authenticator (TOTP)
- QR code setup
- Backup codes

### 6.8 — IP Whitelist/Blacklist
- Per API key whitelist
- Global blacklist

### 6.9 — Order Delay
- "Start After X hours" option

---

## Phase 7: Security Fixes

| Fix | How |
|---|---|
| CSRF | Next.js CSRF tokens |
| Cron auth | Secret token |
| Session fixation | JWT regenerate on login |
| Remember-me | Token rotate on login |
| Rate limiting | @upstash/ratelimit |
| XSS | React auto-escape |
| SQL injection | Prisma ORM |
| Admin CAPTCHA | Cloudflare Turnstile |

---

## Phase 8: Testing

```bash
# Data count verification
mysql -u root -e "SELECT 'users', COUNT(*) FROM amarfollower.users UNION ALL SELECT 'orders', COUNT(*) FROM amarfollower.orders;"
psql -d amarfollower -c "SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'orders', COUNT(*) FROM orders;"
```

Test checklist:
- [ ] Admin login → admin-session cookie
- [ ] User login → user-session cookie
- [ ] Admin cannot access user panel
- [ ] All CRUD operations work
- [ ] Mass order places multiple orders
- [ ] Recurring orders auto-run
- [ ] Email notifications send
- [ ] 2FA setup + login works
- [ ] Rate limiting active
- [ ] API v2 backward compatible

---

## Phase 9: Deploy (Coolify)

```bash
# GitHub repo
git init && git add . && git commit -m "init"
git remote add origin https://github.com/user/amarfollower-next.git
git push -u origin main

# Coolify setup
1. Add repository in Coolify
2. Set build command: npm run build
3. Set start command: npm start
4. Add domain: amarfollower.com
5. Add domain: sysadmin.amarfollower.com
6. Enable auto SSL
7. Set environment variables from .env.local
8. Deploy
```

### Cron Jobs (Vercel/Coolify)

```json
{
  "crons": [
    { "path": "/api/cron?action=orders", "schedule": "*/5 * * * *" },
    { "path": "/api/cron?action=services", "schedule": "0 * * * *" },
    { "path": "/api/cron?action=scheduled-orders", "schedule": "*/15 * * * *" }
  ]
}
```

---

## Phase 10: Migration

```
Week 1-2:  Setup + Auth + DB migration
Week 3-4:  API Routes (all 35+)
Week 5-6:  Frontend (admin + user, shadcn + animate-ui)
Week 7-8:  New features (2FA, email, mass order, etc.)
Week 9:    Testing
Week 10:   Deploy + DNS switch
```

### DNS Switch

1. PHP maintenance mode on
2. Final MySQL → PostgreSQL sync
3. Update DNS A/CNAME records
4. Monitor 24-48 hours
5. Keep PHP code 1 month for rollback

---

## Timeline

| Phase | কাজ | সময় |
|---|---|---|
| 0 | Backup + PostgreSQL | 1 day |
| 1 | Project setup + packages | 1 day |
| 2 | Prisma schema + migration | 2 days |
| 3 | Authentication | 3 days |
| 4 | API Routes | 5 days |
| 5 | Frontend (shadcn + animate-ui) | 8 days |
| 6 | New features | 7 days |
| 7 | Security | parallel |
| 8 | Testing | 3 days |
| 9 | Deploy | 1 day |
| **Total** | | **25-30 days** |

---

## Commands for Agent

এই commands দিয়ে agent কে বলো শুরু করতে:

```
"plan.md follow করো — Phase 0 দিয়ে শুরু করো"
"Phase 1 setup করো"
"Phase 2 Prisma schema implement করো"
"Phase 3 authentication build করো"
"Phase 4 API routes build করো"
"Phase 5 frontend build করো — shadcn/ui + animate-ui ব্যবহার করো"
"Phase 6 new features add করো"
"Phase 8 testing করো"
"Phase 9 deploy setup করো"
```

---

## File: `plan.md`
## Updated: 2026-07-09
## Project: AmarFollower SMM Panel Migration
