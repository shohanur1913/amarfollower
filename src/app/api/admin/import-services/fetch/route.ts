import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("id");

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID required" }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(providerId) },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    try {
      const url = new URL(provider.apiUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      let response: Response;
      try {
        response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: provider.apiKey,
            action: "services",
          }),
          signal: controller.signal,
        });
      } catch (sendError) {
        try {
          response = await fetch(url.toString(), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });
        } catch (getError) {
          clearTimeout(timeoutId);
          const message =
            sendError instanceof Error &&
            (sendError.message.includes("aborted") ||
              sendError.name === "AbortError")
              ? "Provider API request timed out after 30s"
              : "Failed to connect to provider API";
          console.error("Provider API fetch error:", sendError, getError);
          return NextResponse.json({ error: message }, { status: 502 });
        }
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Provider API error:", fetchError);
      return NextResponse.json({ error: "Failed to connect to provider API" }, { status: 502 });
    }
  } catch (error) {
    console.error("Failed to fetch provider services:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
