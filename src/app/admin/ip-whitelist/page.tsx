"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditEntityDialog } from "@/components/admin/edit-entity-dialog";
import { useAdminIpWhitelist } from "@/lib/queries";
import { Shield, ShieldOff, Trash2, Pencil, Power } from "lucide-react";
import { toast } from "sonner";

interface IpEntry {
  id: number;
  userId: number;
  user: { username: string; email: string };
  ipAddress: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
}

interface BlacklistEntry {
  id: number;
  ipAddress: string;
  reason: string | null;
  createdAt: string;
}

export default function AdminIpWhitelistPage() {
  const { data, isLoading, refetch } = useAdminIpWhitelist();
  const whitelist: IpEntry[] = data?.whitelist || [];
  const blacklist: BlacklistEntry[] = data?.blacklist || [];
  const [activeTab, setActiveTab] = useState<"whitelist" | "blacklist">("whitelist");
  const [editItem, setEditItem] = useState<IpEntry | BlacklistEntry | null>(null);
  const [editType, setEditType] = useState<"whitelist" | "blacklist">("whitelist");
  const [editOpen, setEditOpen] = useState(false);

  const getWhitelistActions = (entry: IpEntry): TableAction[] => [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => { setEditItem(entry); setEditType("whitelist"); setEditOpen(true); },
    },
    {
      label: entry.isActive ? "Deactivate" : "Activate",
      icon: <Power className="h-4 w-4" />,
      onClick: async () => {
        try {
          const res = await fetch("/api/admin/ip-whitelist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: entry.id, type: "whitelist", isActive: !entry.isActive }),
          });
          if (res.ok) { toast.success(entry.isActive ? "Deactivated" : "Activated"); refetch(); }
          else toast.error("Failed to update");
        } catch { toast.error("Failed to update"); }
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Remove ${entry.ipAddress} from whitelist?`)) return;
        try {
          const res = await fetch(`/api/admin/ip-whitelist?type=whitelist&id=${entry.id}`, { method: "DELETE" });
          if (res.ok) { toast.success("Removed"); refetch(); }
          else toast.error("Failed to delete");
        } catch { toast.error("Failed to delete"); }
      },
      variant: "destructive",
      separator: true,
    },
  ];

  const getBlacklistActions = (entry: BlacklistEntry): TableAction[] => [
    {
      label: "Remove",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Remove ${entry.ipAddress} from blacklist?`)) return;
        try {
          const res = await fetch(`/api/admin/ip-whitelist?type=blacklist&id=${entry.id}`, { method: "DELETE" });
          if (res.ok) { toast.success("Removed"); refetch(); }
          else toast.error("Failed to remove");
        } catch { toast.error("Failed to remove"); }
      },
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">IP Whitelist / Blacklist</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Whitelisted IPs
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{whitelist.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldOff className="h-4 w-4 text-red-600" />
              Blacklisted IPs
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{blacklist.length}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === "whitelist" ? "default" : "outline"} onClick={() => setActiveTab("whitelist")}>Whitelist</Button>
        <Button variant={activeTab === "blacklist" ? "default" : "outline"} onClick={() => setActiveTab("blacklist")}>Blacklist</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{activeTab === "whitelist" ? "Whitelisted IPs" : "Blacklisted IPs"}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : activeTab === "whitelist" ? (
            whitelist.length === 0 ? <p>No whitelisted IPs.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">IP Address</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Label</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-left p-2">Added</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {whitelist.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2 font-mono">{entry.ipAddress}</td>
                        <td className="p-2">{entry.user.username}</td>
                        <td className="p-2">{entry.label || "—"}</td>
                        <td className="p-2 text-center">
                          <Badge className={entry.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-muted text-muted-foreground"}>
                            {entry.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2">{new Date(entry.createdAt).toLocaleDateString()}</td>
                        <td className="p-2 text-center"><TableActions actions={getWhitelistActions(entry)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : blacklist.length === 0 ? <p>No blacklisted IPs.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50 sticky top-0">
                  <th className="text-left p-2">IP Address</th>
                  <th className="text-left p-2">Reason</th>
                  <th className="text-left p-2">Added</th>
                  <th className="text-center p-2">Actions</th>
                </tr></thead>
                <tbody>
                  {blacklist.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-2 font-mono">{entry.ipAddress}</td>
                      <td className="p-2">{entry.reason || "—"}</td>
                      <td className="p-2">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 text-center"><TableActions actions={getBlacklistActions(entry)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editItem && editType === "whitelist" && (
        <EditEntityDialog
          title={`Edit IP — ${(editItem as IpEntry).ipAddress}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          fields={[
            { name: "label", label: "Label", type: "text", defaultValue: (editItem as IpEntry).label ?? "" },
            { name: "isActive", label: "Status", type: "select", defaultValue: (editItem as IpEntry).isActive ? 1 : 0, options: [{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }] },
          ]}
          onSave={async (data) => {
            const res = await fetch("/api/admin/ip-whitelist", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: editItem.id, type: "whitelist", isActive: data.isActive === 1, label: data.label }),
            });
            if (res.ok) { refetch(); return true; }
            return false;
          }}
        />
      )}
    </div>
  );
}
