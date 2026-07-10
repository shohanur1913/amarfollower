"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [siteName, setSiteName] = useState("AmarFollower");
  const [logoUrl, setLogoUrl] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.site_name) setSiteName(data.site_name);
        if (data?.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const emailValue = watch("email");
  const isPhone = /^\d+$/.test(emailValue || "") || (emailValue || "").startsWith("01");

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSent(true);
      }
    } catch {}
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 mx-auto mb-2 object-contain" />
            ) : null}
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your {isPhone ? "Phone" : "Email"}</CardTitle>
            <CardDescription>
              If that account exists, a reset code has been sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-600">
            <p>
              Please check your {isPhone ? "SMS messages" : "email inbox (and spam folder)"} for the reset code.
              The code expires in 1 hour.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/reset-password" className="w-full">
              <Button variant="outline" className="w-full" type="button">
                I Have a Reset Code
              </Button>
            </Link>
            <Button variant="ghost" className="w-full" onClick={() => setSent(false)} type="button">
              Send Again
            </Button>
            <p className="text-sm text-center text-gray-600">
              Remember your password?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 mx-auto mb-2 object-contain" />
          ) : (
            <CardTitle className="text-2xl font-bold mb-1">{siteName}</CardTitle>
          )}
          <CardTitle className="text-xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email or phone number to receive a reset code
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {errors.email && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {errors.email.message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <div className="flex">
                {isPhone && (
                  <span className="inline-flex items-center gap-1 rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground shrink-0">
                    <span className="text-lg leading-none">🇧🇩</span>
                    <span>+88</span>
                  </span>
                )}
                <Input
                  id="email"
                  type={isPhone ? "tel" : "text"}
                  placeholder={isPhone ? "01XXXXXXXXX" : "you@example.com"}
                  maxLength={isPhone ? 11 : undefined}
                  className={isPhone ? "rounded-l-none" : ""}
                  {...register("email")}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Remember your password?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
