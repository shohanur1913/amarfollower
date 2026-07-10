"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserApiKeys } from "@/lib/queries";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  isActive: boolean;
  lastUsed: string | null;
  createdAt: string;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        </div>
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const { data: keys = [], isLoading } = useUserApiKeys();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const refreshKeys = () => queryClient.invalidateQueries({ queryKey: ["user-api-keys"] });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const body = await res.json();

      if (res.ok) {
        toast.success("API key created!");
        setOpen(false);
        setName("");
        refreshKeys();
      } else {
        toast.error(body.error || "Failed to create API key");
      }
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this API key?")) return;

    try {
      const res = await fetch(`/api/user/api-keys/${id}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("API key deleted");
        refreshKeys();
      } else {
        toast.error("Failed to delete API key");
      }
    } catch {
      toast.error("Failed to delete API key");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={() => setOpen(true)}>Create API Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : keys.length === 0 ? (
            <p className="text-muted-foreground">No API keys yet.</p>
          ) : (
            <div className="space-y-4">
              {(keys as ApiKey[]).map((apiKey) => (
                <div key={apiKey.id} className="flex flex-col gap-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="text-sm font-mono text-gray-600">{apiKey.key}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsed && ` | Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(apiKey.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
