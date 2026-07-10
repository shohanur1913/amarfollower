# AmarFollower SMM Panel

Next.js 16 SMM (Social Media Marketing) panel with admin & user dashboards, order management, payment gateway integration, and multi-role access control.

## Tech Stack

| Layer | Stack |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Lucide React |
| Forms | react-hook-form + zod |
| Data Fetching | TanStack React Query |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jose), httpOnly cookies |
| 2FA | otplib (TOTP), QR Code |
| Email | Nodemailer (SMTP) |
| SMS | Twilio |
| Rate Limiting | Upstash Redis |
| Charts | Recharts |
| Animations | animate-ui, CSS transitions |

## Architecture

```
amarfollower.com        → User Panel (17 pages)
sysadmin.amarfollower.com  → Admin Panel (19 pages)

Backend: Next.js API Routes (Node.js) — no separate backend server
Database: PostgreSQL via Prisma ORM
```

## Routes

### Auth & Public

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | User login (Google OAuth, Remember Me) |
| `/register` | User registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Reset password with token |
| `/2fa` | Two-factor authentication |
| `/docs` | API documentation |
| `/maintenance` | Maintenance mode page |

### User Dashboard (`/dashboard`)

| Route | Description |
|---|---|
| `/dashboard` | User dashboard with stats & charts |
| `/services` | Browse SMM services by platform/category |
| `/new-order` | Place a new order |
| `/orders` | Order history |
| `/mass-order` | Bulk order (CSV upload / text input) |
| `/scheduled-orders` | Recurring orders (pause/resume) |
| `/transactions` | Payment history |
| `/add-funds` | Deposit balance |
| `/tickets` | Support tickets |
| `/profile` | Profile settings, 2FA setup, API keys |
| `/apis` | API integration docs & keys |

### Admin Panel (`/admin`)

| Route | Description |
|---|---|
| `/admin/login` | Admin login |
| `/admin/dashboard` | Admin dashboard with metrics |
| `/admin/users` | User management (CRUD, balance) |
| `/admin/orders` | Order management |
| `/admin/services` | Service CRUD |
| `/admin/categories` | Category CRUD |
| `/admin/platforms` | Platform CRUD |
| `/admin/providers` | Provider CRUD |
| `/admin/gateways` | Payment gateway config |
| `/admin/transactions` | All transactions |
| `/admin/tickets` | Support ticket management |
| `/admin/refills` | Refill requests |
| `/admin/settings` | App settings, SMTP, SMS, cron, branding |
| `/admin/cron` | Cron job logs |
| `/admin/import-services` | Import services from provider API |
| `/admin/roles` | Role & permission management |
| `/admin/affiliates` | Affiliate/referral stats |
| `/admin/ip-whitelist` | IP whitelist/blacklist |

## API Routes

All API routes return JSON.

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/platforms` | List platforms |
| GET | `/api/services` | List services |
| GET | `/api/gateways` | List payment gateways |
| GET | `/api/settings` | Public settings |
| GET | `/api/settings/maintenance-status` | Maintenance mode status |

### Authentication

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/admin/forgot-password` | Admin forgot password |
| POST | `/api/auth/admin/reset-password` | Admin reset password |

### User API (requires user-session cookie)

| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/user/orders` | List / place orders |
| POST | `/api/user/mass-order` | Bulk order |
| PATCH | `/api/user/profile` | Update profile |
| GET/POST | `/api/user/tickets` | List / create tickets |
| POST | `/api/user/payments` | Initiate payment |
| POST | `/api/user/refills` | Request refill |
| GET/POST | `/api/user/scheduled` | Recurring orders |
| GET | `/api/user/affiliate` | Referral stats |
| GET | `/api/user/stats` | Dashboard stats |
| GET/POST | `/api/user/api-keys` | API key management |

### Admin API (requires admin-session cookie)

| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/admin/users` | User management |
| GET/POST | `/api/admin/orders` | Order management |
| GET/POST | `/api/admin/services` | Service CRUD |
| GET/POST | `/api/admin/categories` | Category CRUD |
| GET/POST | `/api/admin/platforms` | Platform CRUD |
| GET/POST | `/api/admin/providers` | Provider CRUD |
| POST | `/api/admin/payments` | Payment management |
| GET/POST | `/api/admin/gateways` | Gateway CRUD |
| GET/POST | `/api/admin/tickets` | Ticket management |
| POST | `/api/admin/refills` | Refill management |
| POST | `/api/admin/settings` | Save settings |
| GET/POST | `/api/admin/roles` | Role management |
| GET | `/api/admin/affiliates` | Affiliate stats |
| GET/POST | `/api/admin/ip-whitelist` | IP management |

### v1 API (internal — cookie auth)

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | API login |
| POST | `/api/v1/auth/register` | API register |
| GET | `/api/v1/services` | List services |
| POST | `/api/v1/orders` | Place order |
| POST | `/api/v1/orders/mass` | Mass order |
| GET | `/api/v1/user/balance` | Check balance |

### v2 API (external — for resellers/upstream providers)

Single endpoint: `POST /api/v2`

Auth: `Authorization: Bearer <api_key>` header OR `key=<api_key>` POST body (legacy).

| Action | Params | Response |
|---|---|---|
| `balance` | — | `{ "balance": "100.0000", "currency": "BDT" }` |
| `services` | — | `[{ "service": 1, "name": "...", "type": "Default", "category": "...", "rate": "10.00", "min": 10, "max": 10000, "refill": "true", "cancel": "true" }]` |
| `add` | `service`, `link`, `quantity` | `{ "order": 12345 }` |
| `status` | `order` (single) | `{ "charge": "10.00", "start_count": "0", "status": "Completed", "remains": "0", "currency": "BDT" }` |
| `status` | `orders` (bulk, comma-separated) | `{ "123": { "charge": "...", ... }, "124": { "error": "..." } }` |
| `refill` | `order` | `{ "refill": 1 }` |

Errors: `{ "error": "message" }` (standard SMM panel format)

### Webhooks & Cron

| Method | Path | Description |
|---|---|---|
| POST | `/api/webhooks/paymently` | Payment callback |
| GET | `/api/cron/process-scheduled` | Process scheduled orders (secret) |

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis (Upstash) for rate limiting (optional)

### Installation

```bash
# Clone repo
git clone https://github.com/your-org/amarfollower-next.git
cd amarfollower-next

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run Prisma migrations
npx prisma generate
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start dev server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:

```env
DATABASE_URL           # PostgreSQL connection string
NEXTAUTH_SECRET        # JWT signing secret (generate with: openssl rand -base64 32)
NEXTAUTH_URL           # http://localhost:3000
GOOGLE_CLIENT_ID       # Google OAuth (optional)
GOOGLE_CLIENT_SECRET   # Google OAuth (optional)
GEMINI_API_KEY         # AI ticket assistant (optional)
CAPTCHA_SITE_KEY       # Cloudflare Turnstile (optional)
CAPTCHA_SECRET_KEY     # Cloudflare Turnstile (optional)
EMAIL_HOST/PORT/USER/PASS/FROM  # SMTP settings
TWILIO_SID/TOKEN/PHONE # SMS settings (optional)
UPSTASH_REDIS_REST_URL # Rate limiting (optional)
UPSTASH_REDIS_REST_TOKEN
CRON_SECRET            # Cron job authentication
```

## Auth System

### How Authentication Works

- JWT tokens stored in **httpOnly cookies**
- **`user-session`** cookie for regular users
- **`admin-session`** cookie for admin users
- Token verification happens in `src/proxy.ts` (Next.js 16 middleware/proxy)
- API routes verify their own authentication via `src/lib/api-auth.ts`
- The proxy middleware **skips** `/api/*` routes — they handle auth internally

### Cookie vs API Key

| Scenario | Auth Method |
|---|---|
| Browser (pages) | httpOnly JWT cookie |
| API requests (user) | `user-session` cookie or API key |
| API v2 (legacy) | `Authorization: Bearer <api_key>` header |

## Database

### Models (24 tables)

User, Admin, Platform, Category, Service, Provider, Order, Payment, Gateway, Ticket, TicketMessage, TodoItem, Refill, Setting, CronLog, Role, Referral, AffiliateReward, ScheduledOrder, IpWhitelist, IpBlacklist, ApiKey, EmailLog, SmsLog, NotificationSetting.

### Order ID System

The `Order` model uses a custom auto-incrementing `id` field. A `getNextOrderId()` helper increments a counter in a transaction to ensure gapless sequence.

## Deployment

### Docker (Coolify / any Docker host)

```bash
docker build -t amarfollower-next .
docker run -p 3000:3000 --env-file .env.local amarfollower-next
```

The included `Dockerfile` uses Next.js **standalone output** for a minimal production image (~150MB).

### cPanel (Node.js app)

1. In cPanel → **Setup Node.js App**:
   - Node version: 20.x
   - Application root: `/amarfollower-next`
   - Application URL: `amarfollower.com`
   - Startup file: `server.js` (inside `.next/standalone/`)
2. Upload files or Git clone
3. Install + build:
   ```bash
   npm install && npm run build
   ```
4. Set environment variables in cPanel Node.js app config
5. Restart app

### Manual (VPS)

```bash
npm install
npm run build
npm start  # runs server.js from .next/standalone/
```

### Cron Jobs

Set these in cPanel Cron / Coolify / VPS crontab:

| Schedule | Endpoint |
|---|---|
| `*/5 * * * *` | `/api/cron?action=orders` |
| `0 * * * *` | `/api/cron?action=services` |
| `*/15 * * * *` | `/api/cron?action=scheduled-orders` |

## Scripts

```bash
npm run dev     # Development server (webpack)
npm run build   # Production build
npm start       # Start production server
npm run lint    # ESLint check
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/        # Login, register, forgot-password
│   ├── (dashboard)/   # User dashboard pages
│   ├── admin/         # Admin panel pages
│   ├── api/           # API route handlers
│   ├── docs/          # API documentation page
│   ├── maintenance/   # Maintenance mode page
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/
│   ├── admin/         # Admin-specific components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── lib/               # Utilities, auth, prisma, helpers
└── proxy.ts           # Next.js 16 middleware (auth + routing)
```

## Migrating from PHP/MySQL

The old PHP version is in `old_version/`. The migration plan is in `plan.md`. Partner/reseller system plans are in `future_plan.md`.
