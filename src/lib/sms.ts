import twilio from "twilio";
import { prisma } from "./prisma";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface SendSmsOptions {
  to: string;
  body: string;
}

export async function sendSms({ to, body }: SendSmsOptions) {
  try {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn("Twilio credentials not configured");
      return false;
    }

    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to,
    });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

export async function sendSmsViaGateway(phone: string, message: string): Promise<boolean> {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["sms_api_key", "sms_api_url", "sms_device", "sms_default_sim"] } },
    });

    const smsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const apiKey = smsMap.sms_api_key;
    const apiUrl = smsMap.sms_api_url || "https://sms.fobign.com/api/v1/sms/send";
    const device = smsMap.sms_device;
    const defaultSim = smsMap.sms_default_sim || "1";

    if (!apiKey || !device) return false;

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

    return res.ok;
  } catch (error) {
    console.error("SMS gateway error:", error);
    return false;
  }
}

export function orderStatusSms(orderId: number, status: string) {
  return `AmarFollower: Your order #${orderId} is now ${status}. Login to dashboard for details.`;
}

export function refillApprovedSms(orderId: number, amount: number) {
  return `AmarFollower: Your refill for order #${orderId} has been approved. $${amount.toFixed(2)} has been credited to your account.`;
}

export function verificationCodeSms(code: string) {
  return `AmarFollower: Your verification code is ${code}. Do not share this with anyone.`;
}
