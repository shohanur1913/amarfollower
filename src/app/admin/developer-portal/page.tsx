"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Shield,
  Zap,
  Globe,
  Copy,
  Check,
  Code2,
  KeyRound,
  Server,
  Palette,
  FileDown,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/auth/register",
    description: "Register a new user account",
    auth: false,
    params: [
      { name: "username", type: "string", required: true, desc: "3-20 chars, alphanumeric + underscore" },
      { name: "email", type: "string", required: true, desc: "Valid email address" },
      { name: "password", type: "string", required: true, desc: "Minimum 6 characters" },
      { name: "referralCode", type: "string", required: false, desc: "Referrer's code (optional)" },
    ],
    example: `{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secret123"
}`,
    response: `{
  "success": true,
  "data": {
    "id": 42,
    "username": "newuser",
    "email": "user@example.com",
    "createdAt": "2026-07-09T10:00:00.000Z"
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/auth/login",
    description: "Authenticate a user and receive a Bearer token",
    auth: false,
    params: [
      { name: "email", type: "string", required: true, desc: "User email" },
      { name: "password", type: "string", required: true, desc: "User password" },
    ],
    example: `{
  "email": "user@example.com",
  "password": "secret123"
}`,
    response: `{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "expiresIn": "7d",
    "user": {
      "id": 42,
      "username": "newuser",
      "email": "user@example.com",
      "role": "user",
      "balance": 150.00
    }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/branding",
    description: "Get site branding — colors, logo, currency. Use this to sync the client app's theme with the website.",
    auth: false,
    params: [],
    example: `curl https://amarfollower.com/api/v1/branding`,
    response: `{
  "success": true,
  "data": {
    "siteName": "AmarFollower",
    "logoUrl": "https://amarfollower.com/logo.png",
    "faviconUrl": "https://amarfollower.com/favicon.ico",
    "colors": {
      "primary": "#6366f1",
      "secondary": "#8b5cf6"
    },
    "currency": {
      "symbol": "৳",
      "code": "BDT"
    }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/platforms",
    description: "List all platforms with their categories and service counts",
    auth: false,
    params: [],
    example: `curl https://amarfollower.com/api/v1/platforms`,
    response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Instagram",
      "categories": [
        { "id": 1, "name": "Followers", "serviceCount": 12 }
      ]
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/services",
    description: "List all active services. Supports pagination and filtering.",
    auth: false,
    params: [
      { name: "page", type: "number", required: false, desc: "Page number (default: 1)" },
      { name: "pageSize", type: "number", required: false, desc: "Items per page (default: 20, max: 100)" },
      { name: "platformId", type: "number", required: false, desc: "Filter by platform" },
      { name: "categoryId", type: "number", required: false, desc: "Filter by category" },
      { name: "search", type: "string", required: false, desc: "Search service name" },
    ],
    example: `curl "https://amarfollower.com/api/v1/services?page=1&pageSize=20"`,
    response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Instagram Followers [Real][HQ]",
      "platform": "Instagram",
      "category": "Followers",
      "pricePerK": 120.00,
      "perAmount": 1000,
      "min": 50,
      "max": 10000,
      "description": "High quality real followers"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/services/:id",
    description: "Get details of a single service",
    auth: false,
    params: [],
    example: `curl https://amarfollower.com/api/v1/services/1`,
    response: `{
  "success": true,
  "data": {
    "id": 1,
    "name": "Instagram Followers [Real][HQ]",
    "platform": "Instagram",
    "category": "Followers",
    "pricePerK": 120.00,
    "perAmount": 1000,
    "min": 50,
    "max": 10000,
    "startTime": "0-1 hour",
    "speed": "5000/day",
    "guarantee": "30 days",
    "quality": "High",
    "description": "High quality real followers"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/gateways",
    description: "List all active payment gateways",
    auth: false,
    params: [],
    example: `curl https://amarfollower.com/api/v1/gateways`,
    response: `{
  "success": true,
  "data": [
    { "id": 1, "name": "bkash", "displayName": "bKash", "currency": "BDT" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/user/profile",
    description: "Get the authenticated user's profile",
    auth: true,
    params: [],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/user/profile`,
    response: `{
  "success": true,
  "data": {
    "id": 42,
    "username": "newuser",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "balance": 150.00,
    "canOrder": true,
    "referralCode": "AF42XYZ",
    "twoFactorEnabled": false,
    "createdAt": "2026-07-01T10:00:00.000Z"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/user/balance",
    description: "Get the current user's balance",
    auth: true,
    params: [],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/user/balance`,
    response: `{
  "success": true,
  "data": { "balance": 150.00, "currency": "BDT" }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/user/stats",
    description: "Get dashboard statistics for the user",
    auth: true,
    params: [],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/user/stats`,
    response: `{
  "success": true,
  "data": {
    "username": "newuser",
    "balance": 150.00,
    "totalSpend": 340.50,
    "totalOrders": 28,
    "pendingOrders": 2,
    "processingOrders": 1,
    "completedOrders": 23,
    "cancelledOrders": 2
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/orders",
    description: "Place a new order. Balance is deducted atomically.",
    auth: true,
    params: [
      { name: "serviceId", type: "number", required: true, desc: "Service ID from /services" },
      { name: "link", type: "string", required: true, desc: "Target URL (profile, post, etc.)" },
      { name: "quantity", type: "number", required: true, desc: "Must be within service min/max" },
    ],
    example: `curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"serviceId":1,"link":"https://instagram.com/user","quantity":500}' \\
  https://amarfollower.com/api/v1/orders`,
    response: `{
  "success": true,
  "data": {
    "id": 1024,
    "charge": 60.00,
    "status": "pending",
    "link": "https://instagram.com/user",
    "quantity": 500
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/orders",
    description: "List the user's orders. Supports pagination and status filter.",
    auth: true,
    params: [
      { name: "page", type: "number", required: false, desc: "Page number (default: 1)" },
      { name: "pageSize", type: "number", required: false, desc: "Items per page (default: 20)" },
      { name: "status", type: "string", required: false, desc: "pending | processing | completed | cancelled" },
    ],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  "https://amarfollower.com/api/v1/orders?status=completed&page=1"`,
    response: `{
  "success": true,
  "data": [
    {
      "id": 1024,
      "service": "Instagram Followers [Real][HQ]",
      "platform": "Instagram",
      "link": "https://instagram.com/user",
      "quantity": 500,
      "charge": 60.00,
      "status": "completed",
      "startCount": "1200",
      "remains": "0",
      "createdAt": "2026-07-08T14:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 28, "totalPages": 2 }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/orders/:id",
    description: "Get full details of a single order",
    auth: true,
    params: [],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/orders/1024`,
    response: `{
  "success": true,
  "data": {
    "id": 1024,
    "service": { "id": 1, "name": "Instagram Followers [Real][HQ]", "platform": "Instagram", "category": "Followers" },
    "link": "https://instagram.com/user",
    "quantity": 500,
    "charge": 60.00,
    "status": "completed",
    "startCount": "1200",
    "remains": "0",
    "createdAt": "2026-07-08T14:30:00.000Z"
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/orders/mass",
    description: "Place multiple orders at once (max 100 per request).",
    auth: true,
    params: [
      { name: "orders", type: "array", required: true, desc: "Array of { serviceId, link, quantity }" },
    ],
    example: `curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"orders":[{"serviceId":1,"link":"https://instagram.com/a","quantity":100},{"serviceId":2,"link":"https://instagram.com/b","quantity":200}]}' \\
  https://amarfollower.com/api/v1/orders/mass`,
    response: `{
  "success": true,
  "data": {
    "results": [
      { "index": 0, "serviceId": 1, "orderId": 1025, "charge": 12.00 },
      { "index": 1, "serviceId": 2, "orderId": 1026, "charge": 24.00 }
    ],
    "totalCharge": 36.00,
    "successCount": 2,
    "failCount": 0
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/payments",
    description: "Initiate a payment/deposit request",
    auth: true,
    params: [
      { name: "gateway", type: "string", required: true, desc: "Gateway name from /gateways" },
      { name: "amount", type: "number", required: true, desc: "Amount to deposit (must be > 0)" },
    ],
    example: `curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"gateway":"bkash","amount":500}' \\
  https://amarfollower.com/api/v1/payments`,
    response: `{
  "success": true,
  "data": {
    "id": 88,
    "transactionId": "TXN-1720520000000-AB12CD",
    "amount": 505.00,
    "feeAmount": 5.00,
    "gateway": "bkash",
    "status": "pending",
    "createdAt": "2026-07-09T10:00:00.000Z"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/payments",
    description: "List payment history",
    auth: true,
    params: [
      { name: "page", type: "number", required: false, desc: "Page number" },
      { name: "pageSize", type: "number", required: false, desc: "Items per page" },
      { name: "status", type: "string", required: false, desc: "pending | completed | failed" },
    ],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/payments`,
    response: `{
  "success": true,
  "data": [
    {
      "id": 88,
      "transactionId": "TXN-1720520000000-AB12CD",
      "amount": 505.00,
      "feeAmount": 5.00,
      "gateway": "bkash",
      "status": "completed",
      "createdAt": "2026-07-09T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 5, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/refills",
    description: "Request a refill for a completed order",
    auth: true,
    params: [
      { name: "orderId", type: "number", required: true, desc: "Order ID (must be completed)" },
      { name: "reason", type: "string", required: false, desc: "Optional reason for refill" },
    ],
    example: `curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"orderId":1024,"reason":"Drop in followers"}' \\
  https://amarfollower.com/api/v1/refills`,
    response: `{
  "success": true,
  "data": { "id": 12, "orderId": 1024, "status": "pending" }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/refills",
    description: "List refill requests",
    auth: true,
    params: [
      { name: "page", type: "number", required: false, desc: "Page number" },
      { name: "pageSize", type: "number", required: false, desc: "Items per page" },
    ],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/refills`,
    response: `{
  "success": true,
  "data": [
    {
      "id": 12,
      "orderId": 1024,
      "service": "Instagram Followers [Real][HQ]",
      "amount": 60.00,
      "status": "pending",
      "reason": "Drop in followers",
      "createdAt": "2026-07-09T11:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/tickets",
    description: "Create a new support ticket",
    auth: true,
    params: [
      { name: "subject", type: "string", required: true, desc: "Ticket subject" },
      { name: "message", type: "string", required: true, desc: "First message (min 10 chars)" },
    ],
    example: `curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"subject":"Order delay","message":"My order 1024 is still pending after 24h."}' \\
  https://amarfollower.com/api/v1/tickets`,
    response: `{
  "success": true,
  "data": { "id": 55, "subject": "Order delay", "status": "open", "createdAt": "2026-07-09T12:00:00.000Z" }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/tickets",
    description: "List support tickets",
    auth: true,
    params: [
      { name: "page", type: "number", required: false, desc: "Page number" },
      { name: "pageSize", type: "number", required: false, desc: "Items per page" },
      { name: "status", type: "string", required: false, desc: "open | answered | closed" },
    ],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/tickets`,
    response: `{
  "success": true,
  "data": [
    { "id": 55, "subject": "Order delay", "status": "open", "createdAt": "2026-07-09T12:00:00.000Z" }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/tickets/:id",
    description: "Get a ticket with all its messages",
    auth: true,
    params: [],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/tickets/55`,
    response: `{
  "success": true,
  "data": {
    "id": 55,
    "subject": "Order delay",
    "status": "open",
    "messages": [
      { "id": 1, "senderRole": "user", "message": "My order 1024...", "createdAt": "2026-07-09T12:00:00.000Z" },
      { "id": 2, "senderRole": "admin", "message": "We are checking...", "createdAt": "2026-07-09T12:30:00.000Z" }
    ]
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/tickets/:id/reply",
    description: "Reply to an open support ticket",
    auth: true,
    params: [
      { name: "message", type: "string", required: true, desc: "Reply message text" },
    ],
    example: `curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Thank you, waiting for update."}' \\
  https://amarfollower.com/api/v1/tickets/55/reply`,
    response: `{
  "success": true,
  "data": {
    "id": 3,
    "senderRole": "user",
    "message": "Thank you, waiting for update.",
    "createdAt": "2026-07-09T13:00:00.000Z"
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/scheduled-orders",
    description: "Create a recurring/scheduled order",
    auth: true,
    params: [
      { name: "serviceId", type: "number", required: true, desc: "Service ID" },
      { name: "link", type: "string", required: true, desc: "Target URL" },
      { name: "quantity", type: "number", required: true, desc: "Quantity per run" },
      { name: "intervalHours", type: "number", required: true, desc: "Hours between runs" },
      { name: "maxRuns", type: "number", required: false, desc: "Maximum number of runs (optional)" },
    ],
    example: `curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"serviceId":1,"link":"https://instagram.com/user","quantity":100,"intervalHours":24,"maxRuns":30}' \\
  https://amarfollower.com/api/v1/scheduled-orders`,
    response: `{
  "success": true,
  "data": {
    "id": 7,
    "serviceId": 1,
    "link": "https://instagram.com/user",
    "quantity": 100,
    "intervalHours": 24,
    "nextRunAt": "2026-07-10T10:00:00.000Z",
    "status": "active"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/scheduled-orders",
    description: "List scheduled/recurring orders",
    auth: true,
    params: [
      { name: "page", type: "number", required: false, desc: "Page number" },
      { name: "pageSize", type: "number", required: false, desc: "Items per page" },
      { name: "status", type: "string", required: false, desc: "active | cancelled" },
    ],
    example: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/scheduled-orders`,
    response: `{
  "success": true,
  "data": [
    {
      "id": 7,
      "service": "Instagram Followers [Real][HQ]",
      "link": "https://instagram.com/user",
      "quantity": 100,
      "intervalHours": 24,
      "nextRunAt": "2026-07-10T10:00:00.000Z",
      "totalRuns": 3,
      "maxRuns": 30,
      "status": "active",
      "createdAt": "2026-07-01T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "DELETE",
    path: "/api/v1/scheduled-orders/:id",
    description: "Cancel a scheduled order",
    auth: true,
    params: [],
    example: `curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/scheduled-orders/7`,
    response: `{
  "success": true,
  "data": { "id": 7, "status": "cancelled" }
}`,
  },
];

const ERROR_CODES = [
  { code: "200", name: "OK", desc: "Request succeeded" },
  { code: "201", name: "Created", desc: "Resource created successfully" },
  { code: "400", name: "Bad Request", desc: "Invalid input or missing required parameters" },
  { code: "401", name: "Unauthorized", desc: "Missing, invalid, or expired API key/token" },
  { code: "403", name: "Forbidden", desc: "IP not whitelisted or account restricted" },
  { code: "404", name: "Not Found", desc: "Requested resource does not exist" },
  { code: "429", name: "Too Many Requests", desc: "Rate limit exceeded. Check Retry-After header." },
  { code: "500", name: "Internal Server Error", desc: "Something went wrong on the server" },
];

const methodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "POST":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "PUT":
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "DELETE":
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(label ? `${label} copied` : "Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

export default function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "auth" | "endpoints" | "errors" | "examples" | "console">(
    "overview"
  );
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);

  // Test console state
  const [testMethod, setTestMethod] = useState("GET");
  const [testPath, setTestPath] = useState("/api/v1/user/balance");
  const [testToken, setTestToken] = useState("");
  const [testBody, setTestBody] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setTestResponse("");
    setTestStatus(null);
    try {
      const opts: RequestInit = {
        method: testMethod,
        headers: {
          "Content-Type": "application/json",
          ...(testToken ? { Authorization: `Bearer ${testToken}` } : {}),
        },
      };
      if ((testMethod === "POST" || testMethod === "PUT") && testBody) {
        opts.body = testBody;
      }
      const res = await fetch(`https://amarfollower.com${testPath}`, opts);
      setTestStatus(res.status);
      const text = await res.text();
      try {
        setTestResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setTestResponse(text);
      }
    } catch (err) {
      setTestResponse(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const kotlinExample = `// AmarFollowerApiClient.kt
import retrofit2.http.*

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val success: Boolean, val data: UserData)
data class UserData(val token: String, val user: User)

interface AmarFollowerApi {
    @POST("api/v1/auth/login")
    suspend fun login(@Body body: LoginRequest): LoginResponse

    @GET("api/v1/services")
    suspend fun getServices(@Query("page") page: Int = 1): ServicesResponse

    @GET("api/v1/user/balance")
    suspend fun getBalance(@Header("Authorization") auth: String): BalanceResponse

    @POST("api/v1/orders")
    suspend fun createOrder(
        @Header("Authorization") auth: String,
        @Body order: OrderRequest
    ): OrderResponse
}

// Usage
val api = Retrofit.Builder()
    .baseUrl("https://amarfollower.com/")
    .addConverterFactory(MoshiConverterFactory.create())
    .build()
    .create(AmarFollowerApi::class.java)

// 1. Login to get token
val login = api.login(LoginRequest("user@example.com", "secret123"))
val token = "Bearer " + login.data.token

// 2. Check balance
val balance = api.getBalance(token)
println("Balance: " + balance.data.balance)

// 3. Place an order
val order = api.createOrder(token, OrderRequest(
    serviceId = 1,
    link = "https://instagram.com/user",
    quantity = 500
))
println("Order ID: " + order.data.id)`;

  const curlExample = `# 1. Login to get your Bearer token
curl -X POST https://amarfollower.com/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"secret123"}'

# 2. Get available services
curl https://amarfollower.com/api/v1/services

# 3. Check your balance
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/user/balance

# 4. Place a new order
curl -X POST https://amarfollower.com/api/v1/orders \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"serviceId":1,"link":"https://instagram.com/user","quantity":500}'

# 5. Check order status
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://amarfollower.com/api/v1/orders/1024`;

  const phpExample = `<?php
// Using Guzzle HTTP client
require 'vendor/autoload.php';

$client = new GuzzleHttp\\Client(['base_uri' => 'https://amarfollower.com']);

// 1. Login
$loginRes = $client->post('api/v1/auth/login', [
    'json' => ['email' => 'user@example.com', 'password' => 'secret123']
]);
$loginData = json_decode($loginRes->getBody(), true);
$token = $loginData['data']['token'];

// 2. Get services
$servicesRes = $client->get('api/v1/services');
$services = json_decode($servicesRes->getBody(), true);

// 3. Place order
$orderRes = $client->post('api/v1/orders', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'serviceId' => 1,
        'link' => 'https://instagram.com/user',
        'quantity' => 500
    ]
]);
$order = json_decode($orderRes->getBody(), true);
echo "Order ID: " . $order['data']['id'];`;

  // --- Generate full Markdown documentation ---
  const generateMarkdown = (): string => {
    let md = "";

    // Header
    md += `# AmarFollower API Documentation\n\n`;
    md += `> REST API documentation for integrating AmarFollower as a provider or building client apps.\n\n`;
    md += `**Version:** v1  \n`;
    md += `**Last Updated:** ${new Date().toISOString().split("T")[0]}\n\n`;
    md += `---\n\n`;

    // Overview
    md += `## Overview\n\n`;
    md += `### Base URL\n\n`;
    md += `\`\`\`\nhttps://amarfollower.com/api/v1\n\`\`\`\n\n`;
    md += `All endpoints are relative to this base URL.\n\n`;
    md += `### Response Format\n\n`;
    md += `All responses use JSON:\n\n`;
    md += `\`\`\`json\n{\n  "success": true,\n  "data": { ... },\n  "meta": { "page": 1, ... }\n}\n\`\`\`\n\n`;

    // Feature summary
    md += `### Features\n\n`;
    md += `- **Authentication:** Bearer token via \`Authorization\` header\n`;
    md += `- **Rate Limiting:** 60 requests / minute per IP. Headers included in every response.\n`;
    md += `- **Branding Sync:** Use \`/branding\` to sync theme colors with the website.\n\n`;

    // Quick Start
    md += `### Quick Start\n\n`;
    md += `1. Register a user via \`POST /api/v1/auth/register\`\n`;
    md += `2. Login to get a Bearer token via \`POST /api/v1/auth/login\`\n`;
    md += `3. Use the token in the \`Authorization: Bearer <token>\` header for all protected endpoints.\n`;
    md += `4. Sync colors & branding from \`GET /api/v1/branding\`\n\n`;
    md += `---\n\n`;

    // Authentication
    md += `## Authentication\n\n`;
    md += `AmarFollower API uses **Bearer token** authentication. Users obtain a token by logging in, then include it in the \`Authorization\` header for all protected endpoints.\n\n`;
    md += `\`\`\`\nAuthorization: Bearer <your_token_here>\n\`\`\`\n\n`;
    md += `### Token Lifecycle\n\n`;
    md += `- Token is obtained via \`POST /api/v1/auth/login\`\n`;
    md += `- Token expires after **7 days**\n`;
    md += `- Token is tied to the user account and its status\n`;
    md += `- If the account is suspended, the token becomes invalid\n\n`;
    md += `### IP Whitelisting (optional)\n\n`;
    md += `API keys can optionally restrict access to specific IP addresses. If an API key has an IP whitelist configured, requests from non-whitelisted IPs will receive a **403 Forbidden** response.\n\n`;
    md += `### Login Example\n\n`;
    md += `**Request:**\n\n`;
    md += `\`\`\`bash\ncurl -X POST https://amarfollower.com/api/v1/auth/login \\\\\n  -H "Content-Type: application/json" \\\\\n  -d '{"email":"user@example.com","password":"secret123"}'\n\`\`\`\n\n`;
    md += `**Response (200 OK):**\n\n`;
    md += `\`\`\`json\n{\n  "success": true,\n  "data": {\n    "token": "eyJhbGciOi...",\n    "tokenType": "Bearer",\n    "expiresIn": "7d",\n    "user": { "id": 42, "username": "newuser", "email": "user@example.com", "balance": 150.00 }\n  }\n}\n\`\`\`\n\n`;
    md += `---\n\n`;

    // Endpoints
    md += `## Endpoints\n\n`;
    ENDPOINTS.forEach((ep) => {
      md += `### ${ep.method} ${ep.path}\n\n`;
      md += `${ep.description}\n\n`;
      if (ep.auth) {
        md += `> 🔒 **Authentication required** — Include \`Authorization: Bearer <token>\` header.\n\n`;
      }
      if (ep.params.length > 0) {
        md += `#### Parameters\n\n`;
        md += `| Name | Type | Required | Description |\n`;
        md += `|------|------|----------|-------------|\n`;
        ep.params.forEach((p) => {
          md += `| \`${p.name}\` | ${p.type} | ${p.required ? "✅ Yes" : "❌ No"} | ${p.desc} |\n`;
        });
        md += `\n`;
      }
      md += `#### Example Request\n\n`;
      md += `\`\`\`\n${ep.example}\n\`\`\`\n\n`;
      md += `#### Example Response\n\n`;
      md += `\`\`\`json\n${ep.response}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });

    // Code Examples
    md += `## Code Examples\n\n`;
    md += `### Kotlin (Retrofit)\n\n`;
    md += `\`\`\`kotlin\n${kotlinExample}\n\`\`\`\n\n`;
    md += `### cURL\n\n`;
    md += `\`\`\`bash\n${curlExample}\n\`\`\`\n\n`;
    md += `### PHP (Guzzle)\n\n`;
    md += `\`\`\`php\n${phpExample}\n\`\`\`\n\n`;
    md += `---\n\n`;

    // Error Codes
    md += `## Error Codes\n\n`;
    md += `| Code | Name | Description |\n`;
    md += `|------|------|-------------|\n`;
    ERROR_CODES.forEach((e) => {
      md += `| ${e.code} | ${e.name} | ${e.desc} |\n`;
    });
    md += `\n`;

    md += `### Error Response Format\n\n`;
    md += `All errors follow this format:\n\n`;
    md += `\`\`\`json\n{\n  "success": false,\n  "error": "Insufficient balance"\n}\n\`\`\`\n\n`;

    md += `### Rate Limiting\n\n`;
    md += `API requests are limited to **60 requests per minute** per IP address. When the limit is exceeded, the API returns a **429 Too Many Requests** status.\n\n`;
    md += `**Rate limit headers:**\n\n`;
    md += `\`\`\`\nX-RateLimit-Limit: 60\nX-RateLimit-Remaining: 45\nX-RateLimit-Reset: 1720520060\nRetry-After: 30  (only when limited)\n\`\`\`\n\n`;
    md += `---\n\n`;
    md += `*Generated by AmarFollower Developer Portal*\n`;

    return md;
  };

  // --- Copy full Markdown to clipboard ---
  const copyAsMarkdown = async () => {
    const md = generateMarkdown();
    try {
      await navigator.clipboard.writeText(md);
      toast.success("Full documentation copied as Markdown");
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = md;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Full documentation copied as Markdown");
    }
  };

  // --- Download full documentation as PDF ---
  const downloadPDF = () => {
    const md = generateMarkdown();

    // Build a printable HTML document from the markdown
    const html = buildPrintableHTML(md);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Open in a new window and trigger print (user selects "Save as PDF")
    const printWindow = window.open(url, "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to download the PDF");
      URL.revokeObjectURL(url);
      return;
    }

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Revoke after print dialog
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    toast.success("Opening print dialog — select 'Save as PDF'");
  };

  // Convert markdown to styled printable HTML
  const buildPrintableHTML = (md: string): string => {
    // Simple markdown → HTML conversion for the document
    let html = md;

    // Escape HTML
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks with language
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langLabel = lang ? `<div class="code-lang">${lang}</div>` : "";
      return `<div class="code-block">${langLabel}<pre>${code.trim()}</pre></div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline">$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

    // Horizontal rule
    html = html.replace(/^---$/gm, "<hr/>");

    // Tables
    html = html.replace(
      /(?:^\|.+?\|)\n(?:^\|[\s\-:|]+?\|)\n((?:^\|.+?\|\n?)+)/gm,
      (match) => {
        const lines = match.trim().split("\n");
        if (lines.length < 3) return match;
        const headerCells = lines[0].split("|").filter((c) => c.trim());
        const bodyLines = lines.slice(2);

        let table = '<table><thead><tr>';
        headerCells.forEach((c) => {
          table += `<th>${c.trim()}</th>`;
        });
        table += '</tr></thead><tbody>';

        bodyLines.forEach((line) => {
          const cells = line.split("|").filter((c) => c.trim());
          if (cells.length > 0) {
            table += "<tr>";
            cells.forEach((c) => {
              table += `<td>${c.trim()}</td>`;
            });
            table += "</tr>";
          }
        });
        table += "</tbody></table>";
        return table;
      }
    );

    // Lists
    html = html.replace(/(?:^- .+\n?)+/gm, (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((line) => line.replace(/^- /, "").trim())
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    });
    html = html.replace(/(?:^\d+\. .+\n?)+/gm, (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((line) => line.replace(/^\d+\. /, "").trim())
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    });

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Paragraphs (lines not already wrapped)
    html = html
      .split("\n\n")
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (/^<(h\d|ul|ol|table|blockquote|hr|div|pre)/.test(trimmed)) return trimmed;
        return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>AmarFollower API Documentation</title>
<style>
  @page { margin: 20mm; size: A4; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;
    font-size: 14px;
  }
  h1 { font-size: 28px; color: #6366f1; border-bottom: 3px solid #6366f1; padding-bottom: 8px; margin-top: 32px; }
  h2 { font-size: 22px; color: #4f46e5; margin-top: 28px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  h3 { font-size: 17px; color: #312e81; margin-top: 24px; }
  code.inline { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: "Fira Code", "Consolas", monospace; color: #db2777; }
  .code-block { background: #0f172a; color: #4ade80; border-radius: 8px; padding: 12px 16px; margin: 12px 0; overflow-x: auto; page-break-inside: avoid; }
  .code-block pre { margin: 0; font-family: "Fira Code", "Consolas", monospace; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; }
  .code-lang { color: #94a3b8; font-size: 10px; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 13px; }
  th { background: #6366f1; color: white; text-align: left; padding: 8px 10px; }
  td { border: 1px solid #e2e8f0; padding: 8px 10px; }
  tr:nth-child(even) { background: #f8fafc; }
  blockquote { border-left: 4px solid #6366f1; background: #eef2ff; padding: 8px 16px; margin: 12px 0; border-radius: 0 6px 6px 0; }
  hr { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0; }
  ul, ol { padding-left: 20px; }
  li { margin: 4px 0; }
  strong { color: #1e1b4b; }
  p { margin: 8px 0; }
</style>
</head>
<body>
${html}
</body>
</html>`;
  };


  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BookOpen },
    { id: "auth" as const, label: "Authentication", icon: KeyRound },
    { id: "endpoints" as const, label: "Endpoints", icon: Server },
    { id: "examples" as const, label: "Code Examples", icon: Code2 },
    { id: "errors" as const, label: "Error Codes", icon: Zap },
    { id: "console" as const, label: "Test Console", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#6366f1]" />
            Developer Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            REST API documentation for integrating AmarFollower as a provider or building client apps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyAsMarkdown} className="gap-2">
            <FileText className="h-4 w-4" />
            Copy as Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
          <Badge className="bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">v1</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#6366f1] text-[#6366f1]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-5 w-5 text-[#6366f1]" />
                  Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm font-mono bg-slate-900 text-green-400 px-3 py-2 rounded-md block">
                  https://amarfollower.com/api/v1
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  All endpoints are relative to this base URL.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code2 className="h-5 w-5 text-[#6366f1]" />
                  Response Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">All responses use JSON:</p>
                <pre className="text-xs font-mono bg-slate-900 text-green-400 p-3 rounded-md overflow-x-auto">{`{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, ... } // optional
}`}</pre>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bearer token via <code className="text-xs bg-muted px-1 rounded">Authorization</code> header.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  Rate Limiting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  60 requests / minute per IP. Headers included in every response.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4 text-purple-600" />
                  Branding Sync
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use <code className="text-xs bg-muted px-1 rounded">/branding</code> to sync theme colors.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6366f1] text-white text-xs font-bold flex items-center justify-center">1</span>
                <p>Register a user via <code className="text-xs bg-muted px-1 rounded">POST /api/v1/auth/register</code></p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6366f1] text-white text-xs font-bold flex items-center justify-center">2</span>
                <p>Login to get a Bearer token via <code className="text-xs bg-muted px-1 rounded">POST /api/v1/auth/login</code></p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6366f1] text-white text-xs font-bold flex items-center justify-center">3</span>
                <p>Use the token in the <code className="text-xs bg-muted px-1 rounded">Authorization: Bearer &lt;token&gt;</code> header for all protected endpoints.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6366f1] text-white text-xs font-bold flex items-center justify-center">4</span>
                <p>Sync colors &amp; branding from <code className="text-xs bg-muted px-1 rounded">GET /api/v1/branding</code></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Authentication Tab */}
      {activeTab === "auth" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-5 w-5 text-[#6366f1]" />
                How Authentication Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                AmarFollower API uses <strong>Bearer token</strong> authentication. Users obtain a token by logging in,
                then include it in the <code className="bg-muted px-1 rounded text-xs">Authorization</code> header
                for all protected endpoints.
              </p>

              <div className="bg-slate-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
                {`Authorization: Bearer <your_token_here>`}
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Token lifecycle:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Token is obtained via <code className="bg-muted px-1 rounded text-xs">POST /api/v1/auth/login</code></li>
                  <li>Token expires after <strong>7 days</strong></li>
                  <li>Token is tied to the user account and its status</li>
                  <li>If the account is suspended, the token becomes invalid</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">IP Whitelisting (optional):</p>
                <p className="text-muted-foreground">
                  API keys can optionally restrict access to specific IP addresses. If an API key has an IP whitelist
                  configured, requests from non-whitelisted IPs will receive a <strong>403 Forbidden</strong> response.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Login Example</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Request:</p>
              <div className="relative">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto">{`POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}`}</pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={`curl -X POST https://amarfollower.com/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"secret123"}'`} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 mb-2">Response (200 OK):</p>
              <div className="relative">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto">{`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "7d",
    "user": {
      "id": 42,
      "username": "newuser",
      "email": "user@example.com",
      "balance": 150.00
    }
  }
}`}</pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "7d",
    "user": {
      "id": 42,
      "username": "newuser",
      "email": "user@example.com",
      "balance": 150.00
    }
  }
}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === "endpoints" && (
        <div className="space-y-3">
          {ENDPOINTS.map((ep, idx) => (
            <Card key={idx}>
              <button
                onClick={() => setExpandedEndpoint(expandedEndpoint === idx ? null : idx)}
                className="w-full text-left"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${methodColor(ep.method)}`}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono font-semibold text-foreground">{ep.path}</code>
                    {ep.auth && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Shield className="h-3 w-3" />
                        Auth
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground ml-auto">{ep.description}</span>
                  </div>
                </CardHeader>
              </button>
              {expandedEndpoint === idx && (
                <CardContent className="pt-0 space-y-4">
                  {ep.params.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Parameters</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-2 font-semibold">Name</th>
                              <th className="text-left p-2 font-semibold">Type</th>
                              <th className="text-left p-2 font-semibold">Required</th>
                              <th className="text-left p-2 font-semibold">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ep.params.map((p) => (
                              <tr key={p.name} className="border-b">
                                <td className="p-2 font-mono text-xs">{p.name}</td>
                                <td className="p-2 text-xs text-muted-foreground">{p.type}</td>
                                <td className="p-2">
                                  {p.required ? (
                                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Yes</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">No</Badge>
                                  )}
                                </td>
                                <td className="p-2 text-xs text-muted-foreground">{p.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Example Request</p>
                    <div className="relative">
                      <pre className="bg-slate-900 text-green-400 p-3 rounded-md text-xs font-mono overflow-x-auto">
                        {ep.example}
                      </pre>
                      <div className="absolute top-1.5 right-1.5">
                        <CopyButton text={ep.example} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Example Response</p>
                    <div className="relative">
                      <pre className="bg-slate-900 text-green-400 p-3 rounded-md text-xs font-mono overflow-x-auto">
                        {ep.response}
                      </pre>
                      <div className="absolute top-1.5 right-1.5">
                        <CopyButton text={ep.response} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Code Examples Tab */}
      {activeTab === "examples" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-5 w-5 text-[#6366f1]" />
                Kotlin (Retrofit)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-96">
                  {kotlinExample}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={kotlinExample} label="Kotlin code" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-5 w-5 text-[#6366f1]" />
                cURL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-96">
                  {curlExample}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={curlExample} label="cURL code" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-5 w-5 text-[#6366f1]" />
                PHP (Guzzle)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-96">
                  {phpExample}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={phpExample} label="PHP code" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Codes Tab */}
      {activeTab === "errors" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#6366f1]" />
                HTTP Status Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold">Code</th>
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ERROR_CODES.map((e) => (
                      <tr key={e.code} className="border-b dark:hover:bg-white/5">
                        <td className="p-3 font-mono font-bold text-[#6366f1]">{e.code}</td>
                        <td className="p-3 font-semibold">{e.name}</td>
                        <td className="p-3 text-muted-foreground">{e.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Error Response Format</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">All errors follow this format:</p>
              <div className="relative">
                <pre className="bg-slate-900 text-red-400 p-4 rounded-md text-xs font-mono overflow-x-auto">{`{
  "success": false,
  "error": "Insufficient balance"
}`}</pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={`{
  "success": false,
  "error": "Insufficient balance"
}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                API requests are limited to <strong>60 requests per minute</strong> per IP address. When the limit is
                exceeded, the API returns a <strong>429 Too Many Requests</strong> status.
              </p>
              <div className="bg-muted/50 border-border rounded-md p-3 space-y-1 text-xs font-mono">
                <p><span className="text-muted-foreground">X-RateLimit-Limit:</span> 60</p>
                <p><span className="text-muted-foreground">X-RateLimit-Remaining:</span> 45</p>
                <p><span className="text-muted-foreground">X-RateLimit-Reset:</span> 1720520060</p>
                <p><span className="text-muted-foreground">Retry-After:</span> 30 <span className="text-muted-foreground">(only when limited)</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Console Tab */}
      {activeTab === "console" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#6366f1]" />
                Live API Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test any endpoint directly from the admin panel. Enter a valid Bearer token for protected endpoints.
              </p>

              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Method</Label>
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm font-mono bg-background"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <Label className="text-xs">Path (relative to base URL)</Label>
                  <Input
                    value={testPath}
                    onChange={(e) => setTestPath(e.target.value)}
                    placeholder="/api/v1/services"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Bearer Token (optional — required for protected endpoints)</Label>
                <Input
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="font-mono text-sm"
                />
              </div>

              {(testMethod === "POST" || testMethod === "PUT") && (
                <div>
                  <Label className="text-xs">Request Body (JSON)</Label>
                  <textarea
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    placeholder='{ "serviceId": 1, "link": "https://...", "quantity": 100 }'
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm font-mono min-h-[100px] bg-background"
                  />
                </div>
              )}

              <Button onClick={runTest} disabled={testing} className="gap-2">
                {testing ? "Sending..." : "Send Request"}
              </Button>
            </CardContent>
          </Card>

          {testResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Response</span>
                  {testStatus && (
                    <Badge
                      className={
                        testStatus >= 200 && testStatus < 300
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : testStatus >= 400 && testStatus < 500
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                      }
                    >
                      HTTP {testStatus}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-96">
                  {testResponse}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
