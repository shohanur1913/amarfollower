"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/lib/queries";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  balance: number;
  referralCode: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
}

function SkeletonForm() {
  return (
    <div className="space-y-4">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-9 bg-muted animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUserProfile() as { data: UserProfile | undefined; isLoading: boolean };
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        phone: user.phone?.replace(/^\+88/, "") || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          phone: data.phone ? `+88${data.phone}` : undefined,
          currentPassword: data.currentPassword || undefined,
          newPassword: data.newPassword || undefined,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      reset({ ...data, currentPassword: "", newPassword: "" });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              [1,2,3,4,5,6,7].map((i) => (
                <div key={i} className="h-5 bg-muted animate-pulse rounded w-3/4" />
              ))
            ) : (
              <>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Phone:</strong> {user?.phone || "Not set"}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>Balance:</strong> ৳{Number(user?.balance || 0).toFixed(2)}</p>
                <p><strong>Referral Code:</strong> {user?.referralCode || "N/A"}</p>
                <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <SkeletonForm /> : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...register("username")} />
                  {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center gap-1 rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      <span className="text-lg leading-none">🇧🇩</span>
                      <span>+88</span>
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="rounded-l-none"
                      {...register("phone")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 11) e.target.value = val;
                      }}
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password (to change password)</Label>
                  <Input id="currentPassword" type="password" {...register("currentPassword")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...register("newPassword")} />
                  {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {isLoading ? (
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              ) : user?.twoFactorEnabled ? (
                "2FA is enabled. You can disable it from your account settings."
              ) : (
                "Add an extra layer of security to your account by enabling two-factor authentication."
              )}
            </p>
            {!isLoading && (
              <Button
                variant={user?.twoFactorEnabled ? "destructive" : "default"}
                onClick={async () => {
                  if (user?.twoFactorEnabled) {
                    const confirmed = confirm("Disable 2FA?");
                    if (!confirmed) return;
                    try {
                      const res = await fetch("/api/user/2fa/disable", { method: "POST" });
                      if (res.ok) {
                        toast.success("2FA disabled");
                        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
                      } else {
                        toast.error("Failed to disable 2FA");
                      }
                    } catch {
                      toast.error("Failed to disable 2FA");
                    }
                  } else {
                    try {
                      const res = await fetch("/api/user/2fa/setup", { method: "POST" });
                      const data = await res.json();
                      if (data?.secret && data?.uri) {
                        toast.success("2FA setup initiated. Scan the QR code.");
                      } else {
                        toast.error(data?.error || "Failed to setup 2FA");
                      }
                    } catch {
                      toast.error("Failed to setup 2FA");
                    }
                  }
                }}
              >
                {user?.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
