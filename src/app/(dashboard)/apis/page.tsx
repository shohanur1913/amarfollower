"use client";

import { useState } from "react";
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

export default function ApisPage() {
  const { data: keys = [], isLoading } = useUserApiKeys();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setOpen(false);
        setName("");
      }
    } catch {
      console.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this API key?")) return;

    try {
      await fetch(`/api/user/api-keys/${id}`, { method: "DELETE" });
    } catch {
      console.error("Failed to delete API key");
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
            <p className="text-muted-foreground">Loading...</p>
          ) : keys.length === 0 ? (
            <p className="text-muted-foreground">No API keys yet.</p>
          ) : (
            <div className="space-y-4">
              {(keys as ApiKey[]).map((apiKey) => (
                <div key={apiKey.id} className="p-4 border rounded-lg">
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

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>Use your API key in the <code>X-API-Key</code> header to authenticate requests.</p>
          <h3>Base URL</h3>
          <code>https://amarfollower.com/api/v2</code>
          <h3>Endpoints</h3>
          <ul>
            <li><code>POST /api/v2/add</code> - Add a new order</li>
            <li><code>GET /api/v2/status</code> - Check order status</li>
            <li><code>GET /api/v2/services</code> - List services</li>
            <li><code>GET /api/v2/balance</code> - Check balance</li>
          </ul>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My API Key"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? "Creating..." : "Create Key"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
