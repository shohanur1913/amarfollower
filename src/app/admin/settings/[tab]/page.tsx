"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSettings } from "@/lib/queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Save, Loader2, Mail, MessageSquare, Upload, ImageIcon } from "lucide-react";

interface SettingsForm {
  site_name: string;
  site_url: string;
  site_description: string;
  site_keywords: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  currency_symbol: string;
  currency_code: string;
  usd_rate: string;
  processing_fee_percent: string;
  google_client_id: string;
  google_client_secret: string;
  captcha_type: string;
  captcha_site_key: string;
  captcha_secret_key: string;
  gemini_api_key: string;
  gemini_model: string;
  ai_merging: string;
  ai_triage: string;
  maintenance_mode: string;
  maintenance_title: string;
  maintenance_message: string;
  maintenance_contact: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  sms_api_key: string;
  sms_api_url: string;
  sms_device: string;
  sms_default_sim: string;
}

const VALID_TABS = ["general", "branding", "currency", "security", "notifications", "ai", "system"];

export default function AdminSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const tabParam = params.tab as string;
  const { data: initialSettings, isLoading } = useAdminSettings();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const [saving, setSaving] = useState(false);
  const [savingMail, setSavingMail] = useState(false);
  const [savingSms, setSavingSms] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [successMsg, setSuccessMsg] = useState("");
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testSmsOpen, setTestSmsOpen] = useState(false);
  const [testSmsPhone, setTestSmsPhone] = useState("");
  const [testSmsMessage, setTestSmsMessage] = useState("");
  const [testSmsSending, setTestSmsSending] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (field: "logo_url" | "favicon_url", file: File) => {
    setUploadingField(field);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const current = watch();
        reset({ ...current, [field]: data.url });
        toast.success(`${field === "logo_url" ? "Logo" : "Favicon"} uploaded!`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("general");
      router.replace("/admin/settings/general");
    }
  }, [tabParam, router]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SettingsForm>({
    defaultValues: {
      site_name: "Amar Follower",
      site_url: "",
      site_description: "",
      site_keywords: "",
      logo_url: "",
      favicon_url: "",
      primary_color: "#6366f1",
      secondary_color: "#0f172a",
      currency_symbol: "৳",
      currency_code: "BDT",
      usd_rate: "123.00",
      processing_fee_percent: "5.00",
      google_client_id: "",
      google_client_secret: "",
      captcha_type: "off",
      captcha_site_key: "",
      captcha_secret_key: "",
      gemini_api_key: "",
      gemini_model: "gemini-2.5-flash-lite",
      ai_merging: "on",
      ai_triage: "on",
      maintenance_mode: "off",
      maintenance_title: "Under Maintenance",
      maintenance_message: "We're currently performing scheduled maintenance. Please check back shortly.",
      maintenance_contact: "",
      smtp_host: "",
      smtp_port: "465",
      smtp_user: "",
      smtp_pass: "",
      sms_api_key: "",
      sms_api_url: "https://sms.fobign.com/api/v1/sms/send",
      sms_device: "",
      sms_default_sim: "1",
    },
  });

  useEffect(() => {
    if (initialSettings) {
      const s = initialSettings as Record<string, string>;
      reset({
        site_name: s.site_name || "Amar Follower",
        site_url: s.site_url || "",
        site_description: s.site_description || "",
        site_keywords: s.site_keywords || "",
        logo_url: s.logo_url || "",
        favicon_url: s.favicon_url || "",
        primary_color: s.primary_color || "#6366f1",
        secondary_color: s.secondary_color || "#0f172a",
        currency_symbol: s.currency_symbol || "৳",
        currency_code: s.currency_code || "BDT",
        usd_rate: s.usd_rate || "123.00",
        processing_fee_percent: s.processing_fee_percent || "5.00",
        google_client_id: s.google_client_id || "",
        google_client_secret: s.google_client_secret || "",
        captcha_type: s.captcha_type || "off",
        captcha_site_key: s.captcha_site_key || "",
        captcha_secret_key: s.captcha_secret_key || "",
        gemini_api_key: s.gemini_api_key || "",
        gemini_model: s.gemini_model || "gemini-2.5-flash-lite",
        ai_merging: s.ai_merging || "on",
        ai_triage: s.ai_triage || "on",
        maintenance_mode: s.maintenance_mode || "off",
        maintenance_title: s.maintenance_title || "Under Maintenance",
        maintenance_message: s.maintenance_message || "We're currently performing scheduled maintenance. Please check back shortly.",
        maintenance_contact: s.maintenance_contact || "",
        smtp_host: s.smtp_host || "",
        smtp_port: s.smtp_port || "465",
        smtp_user: s.smtp_user || "",
        smtp_pass: s.smtp_pass || "",
        sms_api_key: s.sms_api_key || "",
        sms_api_url: s.sms_api_url || "https://sms.fobign.com/api/v1/sms/send",
        sms_device: s.sms_device || "",
        sms_default_sim: s.sms_default_sim || "1",
      });
    }
  }, [initialSettings, reset]);

  const onSubmit = async (data: SettingsForm) => {
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccessMsg("Settings saved successfully!");
        toast.success("Settings saved!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const saveMail = async () => {
    setSavingMail(true);
    try {
      const data = watch();
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtp_host: data.smtp_host,
          smtp_port: data.smtp_port,
          smtp_user: data.smtp_user,
          smtp_pass: data.smtp_pass,
        }),
      });
      if (res.ok) {
        toast.success("Mail settings saved!");
      } else {
        toast.error("Failed to save mail settings");
      }
    } catch {
      toast.error("Failed to save mail settings");
    } finally {
      setSavingMail(false);
    }
  };

  const saveSms = async () => {
    setSavingSms(true);
    try {
      const data = watch();
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sms_api_key: data.sms_api_key,
          sms_api_url: data.sms_api_url,
          sms_device: data.sms_device,
          sms_default_sim: data.sms_default_sim,
        }),
      });
      if (res.ok) {
        toast.success("SMS settings saved!");
      } else {
        toast.error("Failed to save SMS settings");
      }
    } catch {
      toast.error("Failed to save SMS settings");
    } finally {
      setSavingSms(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your panel identity, branding, currency, and security</p>
        </div>
        {hydrated && isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 font-medium">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-6">
          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* General */}
            {activeTab === "general" && (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Panel Identity</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Site Name</Label>
                          <Input {...register("site_name")} placeholder="Amar Follower" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Site URL</Label>
                          <Input {...register("site_url")} placeholder="https://amarfollower.com" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">SEO & Description</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Site Description</Label>
                          <Textarea {...register("site_description")} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">SEO Keywords</Label>
                          <Input {...register("site_keywords")} placeholder="smm, social media, followers, likes" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Branding */}
                {activeTab === "branding" && (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Logo & Favicon</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase">Logo</Label>
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                              {watch("logo_url") ? (
                                <img src={watch("logo_url")} alt="Logo preview" className="h-full w-full object-contain" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input {...register("logo_url")} placeholder="assets/logo.png" />
                              <div className="flex gap-2">
                                <input type="file" ref={logoInputRef} accept="image/png,image/jpeg,image/gif,image/svg+xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload("logo_url", f); e.target.value = ""; }} />
                                <Button type="button" variant="outline" size="sm" disabled={uploadingField === "logo_url"} onClick={() => logoInputRef.current?.click()}>
                                  {uploadingField === "logo_url" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                  {uploadingField === "logo_url" ? "Uploading..." : "Upload"}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Recommended: 200x200px PNG. Max 2MB.</p>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase">Favicon</Label>
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                              {watch("favicon_url") ? (
                                <img src={watch("favicon_url")} alt="Favicon preview" className="h-full w-full object-contain" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input {...register("favicon_url")} placeholder="assets/favicon.png" />
                              <div className="flex gap-2">
                                <input type="file" ref={faviconInputRef} accept="image/png,image/jpeg,image/gif,image/svg+xml,image/x-icon" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload("favicon_url", f); e.target.value = ""; }} />
                                <Button type="button" variant="outline" size="sm" disabled={uploadingField === "favicon_url"} onClick={() => faviconInputRef.current?.click()}>
                                  {uploadingField === "favicon_url" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                  {uploadingField === "favicon_url" ? "Uploading..." : "Upload"}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Recommended: 32x32px PNG/ICO. Max 2MB.</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Colors</h3>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Primary Color</Label>
                          <div className="flex items-center gap-4">
                            <Input {...register("primary_color")} className="flex-1 font-mono" />
                            <input type="color" {...register("primary_color")} className="h-10 w-10 border-none bg-transparent cursor-pointer rounded" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Secondary Color</Label>
                          <div className="flex items-center gap-4">
                            <Input {...register("secondary_color")} className="flex-1 font-mono" />
                            <input type="color" {...register("secondary_color")} className="h-10 w-10 border-none bg-transparent cursor-pointer rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Currency */}
                {activeTab === "currency" && (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Currency & Rates</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Currency Symbol</Label>
                          <Input {...register("currency_symbol")} placeholder="৳" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Currency Code</Label>
                          <Input {...register("currency_code")} placeholder="BDT" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">USD Exchange Rate ($1 = ?)</Label>
                          <Input {...register("usd_rate")} placeholder="123.00" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Processing Fee (%)</Label>
                          <Input {...register("processing_fee_percent")} placeholder="5.00" />
                          <p className="text-xs text-muted-foreground">Example: 5.00 for 5% fee</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Google Social Login</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Google Client ID</Label>
                          <Input {...register("google_client_id")} placeholder="xxx-xxx.apps.googleusercontent.com" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Google Client Secret</Label>
                          <Input type="password" {...register("google_client_secret")} placeholder="GOCSPX-xxxx" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Anti-Spam (Captcha)</h3>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Captcha Provider</Label>
                          <select {...register("captcha_type")} className="w-full border rounded-md px-4 py-2 text-sm">
                            <option value="off">Disabled</option>
                            <option value="cloudflare">Cloudflare Turnstile</option>
                            <option value="google">Google reCAPTCHA v2</option>
                          </select>
                        </div>
                        {watch("captcha_type") !== "off" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase">Site Key</Label>
                              <Input {...register("captcha_site_key")} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase">Secret Key</Label>
                              <Input type="password" {...register("captcha_secret_key")} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">SMTP / Mail Settings</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">SMTP Host</Label>
                          <Input {...register("smtp_host")} placeholder="smtp.gmail.com" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">SMTP Port</Label>
                          <Input {...register("smtp_port")} placeholder="465" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">SMTP User</Label>
                          <Input {...register("smtp_user")} placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">SMTP Password</Label>
                          <Input type="password" {...register("smtp_pass")} />
                        </div>
                      </div>
                      <div className="px-6 py-4 border-t bg-muted/50 flex justify-end">
                        <Button type="button" disabled={savingMail} onClick={saveMail} className="gap-2">
                          {savingMail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {savingMail ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold">Test Email</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">Send a test email to verify your SMTP configuration is working.</p>
                        <Button type="button" variant="outline" onClick={() => { setTestEmailOpen(true); setTestResult(null); setTestEmail(""); }}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Test Email
                        </Button>
                      </div>
                    </div>

                    <Dialog open={testEmailOpen} onOpenChange={(open) => { setTestEmailOpen(open); if (!open) setTestResult(null); }}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Send Test Email</DialogTitle>
                          <DialogDescription>Enter an email address to receive the test message.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase">Recipient Email</Label>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                            />
                          </div>
                          {testResult && (
                            <div className={`p-3 rounded-md text-sm ${testResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                              {testResult.message}
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            disabled={testSending || !testEmail}
                            onClick={async () => {
                              setTestSending(true);
                              setTestResult(null);
                              try {
                                const res = await fetch("/api/admin/settings/test-email", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ email: testEmail }),
                                });
                                const data = await res.json();
                                setTestResult({ ok: res.ok, message: data.message || (res.ok ? "Test email sent!" : "Failed to send") });
                              } catch {
                                setTestResult({ ok: false, message: "Network error. Check server logs." });
                              } finally {
                                setTestSending(false);
                              }
                            }}
                          >
                            {testSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                            {testSending ? "Sending..." : "Send"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* SMS Gateway */}
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">SMS Gateway Configuration</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">API Key</Label>
                          <Input {...register("sms_api_key")} placeholder="X2GBM18HNNQF95TH35D6OWK4SPIWZXS776GU5NFZ" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">API URL</Label>
                          <Input {...register("sms_api_url")} placeholder="https://sms.fobign.com/api/v1/sms/send" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Device ID</Label>
                          <Input {...register("sms_device")} placeholder="Your device ID from SMS panel" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Default SIM Slot</Label>
                          <Input {...register("sms_default_sim")} placeholder="1" />
                          <p className="text-xs text-muted-foreground">SIM slot number (1 or 2) for multi-SIM devices</p>
                        </div>
                      </div>
                      <div className="px-6 py-4 border-t bg-muted/50 flex justify-end">
                        <Button type="button" disabled={savingSms} onClick={saveSms} className="gap-2">
                          {savingSms ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {savingSms ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold">Test SMS</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">Send a test SMS to verify your SMS gateway configuration is working.</p>
                        <Button type="button" variant="outline" onClick={() => { setTestSmsOpen(true); setTestSmsResult(null); setTestSmsPhone(""); setTestSmsMessage(""); }}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Test SMS
                        </Button>
                      </div>
                    </div>

                    <Dialog open={testSmsOpen} onOpenChange={(open) => { setTestSmsOpen(open); if (!open) setTestSmsResult(null); }}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Send Test SMS</DialogTitle>
                          <DialogDescription>Enter a phone number and message to send a test SMS.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase">Phone Number</Label>
                            <div className="flex">
                              <span className="inline-flex items-center gap-1 rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                <span className="text-lg leading-none">🇧🇩</span>
                                <span>+88</span>
                              </span>
                              <Input
                                type="tel"
                                placeholder="01XXXXXXXXX"
                                maxLength={11}
                                className="rounded-l-none"
                                value={testSmsPhone}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  if (val.length <= 11) setTestSmsPhone(val);
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase">Message</Label>
                            <Textarea
                              placeholder="Your test message here..."
                              value={testSmsMessage}
                              onChange={(e) => setTestSmsMessage(e.target.value)}
                              rows={3}
                              maxLength={160}
                            />
                            <p className="text-xs text-muted-foreground text-right">{testSmsMessage.length}/160</p>
                          </div>
                          {testSmsResult && (
                            <div className={`p-3 rounded-md text-sm ${testSmsResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                              {testSmsResult.message}
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            disabled={testSmsSending || !testSmsPhone || !testSmsMessage}
                            onClick={async () => {
                              setTestSmsSending(true);
                              setTestSmsResult(null);
                              try {
                                const res = await fetch("/api/admin/settings/test-sms", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ phone: `+88${testSmsPhone}`, message: testSmsMessage }),
                                });
                                const data = await res.json();
                                setTestSmsResult({ ok: res.ok, message: data.message || (res.ok ? "Test SMS sent!" : "Failed to send") });
                              } catch {
                                setTestSmsResult({ ok: false, message: "Network error. Check server logs." });
                              } finally {
                                setTestSmsSending(false);
                              }
                            }}
                          >
                            {testSmsSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                            {testSmsSending ? "Sending..." : "Send"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* AI */}
                {activeTab === "ai" && (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Gemini AI Engine</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Gemini API Key</Label>
                          <Input type="password" {...register("gemini_api_key")} placeholder="AIzaSy..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Model Name</Label>
                          <Input {...register("gemini_model")} placeholder="gemini-2.5-flash-lite" />
                          <p className="text-xs text-muted-foreground">e.g. gemini-2.5-flash-lite</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">Smart Features</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-md border">
                          <div>
                            <h4 className="text-sm font-bold">Smart Merging</h4>
                            <p className="text-xs text-muted-foreground">Auto-combine tickets</p>
                          </div>
                          <select {...register("ai_merging")} className="border rounded px-2 py-1 text-sm">
                            <option value="on">On</option>
                            <option value="off">Off</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted rounded-md border">
                          <div>
                            <h4 className="text-sm font-bold">Auto Triage</h4>
                            <p className="text-xs text-muted-foreground">Generate To-Do list</p>
                          </div>
                          <select {...register("ai_triage")} className="border rounded px-2 py-1 text-sm">
                            <option value="on">On</option>
                            <option value="off">Off</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* System */}
                {activeTab === "system" && (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-md shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="text-sm font-bold">System Status</h3>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold">Maintenance Mode</h4>
                            <p className="text-xs text-muted-foreground">Block user access while updating the panel</p>
                          </div>
                          <select {...register("maintenance_mode")} className="border rounded-md px-4 py-2 text-sm font-medium">
                            <option value="off">Online</option>
                            <option value="on">Maintenance</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Page Title</Label>
                          <Input {...register("maintenance_title")} placeholder="Under Maintenance" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Message</Label>
                          <Textarea {...register("maintenance_message")} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Support Contact</Label>
                          <Input {...register("maintenance_contact")} placeholder="support@example.com or +880..." />
                          <p className="text-xs text-muted-foreground">Optional. Shown on maintenance page.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button type="submit" className="gap-2 min-w-[160px]" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
    </div>
  );
}
