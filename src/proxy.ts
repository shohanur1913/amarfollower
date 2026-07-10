import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { csrfMiddleware } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-me"
);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: number; username: string; email: string; role: string; status: string; balance: number };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip proxy for static files, Next.js internals, and API routes
  if (path.startsWith("/_next") || path.startsWith("/api") || path === "/favicon.ico") {
    return NextResponse.next();
  }

  // CSRF for all state-changing requests (except public API/auth)
  const csrfResponse = csrfMiddleware(request);
  if (csrfResponse.status !== 200) return csrfResponse;

  const hostname = request.headers.get("host") || "";
  const isAdminHost = hostname.startsWith("sysadmin.");
  const isAdminPath = path.startsWith("/admin");

  // Maintenance page itself should be accessible
  if (path === "/maintenance" || path.startsWith("/maintenance/")) {
    return NextResponse.next();
  }

  // Admin routes
  if (isAdminHost || isAdminPath) {
    if (path === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin-session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // Maintenance mode check (inline DB, no fetch)
  if (!isAdminHost && !isAdminPath) {
    try {
      const setting = await prisma.setting.findUnique({ where: { key: "maintenance_mode" } });
      if (setting?.value === "1" || setting?.value === "true") {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    } catch {}
  }

  // Public paths — no auth required
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/2fa", "/docs"];
  if (publicPaths.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Protected routes — require valid user session
  const token = request.cookies.get("user-session")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user || user.status !== "active") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
