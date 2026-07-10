# AmarFollower — Future Plan: Partner/Reseller System (Shopify-like)

**এই ফাইলে আছে সব Partner/Reseller/Child Panel features যেগুলো পরে upgrade হবে।**

> **গুরুত্বপূর্ণ:** এটা একটাই codebase তে implement হবে। আলাদা repo লাগবে না।
> Partner panel routes → `src/app/partner/` তে যোগ হবে
> SysAdmin panel routes → `src/app/admin/` তে থাকবে (ইতিমধ্যে plan.md তে আছে)
> Middleware domain detect করে সঠিক panel দেখাবে

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AMAR FOLLOWER ECOSYSTEM                       │
├──────────────────┬──────────────────┬───────────────────────────────┤
│  SYS ADMIN PANEL │  PARTNER PANEL   │       USER PANEL              │
│  sysadmin.amar-  │  admin.amar-     │  amarfollower.com             │
│  follower.com    │  follower.com    │  (or partner's custom domain) │
├──────────────────┼──────────────────┼───────────────────────────────┤
│ • All services   │ • Own branding   │ • Order placement             │
│ • All orders     │ • Discount pricing│ • Payment                     │
│ • Subscription   │ • Custom domain  │ • Support tickets             │
│   management     │ • Service select │ • Balance management          │
│ • Partner mgmt   │ • User management│                               │
│ • Gateway config │ • Order management│                              │
│ • Provider mgmt  │ • Reports        │                               │
│ • Platform/SaaS  │ • API access     │                               │
│   control        │                  │                               │
└──────────────────┴──────────────────┴───────────────────────────────┘
```

---

## Domain Routing

```
একটাই codebase, একটাই deployment
Middleware detect করবে domain:

amarfollower.com           → User Panel (default)
sysadmin.amarfollower.com  → Admin Panel
admin.amarfollower.com     → Partner Panel (পরে add হবে)
partner.custom-domain.com  → Partner Panel (custom domain, পরে)
```

---

## Phase F1: Database Schema Additions

```prisma
// ============================================
// PARTNER SYSTEM
// ============================================

model Partner {
  id              Int      @id @default(autoincrement())
  userId          Int      @unique @map("user_id")
  subscriptionId  Int?     @map("subscription_id")

  // Branding
  siteName        String   @map("site_name")
  logoUrl         String?  @map("logo_url")
  faviconUrl      String?  @map("favicon_url")
  primaryColor    String   @default("#6366f1") @map("primary_color")

  // Domain
  customDomain    String?  @unique @map("custom_domain")
  subdomain       String?  @unique
  domainVerified  Boolean  @default(false) @map("domain_verified")
  domainDnsVerified Boolean @default(false) @map("domain_dns_verified")

  // Pricing
  discountPercent Decimal  @default(0) @db.Decimal(5, 2) @map("discount_percent")

  // Balance
  balance         Decimal  @default(0) @db.Decimal(12, 2)

  // Limits (from subscription)
  maxUsers        Int      @default(100) @map("max_users")
  maxOrders       Int      @default(1000) @map("max_orders")
  canCustomDomain Boolean  @default(false) @map("can_custom_domain")
  canApiAccess    Boolean  @default(true) @map("can_api_access")

  status          Int      @default(1)
  createdAt       DateTime @default(now()) @map("created_at")
  expiresAt       DateTime? @map("expires_at")

  user            User     @relation(fields: [userId], references: [id])
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
  orders          Order[]
  tickets         Ticket[]
  partnerServices PartnerService[]
  partnerUsers    User[]       @relation("PartnerUsers")
  settings        PartnerSetting[]

  @@map("partners")
}

model PartnerService {
  id          Int      @id @default(autoincrement())
  partnerId   Int      @map("partner_id")
  serviceId   Int      @map("service_id")
  isActive    Boolean  @default(true) @map("is_active")
  customPrice Decimal? @map("custom_price") @db.Decimal(12, 2)

  partner Partner @relation(fields: [partnerId], references: [id])
  service Service @relation(fields: [serviceId], references: [id])

  @@unique([partnerId, serviceId])
  @@map("partner_services")
}

model PartnerSetting {
  id        Int    @id @default(autoincrement())
  partnerId Int    @map("partner_id")
  sKey      String @map("s_key")
  sValue    String @map("s_value")

  partner Partner @relation(fields: [partnerId], references: [id])

  @@unique([partnerId, sKey])
  @@map("partner_settings")
}

// ============================================
// SUBSCRIPTION PLANS
// ============================================

model Subscription {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  displayName     String   @map("display_name")
  description     String?
  price           Decimal  @db.Decimal(12, 2)
  currency        String   @default("BDT")
  intervalDays    Int      @map("interval_days")

  discountPercent Decimal  @default(0) @db.Decimal(5, 2) @map("discount_percent")
  maxUsers        Int      @default(100) @map("max_users")
  maxOrders       Int      @default(1000) @map("max_orders")
  canCustomDomain Boolean  @default(false) @map("can_custom_domain")
  canApiAccess    Boolean  @default(true) @map("can_api_access")
  canMassOrder    Boolean  @default(false) @map("can_mass_order")
  canRecurring    Boolean  @default(false) @map("can_recurring")
  canWhiteLabel   Boolean  @default(false) @map("can_white_label")
  maxServices     Int      @default(50) @map("max_services")

  isActive        Boolean  @default(true) @map("is_active")
  sortOrder       Int      @default(0) @map("sort_order")
  createdAt       DateTime @default(now()) @map("created_at")

  partners        Partner[]

  @@map("subscriptions")
}

model SubscriptionPayment {
  id              Int      @id @default(autoincrement())
  partnerId       Int      @map("partner_id")
  subscriptionId  Int      @map("subscription_id")
  amount          Decimal  @db.Decimal(12, 2)
  status          String   @default("pending")
  transactionId   String?  @map("transaction_id")
  startDate       DateTime @map("start_date")
  endDate         DateTime @map("end_date")
  createdAt       DateTime @default(now()) @map("created_at")

  partner      Partner      @relation(fields: [partnerId], references: [id])
  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@map("subscription_payments")
}
```

---

## Phase F2: Subscription Plans

**Default Plans:**

| Plan | Price | Discount | Max Users | Max Orders | Custom Domain | Max Services |
|---|---|---|---|---|---|---|
| **Free** | ৳0/month | 5% | 50 | 500 | No | 20 |
| **Starter** | ৳500/month | 10% | 200 | 2000 | No | 50 |
| **Business** | ৳1500/month | 20% | 500 | 5000 | Yes | 100 |
| **Enterprise** | ৳5000/month | 35% | Unlimited | Unlimited | Yes | Unlimited |

**SysAdmin UI:**
```
/sysadmin/subscriptions → Plan list + create/edit
/sysadmin/subscriptions → Set: name, price, discount%, limits, features
/sysadmin/subscriptions → Enable/disable plans
```

---

## Phase F3: Partner Registration Flow

```
1. User registers on amarfollower.com (normal user)
2. User goes to /partner/register or clicks "Become a Partner"
3. Selects a subscription plan
4. Pays via payment gateway
5. Gets access to partner panel (admin.amarfollower.com)
6. Sets up branding (logo, colors, site name)
7. Selects which services to offer
8. Connects custom domain (optional)
9. Starts getting users on their panel
```

---

## Phase F4: Custom Domain System (Shopify-like)

### DNS Verification Flow

```
Partner clicks "Connect Domain" in partner panel
  → Enters their domain (e.g., mysmmpanel.com)
  → System generates DNS instructions:
      CNAME: mysmmpanel.com → amarfollower.com
      OR A Record: mysmmpanel.com → Server IP
  → Partner updates DNS at their registrar
  → System verifies DNS (async check via cron)
  → Once verified, domain is active
  → All requests to mysmmpanel.com show that partner's panel
```

### Domain Resolution Code

```typescript
// src/lib/partner-resolver.ts
import { prisma } from './prisma'
import * as dns from 'dns'

export async function resolvePartnerByDomain(hostname: string) {
  const partner = await prisma.partner.findFirst({
    where: {
      OR: [
        { customDomain: hostname },
        { subdomain: hostname.replace('.amarfollower.com', '') }
      ],
      status: 1
    },
    include: { subscription: true }
  })
  return partner
}

export async function verifyDomain(partnerId: number, domain: string) {
  const cname = await dns.promises.resolveCname(domain)
  if (cname.includes('amarfollower.com')) {
    await prisma.partner.update({
      where: { id: partnerId },
      data: { domainDnsVerified: true, domainVerified: true }
    })
    return true
  }

  const a = await dns.promises.resolve4(domain)
  if (a.includes(process.env.COOLIFY_SERVER_IP)) {
    await prisma.partner.update({
      where: { id: partnerId },
      data: { domainDnsVerified: true, domainVerified: true }
    })
    return true
  }

  return false
}

export async function getPartnerDiscount(partnerId: number) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: { subscription: true }
  })
  return partner?.subscription?.discountPercent ?? 0
}

export async function getPartnerPrice(
  partnerId: number,
  basePricePerK: number,
  quantity: number,
  perAmount: number = 1000
) {
  const discount = await getPartnerDiscount(partnerId)
  const discountedPricePerK = basePricePerK * (1 - discount / 100)
  return (discountedPricePerK * quantity) / perAmount
}
```

### Coolify Subdomain (for partners without domain)

```
Partner without custom domain gets:
  → partner.amarfollower.com (subdomain)
  → Or if multiple: partner-name.amarfollower.com
  → Coolify handles reverse proxy to Next.js app
  → Middleware resolves partner by subdomain
```

---

## Phase F5: Partner Service Selection

```
Partner goes to /partner/services
  → Sees ALL services from sysadmin panel
  → Can toggle on/off which services to offer
  → Max services based on subscription plan
  → Can set custom price per service (optional)
  → If no custom price → auto-discounted price from plan
```

**Pricing Logic:**
```
Base Price (from admin): ৳100 per 1000
Partner Discount (from plan): 20%
Partner Price: ৳80 per 1000

If partner sets custom price: ৳90 per 1000
  → Uses custom price instead of discounted price
```

---

## Phase F6: Partner Order Flow

```
1. Partner's user places order on partner's custom domain
2. Order created with partner_id
3. Charge calculated at PARTNER price (discounted)
4. Partner's balance deducted
5. Order forwarded to SMM provider (at admin's base price)
6. Profit = Admin's base price - Partner's discounted price
7. All orders visible in admin panel
8. Partner sees only their orders in their panel
```

---

## Phase F7: Payment Gateway Flow

```
Admin configures gateway (Paymently, etc.)
  → Same gateway works for ALL partners
  → Partner's users pay via same gateway
  → Payment goes to admin's gateway account
  → Admin tops up partner's balance manually or via subscription
  → OR: Partner can have their own gateway (future feature)
```

---

## Phase F8: SysAdmin Partner Management

```
/sysadmin/partners
  → List view: Name, Domain, Plan, Revenue, Users, Orders, Status
  → Actions: View, Edit, Disable, Delete
  → Revenue tracking: Total orders, total revenue, profit margin

/sysadmin/partners/[id]
  → Partner details
  → Subscription info + change plan
  → Balance management (top-up, deduct)
  → Orders list (all orders from this partner)
  → Users list (all users of this partner)
  → Settings override (force discount, disable features)
```

---

## Phase F9: Partner Panel Pages

```
/partner/login            → Partner Login
/partner/dashboard        → Revenue, orders, users, recent activity
/partner/orders           → List orders (with discounted pricing)
/partner/services         → Select which services to offer
/partner/users            → Manage own users
/partner/transactions     → Balance history
/partner/tickets          → Support tickets
/partner/settings         → Site name, logo, colors, currency
/partner/domain           → Connect custom domain, DNS instructions
/partner/appearance       → Logo, favicon, primary color, theme
/partner/api-keys         → Generate API keys
```

---

## Phase F10: Additional Features

### Partner Revenue Dashboard
- Real-time revenue chart (daily, weekly, monthly)
- Profit margin tracking
- User growth chart
- Order volume trends

### Automated Subscription Renewal
- 7 days before expiry → email + in-app notification
- Auto-retry payment on expiry day

### Partner Onboarding Wizard
```
Step 1: Choose plan
Step 2: Payment
Step 3: Set site name + logo
Step 4: Select services
Step 5: Connect domain (or use subdomain)
Step 6: Launch!
```

### Partner API Documentation
- Separate API docs for partners
- Their own API key for their panel

### Coolify Auto-Provisioning
- Partner register → automatically create subdomain in Coolify

### Domain SSL Auto-Setup
- Custom domain verify → automatically generate SSL certificate

### Partner Trial Period
- 7-14 days free trial for new partners

### Bulk Service Import for Partners
- Bulk enable/disable services

---

## Phase F11: .env Configuration

```env
# COOLIFY (Subdomain for partners without domain)
COOLIFY_URL="https://coolify.yourserver.com"
COOLIFY_API_TOKEN="..."
COOLIFY_SERVER_IP="your-server-ip"
```

---

## File Structure (যোগ হবে বিদ্যমান codebase তে)

```
amarfollower-next/src/    ← এটাই বিদ্যমান codebase
├── app/
│   ├── partner/          ← [নতুন] Partner panel pages
│   │   ├── login/page.tsx
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── services/page.tsx
│   │   ├── users/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── domain/page.tsx
│   │   ├── appearance/page.tsx
│   │   └── api-keys/page.tsx
│   └── api/
│       ├── auth/partner/login/route.ts
│       ├── partner/
│       │   ├── orders/route.ts
│       │   ├── services/route.ts
│       │   ├── users/route.ts
│       │   ├── settings/route.ts
│       │   ├── domain/route.ts
│       │   ├── appearance/route.ts
│       │   └── api-keys/route.ts
│       └── sysadmin/
│           ├── partners/route.ts
│           ├── subscriptions/route.ts
│           └── subscription-payments/route.ts
├── lib/
│   ├── partner-resolver.ts
│   ├── partner-pricing.ts
│   └── coolify.ts
└── components/
    ├── sysadmin/
    │   ├── PartnerList.tsx
    │   ├── PartnerDetail.tsx
    │   ├── SubscriptionPlans.tsx
    │   └── SubscriptionPayments.tsx
    └── partner/
        ├── PartnerSidebar.tsx
        ├── PartnerHeader.tsx
        ├── ServiceSelector.tsx
        ├── DomainSetup.tsx
        ├── AppearanceSettings.tsx
        └── RevenueChart.tsx
```

---

## Timeline (When implementing)

| Phase | কাজ | সময় |
|---|---|---|
| F1 | DB Schema additions | 1 day |
| F2 | Subscription Plans | 2 days |
| F3 | Partner Registration | 2 days |
| F4 | Custom Domain System | 3-4 days |
| F5 | Service Selection | 2 days |
| F6 | Partner Order Flow | 2-3 days |
| F7 | Payment Gateway | 1 day |
| F8 | SysAdmin Management | 2-3 days |
| F9 | Partner Panel Pages | 5-6 days |
| F10 | Additional Features | 3-4 days |
| **Total** | | **20-25 days** |

---

## File: `future_plan.md`
## Created: 2026-07-09
## Project: AmarFollower SMM Panel — Future Partner/Reseller System
