"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
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
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";
  const [siteName, setSiteName] = useState("AmarFollower");
  const [logoUrl, setLogoUrl] = useState("");

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: urlToken, password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (urlToken) setValue("token", urlToken);
  }, [urlToken, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/login");
      }
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 mx-auto mb-2 object-contain" />
          ) : (
            <CardTitle className="text-2xl font-bold mb-1">{siteName}</CardTitle>
          )}
          <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter the reset code and your new password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {errors.token && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {errors.token.message}
              </div>
            )}
            {errors.password && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {errors.password.message}
              </div>
            )}
            {errors.confirmPassword && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {errors.confirmPassword.message}
              </div>
            )}
            <input type="hidden" {...register("token")} />
            <div className="space-y-2">
              <Label htmlFor="token">Reset Code</Label>
              <Input
                id="token"
                placeholder="Enter the code from email or SMS"
                {...register("token")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                {...register("password")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                {...register("confirmPassword")}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
            <p className="text-sm text-center text-gray-600">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Send a new code
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
