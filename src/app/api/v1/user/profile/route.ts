import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        balance: true,
        canOrder: true,
        referralCode: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!fullUser) return apiError("User not found", 404);

    return apiSuccess({
      id: fullUser.id,
      username: fullUser.username,
      email: fullUser.email,
      role: fullUser.role,
      status: fullUser.status,
      balance: Number(fullUser.balance),
      canOrder: fullUser.canOrder,
      referralCode: fullUser.referralCode,
      twoFactorEnabled: fullUser.twoFactorEnabled,
      createdAt: fullUser.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  const { user, response } = await authenticateApiRequest(request);
  if (response) return response;
  if (!user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { username, email } = body;

    const updateData: Record<string, string> = {};

    if (username) {
      if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return apiError("Username must be 3-20 characters and contain only letters, numbers, and underscores");
      }
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: user.id } },
      });
      if (existing) return apiError("Username already taken");
      updateData.username = username;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return apiError("Invalid email format");
      const existing = await prisma.user.findFirst({
        where: { email: email.toLowerCase(), NOT: { id: user.id } },
      });
      if (existing) return apiError("Email already registered");
      updateData.email = email.toLowerCase();
    }

    if (Object.keys(updateData).length === 0) {
      return apiError("No fields to update");
    }

    await prisma.user.update({ where: { id: user.id }, data: updateData });

    return apiSuccess({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return apiError("Internal server error", 500);
  }
}
