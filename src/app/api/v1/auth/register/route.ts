import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, referralCode } = body;

    // Validation
    if (!username || !email || !password) {
      return apiError("username, email, and password are required");
    }

    if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return apiError("Username must be 3-20 characters and contain only letters, numbers, and underscores");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Invalid email format");
    }

    if (password.length < 6) {
      return apiError("Password must be at least 6 characters");
    }

    // Check uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return apiError("Email already registered");
      }
      return apiError("Username already taken");
    }

    // Referral code
    let referredBy: number | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        referredBy,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return apiSuccess(
      { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return apiError("Internal server error", 500);
  }
}
