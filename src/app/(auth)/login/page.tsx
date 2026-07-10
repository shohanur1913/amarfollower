"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleStatus, setGoogleStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [siteName, setSiteName] = useState("AmarFollower");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.google_client_id) {
          setGoogleClientId(data.google_client_id);
        }
        if (data?.site_name) setSiteName(data.site_name);
        if (data?.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!googleClientId) return;
    setGoogleStatus("loading");

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    const handleLoad = () => {
      const win = window as unknown as Record<string, unknown>;
      if (!win.google) {
        setGoogleStatus("error");
        return;
      }

      const google = win.google as Record<string, unknown>;
      const accounts = google.accounts as Record<string, unknown> | undefined;
      const id = accounts?.id as Record<string, unknown> | undefined;

      if (!id || typeof id.initialize !== "function") {
        setGoogleStatus("error");
        return;
      }

      id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: response.credential }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data?.success) {
                router.push("/dashboard");
              } else {
                setError(data?.error || "Google sign-in failed");
              }
            })
            .catch(() => setError("Google sign-in failed"));
        },
      });

      const buttonDiv = document.getElementById("google-signin-button");
      if (buttonDiv && typeof id.render === "function") {
        id.render(buttonDiv, {
          type: "standard",
          theme: "outline",
          width: "100%",
          size: "large",
        });
      }

      setGoogleStatus("ready");
    };

    script.onload = handleLoad;
    script.onerror = () => setGoogleStatus("error");

    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId, router]);

  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (data: LoginInput) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Login failed");
        return;
      }

      if (result.require2FA) {
        router.push(`/2fa?userId=${result.userId}`);
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
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <div className="flex">
                {loginMode === "phone" && (
                  <span className="inline-flex items-center gap-1 rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground shrink-0">
                    <span className="text-lg leading-none">🇧🇩</span>
                    <span>+88</span>
                  </span>
                )}
                <Input
                  id="email"
                  type={loginMode === "email" ? "email" : "tel"}
                  placeholder={loginMode === "email" ? "you@example.com" : "01XXXXXXXXX"}
                  maxLength={loginMode === "phone" ? 11 : undefined}
                  className={loginMode === "phone" ? "rounded-l-none" : ""}
                  value={emailValue || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isPhone = /^\d+$/.test(val) || val.startsWith("01");
                    if (isPhone && val.length <= 11) {
                      setLoginMode("phone");
                      setValue("email", val, { shouldValidate: true });
                    } else {
                      setLoginMode("email");
                      setValue("email", val, { shouldValidate: true });
                    }
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {googleClientId && (
              <>
                <p className="text-xs text-center text-gray-500 uppercase tracking-wider font-semibold">Or</p>
                <div className="flex flex-col items-center gap-2">
                  <div
                    id="google-signin-button"
                    className="flex justify-center"
                  />
                  <GoogleFallbackButton
                    status={googleStatus}
                    clientId={googleClientId}
                  />
                </div>
              </>
            )}

            <p className="text-sm text-center">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function GoogleFallbackButton({
  status,
  clientId,
}: {
  status: string;
  clientId: string;
}) {
  const handleClick = () => {
    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        window.location.origin + "/login"
      )}&response_type=token&scope=openid%20email%20profile`,
      "google-oauth",
      "width=500,height=600"
    );
    if (!popup) {
      alert("Please allow popups for this site.");
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleClick}
      type="button"
      disabled={status === "loading"}
    >
      {status === "loading" ? (
        "Loading Google Sign-In..."
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
}
