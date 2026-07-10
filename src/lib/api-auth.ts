import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  apiKeyId: number;
}

/**
 * Authenticate a request using Bearer token from api_keys table.
 * Reads `Authorization: Bearer <key>` header, validates against `api_keys` table,
 * checks isActive, expiresAt, user status, and optional IP whitelist.
 * Updates lastUsed on successful auth.
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ user: ApiUser | null; response: NextResponse | null }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Missing or invalid Authorization header. Use: Authorization: Bearer <api_key>" },
        { status: 401 }
      ),
    };
  }

  const key = authHeader.slice(7).trim();

  if (!key) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "API key is empty" },
        { status: 401 }
      ),
    };
  }

  // Lookup API key
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  });

  if (!apiKeyRecord) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      ),
    };
  }

  // Check if key is active
  if (!apiKeyRecord.isActive) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "API key is disabled" },
        { status: 401 }
      ),
    };
  }

  // Check if key is expired
  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "API key has expired" },
        { status: 401 }
      ),
    };
  }

  // Check if user is active
  if (apiKeyRecord.user.status !== "active") {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Account is suspended or inactive" },
        { status: 401 }
      ),
    };
  }

  // Check IP whitelist (if configured)
  if (apiKeyRecord.ipWhitelist) {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const allowedIps = apiKeyRecord.ipWhitelist
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);

    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      return {
        user: null,
        response: NextResponse.json(
          { success: false, error: "IP address not whitelisted for this API key" },
          { status: 403 }
        ),
      };
    }
  }

  // Update lastUsed (fire-and-forget)
  prisma.apiKey
    .update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() },
    })
    .catch(() => {});

  const user: ApiUser = {
    id: apiKeyRecord.userId,
    username: apiKeyRecord.user.username,
    email: apiKeyRecord.user.email,
    role: apiKeyRecord.user.role,
    status: apiKeyRecord.user.status,
    balance: Number(apiKeyRecord.user.balance),
    apiKeyId: apiKeyRecord.id,
  };

  return { user, response: null };
}
