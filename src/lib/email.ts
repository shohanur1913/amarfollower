import nodemailer from "nodemailer";
import { prisma } from "./prisma";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "site_name"] } },
    });

    const smtpMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const host = smtpMap.smtp_host;
    const port = parseInt(smtpMap.smtp_port || "587");
    const smtpUser = smtpMap.smtp_user;
    const smtpPass = smtpMap.smtp_pass;
    const siteName = smtpMap.site_name || "AmarFollower";

    if (!host || !smtpUser || !smtpPass) {
      return false;
    }

    const trySend = async (portOverride?: number, forceSecure?: boolean) => {
      const p = portOverride ?? port;
      const t = nodemailer.createTransport({
        host,
        port: p,
        secure: forceSecure ?? false,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
        greetingTimeout: 15 * 1000,
      });
      await t.sendMail({
        from: `"${siteName}" <${smtpUser}>`,
        to,
        subject,
        html,
      });
      t.close();
    };

    try {
      await trySend();
    } catch (firstErr) {
      const errMsg = firstErr instanceof Error ? firstErr.message : "";
      if (errMsg.includes("Greeting never received") && port !== 465) {
        await trySend(465, true);
      } else {
        throw firstErr;
      }
    }

    await prisma.emailLog.create({
      data: { to, subject, body: html, status: "sent" },
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function orderConfirmationEmail(username: string, orderId: number, serviceName: string, quantity: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Order Confirmed</h2>
      <p>Hi ${username},</p>
      <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
      </div>
      <p>You can track your order status in your dashboard.</p>
      <p>Thanks,<br/>AmarFollower Team</p>
    </div>
  `;
}

export function orderStatusEmail(username: string, orderId: number, status: string) {
  const statusColors: Record<string, string> = {
    completed: "#16a34a",
    in_progress: "#2563eb",
    pending: "#ca8a04",
    cancelled: "#dc2626",
  };
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Order Status Update</h2>
      <p>Hi ${username},</p>
      <p>Your order <strong>#${orderId}</strong> status has been updated to 
        <span style="color: ${statusColors[status] || "#000"}; font-weight: bold;">${status}</span>.
      </p>
      <p>Thanks,<br/>AmarFollower Team</p>
    </div>
  `;
}

export function ticketReplyEmail(username: string, ticketId: number, subject: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Reply on Ticket #${ticketId}</h2>
      <p>Hi ${username},</p>
      <p>A new reply has been posted on your ticket: <strong>${subject}</strong></p>
      <p>Login to your account to view and reply.</p>
      <p>Thanks,<br/>AmarFollower Team</p>
    </div>
  `;
}

export function passwordResetEmail(username: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
      <p>Your reset code is: <strong style="font-size: 18px; letter-spacing: 2px;">${token}</strong></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Thanks,<br/>AmarFollower Team</p>
    </div>
  `;
}

export function refillApprovedEmail(username: string, orderId: number, amount: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Refill Approved</h2>
      <p>Hi ${username},</p>
      <p>Your refill request for order <strong>#${orderId}</strong> has been approved.</p>
      <p><strong>Amount credited:</strong> $${amount.toFixed(2)}</p>
      <p>Thanks,<br/>AmarFollower Team</p>
    </div>
  `;
}
