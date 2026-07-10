import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone, message } = await request.json();
    if (!phone || !message) {
      return NextResponse.json({ message: "Phone number and message are required" }, { status: 400 });
    }

    const settings = await prisma.setting.findMany({
      where: { key: { in: ["sms_api_key", "sms_api_url", "sms_device", "sms_default_sim"] } },
    });

    const smsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const apiKey = smsMap.sms_api_key;
    const apiUrl = smsMap.sms_api_url || "https://sms.fobign.com/api/v1/sms/send";
    const device = smsMap.sms_device;
    const defaultSim = smsMap.sms_default_sim || "1";

    if (!apiKey || !device) {
      return NextResponse.json({ message: "SMS gateway not configured. Save API key and device ID first." }, { status: 400 });
    }

    const body = new URLSearchParams();
    body.append("message", message);
    body.append("mobile_number", phone);
    body.append("device", device);
    body.append("device_sim", defaultSim);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await res.json();

    await prisma.smsLog.create({
      data: {
        phone,
        message,
        status: res.ok ? "sent" : "failed",
        error: res.ok ? null : (data.message || "Unknown error"),
      },
    });

    if (res.ok) {
      return NextResponse.json({ message: "Test SMS sent successfully!" });
    } else {
      return NextResponse.json({ message: data.message || "Failed to send SMS" }, { status: 422 });
    }
  } catch (error) {
    console.error("Test SMS error:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to send test SMS" }, { status: 500 });
  }
}
