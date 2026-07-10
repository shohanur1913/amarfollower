"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

export default function TwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState("AmarFollower");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.site_name) setSiteName(data.site_name);
        if (data?.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !userId) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), token: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 mx-auto mb-2 object-contain" />
          ) : (
            <CardTitle className="text-2xl font-bold">{siteName}</CardTitle>
          )}
          <CardDescription>Two-Factor Authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground mb-6">
            Enter the 6-digit code from your authenticator app.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Authentication Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={loading || code.length < 6}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
