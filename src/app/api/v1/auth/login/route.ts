import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError("email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return apiError("Invalid email or password", 401);
    }

    if (user.status !== "active") {
      return apiError("Account is suspended or inactive", 401);
    }

    // Generate API token (JWT)
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      balance: Number(user.balance),
    });

    return apiSuccess({
      token,
      tokenType: "Bearer",
      expiresIn: "7d",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: Number(user.balance),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Internal server error", 500);
  }
}
