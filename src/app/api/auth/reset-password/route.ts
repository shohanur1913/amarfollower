import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashResetToken } from "@/lib/auth";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset code is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const hashedToken = hashResetToken(token);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now login.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
