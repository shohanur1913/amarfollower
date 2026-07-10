import { NextResponse } from "next/server";

/**
 * Standard success response wrapper for API v1 endpoints.
 */
export function apiSuccess(data: unknown, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard error response wrapper for API v1 endpoints.
 */
export function apiError(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Paginated success response.
 */
export function apiPaginated(data: unknown, meta: { page: number; pageSize: number; total: number; totalPages: number }) {
  return NextResponse.json({ success: true, data, meta });
}

/**
 * Standard error codes for the API.
 */
export const API_ERRORS = {
  UNAUTHORIZED: { message: "Authentication required", status: 401 },
  FORBIDDEN: { message: "Access denied", status: 403 },
  NOT_FOUND: { message: "Resource not found", status: 404 },
  RATE_LIMITED: { message: "Too many requests. Please try again later.", status: 429 },
  INVALID_INPUT: { message: "Invalid input data", status: 400 },
  INSUFFICIENT_BALANCE: { message: "Insufficient balance", status: 400 },
  SERVICE_UNAVAILABLE: { message: "Service temporarily unavailable", status: 503 },
  INTERNAL_ERROR: { message: "Internal server error", status: 500 },
} as const;
