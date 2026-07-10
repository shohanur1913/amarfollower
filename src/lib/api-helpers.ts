import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./rate-limit";

export function withRateLimit(
  request: NextRequest,
  options?: { windowMs: number; maxRequests: number }
) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;

  const { allowed, resetTime } = rateLimit(key, options);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(options?.maxRequests || 60),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
          "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  return null; // No rate limit hit
}

export function getRateLimitHeaders(
  request: NextRequest,
  options?: { windowMs: number; maxRequests: number }
) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;

  const { remaining, resetTime } = rateLimit(key, options);

  return {
    "X-RateLimit-Limit": String(options?.maxRequests || 60),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
  };
}
