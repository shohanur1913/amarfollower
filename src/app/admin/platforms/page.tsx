"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableActions, TableAction } from "@/components/table-actions";
import { PlatformIcon } from "@/components/platform-icon";
import { useAdminPlatforms } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Power, X } from "lucide-react";
import { toast } from "sonner";

interface Platform {
  id: number;
  name: string;
  icon_class: string;
  sortOrder: number;
  status: number;
  _count: { categories: number };
}

const ICON_PRESETS = [
  { name: "Instagram", value: "instagram" },
  { name: "Facebook", value: "facebook" },
  { name: "Twitter/X", value: "twitter" },
  { name: "YouTube", value: "youtube" },
  { name: "TikTok", value: "tiktok" },
  { name: "Telegram", value: "telegram" },
  { name: "Spotify", value: "spotify" },
  { name: "LinkedIn", value: "linkedin" },
  { name: "Pinterest", value: "pinterest" },
  { name: "Snapchat", value: "snapchat" },
  { name: "Reddit", value: "reddit" },
  { name: "Twitch", value: "twitch" },
  { name: "Discord", value: "discord" },
  { name: "WhatsApp", value: "whatsapp" },
  { name: "GitHub", value: "github" },
  { name: "Threads", value: "threads" },
];

export default function AdminPlatformsPage() {
  const queryClient = useQueryClient();
  const { data: platforms = [], isLoading } = useAdminPlatforms();
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editSort, setEditSort] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setEditName(platform.name);
    setEditIcon(platform.icon_class || "");
    setEditSort(platform.sortOrder);
  };

  const handleSave = async () => {
    if (!editingPlatform) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlatform.id,
          name: editName,
          icon_class: editIcon,
          sortOrder: editSort,
        }),
      });
      if (res.ok) {
        toast.success("Platform updated!");
        setEditingPlatform(null);
        queryClient.invalidateQueries({ queryKey: ["admin-platforms"] });
      } else {
        toast.error("Failed to update platform");
      }
    } catch {
      toast.error("Failed to update platform");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (platform: Platform) => {
    try {
      const res = await fetch("/api/admin/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: platform.id, status: platform.status === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        toast.success(`Platform ${platform.status === 1 ? "deactivated" : "activated"}`);
        queryClient.invalidateQueries({ queryKey: ["admin-platforms"] });
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (platform: Platform) => {
    if (!confirm(`Delete platform "${platform.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/platforms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: platform.id }),
      });
      if (res.ok) {
        toast.success("Platform deleted");
        queryClient.invalidateQueries({ queryKey: ["admin-platforms"] });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete platform");
      }
    } catch {
      toast.error("Failed to delete platform");
    }
  };

  const getPlatformActions = (platform: Platform): TableAction[] => [
    { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => handleEdit(platform) },
    { label: platform.status === 1 ? "Deactivate" : "Activate", icon: <Power className="h-4 w-4" />, onClick: () => handleToggleStatus(platform) },
    { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => handleDelete(platform), variant: "destructive", separator: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platforms</h1>
        <Button onClick={() => { setEditingPlatform(null); setEditName(""); setEditIcon(""); setEditSort(0); }}>Add Platform</Button>
      </div>

      {editingPlatform && (
        <div className="bg-card border rounded-md shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{editingPlatform.id ? "Edit" : "Add"} Platform</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditingPlatform(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Instagram" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Icon Key</Label>
              <Input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} placeholder="instagram" />
              <p className="text-[10px] text-muted-foreground">Use: instagram, facebook, youtube, tiktok, telegram, spotify, etc.</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {ICON_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setEditIcon(preset.value)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                      editIcon === preset.value ? "bg-primary text-white border-primary" : "bg-muted hover:bg-muted/80 border-border"
                    }`}
                  >
                    <PlatformIcon iconClass={preset.value} size={12} />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Sort Order</Label>
              <Input type="number" value={editSort} onChange={(e) => setEditSort(Number(e.target.value))} />
              <div className="mt-2 p-3 bg-muted/50 rounded-md">
                <Label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Preview</Label>
                <div className="flex items-center gap-2">
                  <PlatformIcon iconClass={editIcon} name={editName} size={24} />
                  <span className="font-medium">{editName || "Platform Name"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingPlatform(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>All Platforms ({platforms.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p>Loading...</p> : platforms.length === 0 ? <p>No platforms.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50 sticky top-0">
                  <th className="text-left p-2">ID</th>
                  <th className="text-center p-2">Icon</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-right p-2">Sort</th>
                  <th className="text-right p-2">Categories</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-center p-2">Actions</th>
                </tr></thead>
                <tbody>
                  {(platforms as Platform[]).map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-2">{p.id}</td>
                      <td className="p-2 text-center">
                        <div className="inline-flex items-center justify-center">
                          <PlatformIcon iconClass={p.icon_class} name={p.name} size={28} />
                        </div>
                      </td>
                      <td className="p-2 font-medium">{p.name}</td>
                      <td className="p-2 text-right">{p.sortOrder}</td>
                      <td className="p-2 text-right">{p._count.categories}</td>
                      <td className="p-2 text-center">
                        <Badge className={p.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {p.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        <TableActions actions={getPlatformActions(p)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
