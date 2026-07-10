import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "csrf-secret-change-in-production";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCsrfToken(token: string, secret: string): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", CSRF_SECRET)
      .update(secret)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function csrfMiddleware(request: NextRequest) {
  // Only apply to state-changing methods
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    // Skip CSRF for login/register (no session yet) and public APIs
    const path = request.nextUrl.pathname;
    const skipPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/admin/login",
      "/api/platforms",
      "/api/services",
    ];
    
    if (skipPaths.some((p) => path.startsWith(p))) {
      return NextResponse.next();
    }

    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    
    // Check origin matches host
    if (origin && host) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return NextResponse.json(
          { error: "CSRF validation failed" },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}
