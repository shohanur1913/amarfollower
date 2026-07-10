import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get("admin") === "true";

    await destroySession(isAdmin ? "admin" : "user");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
