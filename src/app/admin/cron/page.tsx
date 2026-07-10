"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Play, RefreshCw } from "lucide-react";

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

interface CronLog {
  id: number;
  action: string;
  result: string;
  createdAt: string;
}

export default function AdminCronPage() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-cron-logs"],
    queryFn: () => fetchJSON("/api/admin/cron-logs"),
  });

  const triggerCron = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/cron/process-scheduled", { method: "POST" });
      if (res.ok) {
        toast.success("Cron job triggered successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-cron-logs"] });
      } else {
        toast.error("Failed to trigger cron job");
      }
    } catch {
      toast.error("Failed to trigger cron job");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cron Jobs</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage and monitor cron job execution for scheduled orders and automated tasks.
          </p>
          <div className="flex gap-3">
            <Button onClick={triggerCron} disabled={running} className="gap-2">
              {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running..." : "Run Now"}
            </Button>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-cron-logs"] })}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cron Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (logs as CronLog[]).length === 0 ? (
            <p className="text-muted-foreground">No cron logs yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Result</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs as CronLog[]).map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50 dark:hover:bg-white/5">
                      <td className="p-2">{log.id}</td>
                      <td className="p-2">
                        <Badge variant="outline">{log.action}</Badge>
                      </td>
                      <td className="p-2">{log.result}</td>
                      <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
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
