import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_token } = body;

    if (!id_token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // Verify token with Google
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`;
    const res = await fetch(verifyUrl, {
      headers: { "User-Agent": "AmarFollower-Next" },
    });

    const payload = await res.json();

    if (res.status !== 200 || !payload.email) {
      return NextResponse.json(
        { error: payload.error_description || "Google verification failed" },
        { status: 401 }
      );
    }

    const email = String(payload.email);
    const googleId = String(payload.sub);
    const fullName = String(payload.name || "Google User");

    // Clean username from name
    const baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    const username = `${baseUsername}${randomSuffix}`;

    // Find existing user
    let user = await prisma.user.findFirst({
      where: { email },
    });

    if (user) {
      // Link Google ID if not already linked
      if (!user.googleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          username,
          email,
          googleId,
          password: "", // no password for Google users
          balance: 0,
          role: "user",
          status: "active",
          canOrder: true,
        },
      });
    }

    await createSession(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        balance: Number(user.balance),
      },
      "user"
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
