# AmarFollower Kotlin App — Interface Specification

> This document defines the complete page structure, navigation, and design system for the AmarFollower mobile app (Kotlin + Jetpack Compose).

---

## 1. App Architecture

```
Base URL:     https://amarfollower.com
API Version:  v1
Auth:         Bearer token (Authorization header)
Animation:    Lottie + Compose implicit animations
```

### Tech Stack
- **Language:** Kotlin
- **UI:** Jetpack Compose + Material 3
- **Networking:** Retrofit + Moshi/Gson
- **Auth:** JWT Bearer token (stored in EncryptedSharedPreferences)
- **Images:** Coil/Glide (with caching)
- **Charts:** Vico/MPAndroidChart
- **Animations:** Lottie Compose (success/error animations)
- **State:** ViewModel + StateFlow

### Design System (Matches Web App)
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#6366f1` (Indigo) | Headers, active nav, CTAs |
| Primary Light | `#6366f1/10` | Active backgrounds, badges |
| Secondary | `#8b5cf6` (Purple) | Gradients, accents |
| Success | `#10b981` (Emerald) | Success states, positive balance |
| Warning | `#f59e0b` (Amber) | Pending, warnings |
| Danger | `#ef4444` (Red) | Errors, delete, low balance |
| Background | `#f8fafc` (Slate-50) | Screen backgrounds |
| Surface | `#ffffff` | Cards, sheets |
| Text Primary | `#0f172a` (Slate-900) | Headings, primary text |
| Text Secondary | `#64748b` (Slate-500) | Subtitles, metadata |
| Text Muted | `#94a3b8` (Slate-400) | Placeholders, disabled |
| Border | `#e2e8f0` (Slate-200) | Dividers, card borders |
| Radius | `8dp` | Cards, buttons |
| Radius LG | `12dp` | Modals, sheets |
| Font | System default (San Francisco / Roboto) | Body text |
| Font Mono | `Fira Code` / `Consolas` | Code, API responses |

### Color Sync
On app launch, call `GET /api/v1/branding` to sync `primary_color` and `secondary_color` from the server. Admin can change colors from Settings → Branding; the app picks up the new colors automatically.

---

## 2. Page Inventory

### Complete List of Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | **Dashboard** | `/dashboard` | Home screen with stats, balance, quick actions, recent orders |
| 2 | **Services** | `/services` | Browse service catalog (platform → category → service) |
| 3 | **New Order** | `/new-order` | Place a new order (select service, link, quantity) |
| 4 | **Orders** | `/orders` | Order history with status filters |
| 5 | **Add Funds** | `/add-money` | Deposit money (select gateway, enter amount) |
| 6 | **Transactions** | `/transactions` | Payment & top-up history |
| 7 | **Support Tickets** | `/tickets` | Support ticket list + create new |
| 8 | **Affiliate** | `/affiliate` | Referral code, earnings, referred users |
| 9 | **API Keys** | `/api-keys` | Manage API keys |
| 10 | **All Documents** | `/all-documents` | Order receipt, transaction receipt, refund receipt |
| 11 | **Profile** | *(bottom sheet, not standalone)* | User profile info (opens via bottom nav) |

### Pages NOT in the App
| Page | Reason |
|------|--------|
| `/admin/*` | Admin panel — web only |
| `/docs` | External developers — web only |
| `/mass-order` | Merged into Orders screen |
| `/scheduled-orders` | Merged into Orders screen (filter by "scheduled") |
| `/api-keys` | Kept — users might need it on the go |

---

## 3. Bottom Navigation Bar

### Layout (5 tabs, centered)

```
┌─────────────────────────────────────────────┐
│                                             │
│           [Screen Content Area]             │
│                                             │
│                                             │
├──────┬──────┬──────┬──────┬────────────────┤
│      │      │   +  │      │                 │
│ 🎧   │  💰   │ DASH │ 📦   │  👤             │
│      │      │      │      │                 │
│support│ funds │board│orders│ profile         │
└──────┴──────┴──────┴──────┴────────────────┘
```

### Bottom Nav Items

| Position | Label | Icon | Active Color | Route |
|----------|-------|------|-------------|-------|
| Far Left | Support | Headset / LifeBuoy | Primary | `/tickets` |
| Left | Funds | Wallet | Primary | `/add-money` |
| **Center** | **(no label)** | **Plus/Circle** | **Primary + halo** | **`/dashboard`** |
| Right | Orders | ShoppingBag / Package | Primary | `/orders` |
| Far Right | Profile | User | Primary | *opens sheet* |

### Center Button Design (Dashboard Primary)
- Circular FAB-style button, slightly **overflowing** 8dp above the nav bar
- Background: `primary` gradient
- Icon: `+` (Plus) inside a circle
- Slight pulse animation on idle (scale 1.0 → 1.05 → 1.0, repeat)
- Tap → navigate to `/dashboard`
- Shadow: `0 4dp 8dp primary/30`

### Nav Bar Properties
- Height: `80dp` (including FAB overflow area = `56dp` nav + `24dp` FAB above)
- Background: `surface` with top border `1dp border`
- Elevation: `8dp`
- Active icon tint: `primary`
- Inactive icon tint: `text.muted`
- Clip content to avoid nav overlap: `padding-bottom = 80dp`

### Pull-Up Profile Sheet
- **Trigger:** Long-press or swipe-up on the Profile (far-right) nav icon
- **Behavior:** Bottom sheet slides up with drag handle
- **Sheet content:**
  - User avatar + name + email (header)
  - Divider
  - Quick links: Transactions, Affiliate, Services, API Keys
  - Divider
  - Settings (theme, notifications)
  - Divider
  - Logout button (destructive)
- **Animation:** `ModalBottomSheet` with `skipPartiallyExpanded = true`, spring animation

```kotlin
// Profile sheet content structure
Column(
  modifier = Modifier
    .navigationBarsPadding() // respect system nav bar
    .padding(horizontal = 16.dp, vertical = 8.dp)
) {
  // Header: Avatar + Name + Email
  ProfileHeader(user)

  Divider(modifier = Modifier.padding(vertical = 12.dp))

  // Quick links
  SheetMenuItem(icon = Icons.Default.Receipt, label = "Transactions", route = "/transactions")
  SheetMenuItem(icon = Icons.Default.People, label = "Affiliate", route = "/affiliate")
  SheetMenuItem(icon = Icons.Default.Store, label = "Services", route = "/services")
  SheetMenuItem(icon = Icons.Default.Code, label = "API Keys", route = "/api-keys")

  Divider(modifier = Modifier.padding(vertical = 12.dp))

  SheetMenuItem(icon = Icons.Default.Settings, label = "Settings", route = "/settings")
  SheetMenuItem(icon = Icons.Default.Brightness4, label = "Dark Mode", isToggle = true)

  Divider(modifier = Modifier.padding(vertical = 12.dp))

  SheetMenuItem(
    icon = Icons.Default.Logout,
    label = "Logout",
    isDestructive = true,
    onClick = { /* logout flow */ }
  )
}
```

---

## 4. Screen Specifications

### 4.1 Dashboard

**Route:** `/dashboard`

**Layout:**
- Top: AppBar with greeting + notification bell
- Balance Card (prominent, gradient background)
- Quick Action Grid (4 icons: New Order, Add Funds, Orders, Services)
- Recent Orders (horizontal scroll or list of last 5)
- Stats Row (total orders, total spend, pending orders)
- Bottom: Promo banner (optional)

**Balance Card:**
```
┌──────────────────────────────────────┐
│  Welcome back, [username]!           │
│                                      │
│  Available Balance                   │
│  ৳ 1,250.00                         │
│                                      │
│  [Add Funds]  [New Order]            │
└──────────────────────────────────────┘
```

**Animations:**
- Balance number: `animateFloat` count-up on entry
- Quick actions: staggered entrance (`LaunchedEffect` with `delay` per item)

### 4.2 Services (Catalog)

**Route:** `/services`

**Layout:**
- Top: Search bar
- Platform chips (horizontal scroll: Instagram, TikTok, YouTube, etc.)
- Service list grouped by platform/category
- Each service card: name, price, min/max, delivery info

**Service Card:**
```
┌──────────────────────────────────────┐
│  Instagram Followers [Real][HQ]      │
│  Followers • Price: ৳0.12/K         │
│  Min: 50  Max: 10,000               │
│  ⚡ Starts in 0-1 hour               │
│  🛡️ 30 days guarantee                 │
│                                      │
│  [Order Now →]                       │
└──────────────────────────────────────┘
```

**Search/Filter:**
- Real-time search via API (`?search=` param)
- Filter by platform (chips)
- Sort by: Popular, Price Low→High, Price High→Low, Newest

### 4.3 New Order

**Route:** `/new-order`

**Flow:**
1. Select platform (chips)
2. Select category (list)
3. Select service (searchable list)
4. Enter link (URL input with validation)
5. Enter quantity (number input with min/max hint)
6. See calculated price in real-time
7. Confirm → order placed → success animation

**Price Calculation Display:**
```
Service: Instagram Followers [Real][HQ]
Link:   [https://instagram.com/user___]
Qty:    [500]

Cost: (500 / 1000) × ৳120.00 = ৳60.00
Your Balance: ৳1,250.00
After Order: ৳1,190.00

         [Place Order →]
```

**Success Animation (Order Placed):**
- Full-screen Lottie animation (checkmark + confetti) for 2.5 seconds
- Then auto-navigates to Orders screen
- Overlay text: "Order Placed Successfully!"
- Bottom: "View Order →" button

### 4.4 Orders

**Route:** `/orders`

**Layout:**
- Top: Tab filters (All, Pending, Processing, Completed, Cancelled)
- Order list: each item shows service name, link, quantity, charge, status badge, date

**Order Item:**
```
┌──────────────────────────────────────┐
│  Instagram Followers [Real][HQ]      │
│  🔗 instagram.com/user              │
│  📦 500 followers    ৳60.00         │
│  🔄 Status: Completed    Jul 8, 2026 │
│                                      │
│  [Details]  [Reorder]                │
└──────────────────────────────────────┘
```

**Status Colors:**
| Status | Color |
|--------|-------|
| Pending | `warning` (amber) |
| Processing | `info` (blue) |
| Completed | `success` (green) |
| Cancelled | `danger` (red) |

### 4.5 Add Funds

**Route:** `/add-money`

**Layout:**
- Gateway selector (horizontal scroll of cards)
- Amount input with quick-select chips (৳50, ৳100, ৳200, ৳500, Custom)
- Fee calculation display
- Payment summary
- Confirm button

**Flow:**
1. User selects gateway (e.g., bKash, Nagad, Rocket)
2. User enters amount
3. System calculates: `finalAmount = amount + fee`
4. User confirms → calls `POST /api/v1/payments`
5. Shows gateway instructions + transaction ID
6. Redirects to gateway (opens WebView or deep link)
7. Callback from gateway → success animation

**Gateway Callback WebView:**
```
WebView screen opens with:
- Payment gateway checkout page
- User completes payment on gateway
- WebView captures callback URL
- App intercepts callback, verifies payment via API
- Shows success/failure animation
```

**Success Animation (Funds Added):**
- Full-screen Lottie animation (money bag + checkmark) for 2 seconds
- Overlay: "৳X.XX Added to Your Wallet!"
- Auto-navigates to Dashboard after animation

### 4.6 Transactions

**Route:** `/transactions`

**Layout:**
- Filter chips: All, Completed, Pending, Failed
- Transaction list with date, type (deposit/order/refund), amount, status

**Transaction Item:**
```
┌──────────────────────────────────────┐
│  Add Funds — bKash                   │
│  TXN-1720520000000-AB12CD           │
│  ৳500.00    ✅ Completed    Jul 9    │
└──────────────────────────────────────┘
```

### 4.7 Support Tickets

**Route:** `/tickets`

**Layout:**
- Top: "New Ticket" FAB
- Ticket list: subject, status, date, last message preview

**Create Ticket:**
- Subject input
- Message textarea (min 10 chars)
- Submit → creates ticket → navigates to ticket detail

**Ticket Detail:**
- Header: subject + status badge
- Message thread (chat-style, user right, admin left)
- Reply input at bottom

### 4.8 Affiliate

**Route:** `/affiliate`

**Layout:**
- Referral code card (with copy button)
- Total earnings + available balance
- Referral link (with share button)
- Stats: total referrals, pending commissions
- Referred users list

**Referral Card:**
```
┌──────────────────────────────────────┐
│  Your Referral Code                  │
│                                      │
│  AF42XYZ                    [📋 Copy] │
│                                      │
│  https://amarfollower.com/register?ref=AF42XYZ
│                                      │
│  [🔗 Share]                          │
└──────────────────────────────────────┘
```

### 4.9 API Keys

**Route:** `/api-keys`

**Layout:**
- API key list (name, key string, created date, last used)
- Create key button → dialog with name input
- Delete key button with confirmation
- Link to full docs

**Key Item:**
```
┌──────────────────────────────────────┐
│  My App Key                          │
│  af_abcd1234...xyz                   │
│  Created: Jul 1, 2026  | Last used: Jul 8 │
│                              [🗑 Delete] │
└──────────────────────────────────────┘
```

### 4.10 All Documents

**Route:** `/all-documents`

**Layout:**
- Document categories (tabs): Orders, Payments, Refunds
- Document list with date, type, amount, document ID
- Tap to view → opens full-screen receipt view

**Document Types:**
| Type | Content |
|------|---------|
| Order Receipt | Order ID, service, link, quantity, charge, date, status |
| Payment Receipt | Transaction ID, gateway, amount, fee, date, status |
| Refund Receipt | Refund ID, order ID, amount, reason, date |

**Receipt View:**
- Branded header (logo + site name)
- Document details section
- QR code with document ID (for verification)
- Share + Download PDF buttons

### 4.11 Profile (Bottom Sheet)

**Trigger:** Long-press or swipe-up on Profile icon in bottom nav

**Sheet Structure (see Section 3 for Kotlin code):**
1. Profile Header (avatar + name + email)
2. Menu: Transactions, Affiliate, Services, API Keys
3. Setting: Dark Mode toggle
4. Logout (destructive)

---

## 5. Animations

### 5.1 Order Success Animation
```
┌──────────────────────────────────────┐
│                                      │
│          [Lottie: Checkmark]         │
│         + Confetti particles         │
│                                      │
│       Order Placed Successfully!     │
│                                      │
│       Order ID: #1024               │
│                                      │
│      [View Orders →]                 │
│                                      │
└──────────────────────────────────────┘
```
- Full screen overlay, dark semi-transparent background
- Center: Lottie animation (2s)
- Text appears after animation (fade-in, 300ms delay)
- Duration: 2.5s total
- Auto-dismiss → navigate to Orders

### 5.2 Add Funds Success Animation
```
┌──────────────────────────────────────┐
│                                      │
│        [Lottie: Money/Coin]          │
│         + Sparkle particles          │
│                                      │
│       ৳500.00 Added to Wallet!       │
│                                      │
│      New Balance: ৳1,750.00          │
│                                      │
│      [Back to Home →]                │
│                                      │
└──────────────────────────────────────┘
```
- Full screen overlay
- Center: Lottie animation (1.5s)
- Amount text with counting animation
- Duration: 2s total

### 5.3 Pull-Up Sheet Animation
```
┌──────────────────────────────────────┐
│  ─── drag handle ───                 │
│                                      │
│  👤  [username]                      │
│      user@example.com                │
│                                      │
│  ─── ─── ─── ─── ───                 │
│  🧾  Transactions                    │
│  👥  Affiliate                       │
│  🛒  Services                        │
│  🔑  API Keys                        │
│  ─── ─── ─── ─── ───                 │
│  ⚙️  Settings                        │
│  🌙  Dark Mode          [toggle]     │
│  ─── ─── ─── ─── ───                 │
│  🚪  Logout                          │
│                                      │
└──────────────────────────────────────┘
```
- `ModalBottomSheet` with `skipPartiallyExpanded`
- Spring animation (`DampingRatioMediumBouncy`)
- Sheet inset: `16dp` from edges, `8dp` radius top

### 5.4 Other Animations

| Animation | Type | Duration | Trigger |
|-----------|------|----------|---------|
| Balance count-up | `animateFloat` (lerp) | 800ms | Dashboard enter |
| Order status change | `Crossfade` | 300ms | Real-time update |
| Pull-to-refresh | `SwipeRefresh` | Native | All list screens |
| Staggered list items | `AnimatedVisibility` with `delay` | per-item 50ms | List renders |
| Nav icon selection | `animateScaleAsState` | 150ms | Tab switch |
| Balance pull-up sheet spring | `ModalBottomSheet` | 400ms | Profile icon drag |
| Confetti | `Lottie` | 2s | Order/payment success |

### 5.5 Lottie Animations Needed

| Animation | File | Trigger |
|-----------|------|---------|
| Success checkmark | `checkmark.json` | Order placed |
| Money/coins | `money.json` | Funds added |
| Error/Alert | `alert.json` | Payment failed |
| Loading spinner | `loading.json` | API calls |
| Welcome | `welcome.json` | First app open |

---

## 6. API Integration

### All API Endpoints Used by the App

```
Base URL: https://amarfollower.com/api/v1
```

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/auth/register` | POST | Register new user | No |
| `/auth/login` | POST | Login → get token | No |
| `/branding` | GET | Sync theme colors, currency | No |
| `/services` | GET | Browse services | No |
| `/services/:id` | GET | Service details | No |
| `/platforms` | GET | Platforms + categories | No |
| `/gateways` | GET | Payment gateways | No |
| `/user/profile` | GET/PUT | Get/update profile | Yes |
| `/user/balance` | GET | Current balance | Yes |
| `/user/stats` | GET | Dashboard stats | Yes |
| `/orders` | GET/POST | List/create orders | Yes |
| `/orders/:id` | GET | Single order | Yes |
| `/orders/mass` | POST | Bulk order | Yes |
| `/payments` | GET/POST | Initiate/list payments | Yes |
| `/refills` | GET/POST | Refill requests | Yes |
| `/tickets` | GET/POST | List/create tickets | Yes |
| `/tickets/:id` | GET | Ticket + messages | Yes |
| `/tickets/:id/reply` | POST | Reply to ticket | Yes |
| `/scheduled-orders` | GET/POST | List/create scheduled | Yes |
| `/scheduled-orders/:id` | DELETE | Cancel scheduled | Yes |

### API Response Format

```json
// Success
{ "success": true, "data": { ... }, "meta": { "page": 1, "totalPages": 5 } }

// Error
{ "success": false, "error": "Insufficient balance" }
```

### Authentication Flow

```kotlin
// 1. Login → store token
data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val success: Boolean, val data: AuthData)
data class AuthData(val token: String, val tokenType: String, val expiresIn: String)

// 2. Interceptor adds header to all requests
class AuthInterceptor(private val tokenProvider: TokenProvider) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer ${tokenProvider.getToken()}")
            .build()
        return chain.proceed(request)
    }
}
```

### Payment / Gateway Callback Flow

```
1. User selects gateway + amount → confirms
2. App calls POST /api/v1/payments → gets transactionId
3. App opens WebView with gateway payment URL
4. User completes payment on gateway page
5. Gateway redirects to callback URL (e.g., https://amarfollower.com/callback?status=success&txn=...)
6. App synchronously fetches the payment status
7. If success → success animation → balance updates
8. If failed → error animation → explain to user
```

**Callback Verification:**
```kotlin
// Poll backend for payment status after callback
suspend fun verifyPayment(transactionId: String): PaymentStatus {
    // Call admin API or specific payment status endpoint
    // Update local balance
    // Navigate to success/failure screen
}
```

---

## 7. Notifications

| Event | Push | In-App | SMS | Email |
|-------|------|--------|-----|-------|
| Order placed | ✅ | ✅ | ❌ | ❌ |
| Order completed | ✅ | ✅ | ❌ | ❌ |
| Balance updated | ❌ | ✅ | ❌ | ❌ |
| Payment completed | ✅ | ✅ | ❌ | ❌ |
| Refill completed | ✅ | ✅ | ❌ | ❌ |
| Ticket reply | ✅ | ✅ | ❌ | ✅ |
| Scheduled order executed | ✅ | ✅ | ❌ | ❌ |

---

## 8. Implementation Priority

### Phase 1 (Core)
1. Dashboard + Balance card
2. Services catalog + New Order flow + Order history
3. Bottom navigation bar
4. Login/Register screens

### Phase 2 (Payments + Support)
5. Add Funds + Gateway WebView + Callback
6. Payment success/error animations
7. Support tickets (list + create + detail + reply)

### Phase 3 (Secondary)
8. Affiliate program
9. API Keys management
10. Profile pull-up sheet
11. All Documents / Receipts
12. Theme color sync from branding API
13. Dark mode toggle

### Phase 4 (Polish)
14. Lottie animations (success, error, loading)
15. Pull-to-refresh everywhere
16. Empty states + error states
17. Offline support (cached services)
18. Biometric/fingerprint login
