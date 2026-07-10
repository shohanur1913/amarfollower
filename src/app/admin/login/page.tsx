"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

const adminLoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginInput) => {
    setError("");

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Login failed");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
              <Shield className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-md border border-red-500/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
