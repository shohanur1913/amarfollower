import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email";
import { sendSmsViaGateway } from "@/lib/sms";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email or phone is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const isEmail = email.includes("@");
    const user = isEmail
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findFirst({
          where: {
            OR: [
              { phone: email },
              { phone: `+88${email}` },
            ],
          },
        });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If that account exists, a reset code has been sent.",
      });
    }

    const { raw, hash } = generateResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hash,
        resetExpires: expires,
      },
    });

    if (isEmail) {
      const html = passwordResetEmail(user.username, raw);
      await sendEmail({
        to: user.email,
        subject: "Password Reset - AmarFollower",
        html,
      });
    } else {
      const phone = user.phone?.startsWith("+88") ? user.phone : `+88${user.phone}`;
      const message = `AmarFollower: Your password reset code is: ${raw}. It expires in 1 hour.`;
      await sendSmsViaGateway(phone, message);
    }

    return NextResponse.json({
      success: true,
      message: "If that account exists, a reset code has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
