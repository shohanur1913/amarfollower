import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { sendEmail, passwordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(await request.json());

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return NextResponse.json({
        success: true,
        message: "If that account exists, a reset link has been sent.",
      });
    }

    const { raw, hash } = generateResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken: hash,
        resetExpires: expires,
      },
    });

    const html = passwordResetEmail(admin.username, raw);
    await sendEmail({
      to: admin.email,
      subject: "Admin Password Reset - AmarFollower",
      html,
    });

    return NextResponse.json({
      success: true,
      message: "If that account exists, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Admin forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
