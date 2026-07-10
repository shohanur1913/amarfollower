import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json({ error: "providerId required" }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(providerId) },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const apiUrl = provider.apiUrl.trim();
    const payload = JSON.stringify({ key: provider.apiKey, action: "balance" });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: payload,
        signal: controller.signal,
      });

      const text = await response.text();

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Provider returned non-JSON:", text.slice(0, 500));
        return NextResponse.json({
          success: false,
          error: `API returned status ${response.status}: non-JSON response`,
        });
      }

      if (data?.balance !== undefined) {
        return NextResponse.json({
          success: true,
          balance: data.balance,
          currency: data.currency || "USD",
        });
      }

      return NextResponse.json({
        success: false,
        error: (data?.error as string) || `Unexpected response: status ${response.status}`,
      });
    } catch (fetchError: unknown) {
      const err = fetchError as Error & { name: string; cause?: Error };
      console.error("Provider fetch failed:", {
        name: err.name,
        message: err.message,
        cause: err.cause?.message,
        url: apiUrl,
      });

      if (err.name === "AbortError") {
        return NextResponse.json({ success: false, error: "Connection timed out after 20s" });
      }

      return NextResponse.json({
        success: false,
        error: err.cause?.message || err.message || "Unknown fetch error",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Failed to test provider:", error);
    return NextResponse.json({ success: false, error: "Internal server error" });
  }
}
