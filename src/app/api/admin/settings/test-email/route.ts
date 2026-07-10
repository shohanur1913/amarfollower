import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const user = await getSession("admin");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }

    const ok = await sendEmail({
      to: email,
      subject: "Test Email from AmarFollower",
      html: "<p>This is a test email to verify your SMTP configuration is working correctly.</p>",
    });

    if (!ok) {
      return NextResponse.json({ message: "SMTP not configured or failed to send" }, { status: 500 });
    }

    return NextResponse.json({ message: "Test email sent successfully!" });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to send test email" }, { status: 500 });
  }
}
