"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableActions, TableAction } from "@/components/table-actions";
import { useAdminTickets } from "@/lib/queries";
import { MessageSquare, XCircle, Send, Bot, BotOff } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface TicketMessage {
  id: number;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: number;
  userId: number;
  user: { username: string; email: string };
  subject: string;
  status: string;
  aiMuted: boolean;
  createdAt: string;
  messages: TicketMessage[];
}

export default function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading, refetch } = useAdminTickets();
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const pageSize = 25;
  const paginatedTickets = (tickets as Ticket[]).slice((page - 1) * pageSize, page * pageSize);

  const statusColor = (s: string) => {
    switch (s) {
      case "open": return "bg-green-100 text-green-800";
      case "replied": return "bg-blue-100 text-blue-800";
      case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    if (selectedTicket.status === "closed") return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTicket.id, message: replyText.trim(), status: "replied" }),
      });
      if (res.ok) {
        toast.success("Reply sent");
        setReplyText("");
        refetch();
        const updated = (tickets as Ticket[]).find((t) => t.id === selectedTicket.id);
        if (updated) {
          setSelectedTicket({
            ...updated,
            messages: [
              ...updated.messages,
              { id: Date.now(), senderRole: "admin", message: replyText.trim(), createdAt: new Date().toISOString() },
            ],
            status: "replied",
          });
        }
      } else {
        toast.error("Failed to send reply");
      }
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTicket.id, status: "closed" }),
      });
      if (res.ok) {
        toast.success("Ticket closed");
        setSelectedTicket({ ...selectedTicket, status: "closed" });
        refetch();
      } else {
        toast.error("Failed to close ticket");
      }
    } catch {
      toast.error("Failed to close ticket");
    }
  };

  const handleToggleAiMute = async () => {
    if (!selectedTicket) return;
    const newAiMuted = !selectedTicket.aiMuted;
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTicket.id, aiMuted: newAiMuted }),
      });
      if (res.ok) {
        toast.success(newAiMuted ? "AI muted" : "AI unmuted");
        setSelectedTicket({ ...selectedTicket, aiMuted: newAiMuted });
        refetch();
      } else {
        toast.error("Failed to update AI setting");
      }
    } catch {
      toast.error("Failed to update AI setting");
    }
  };

  const getTicketActions = (ticket: Ticket): TableAction[] => [
    {
      label: "View & Reply",
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: () => setSelectedTicket(ticket),
    },
    ...(ticket.status !== "closed"
      ? [
          {
            label: "Close Ticket",
            icon: <XCircle className="h-4 w-4" />,
            onClick: async () => {
              try {
                const res = await fetch("/api/admin/tickets", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: ticket.id, status: "closed" }),
                });
                if (res.ok) {
                  toast.success("Ticket closed");
                  refetch();
                } else toast.error("Failed to close ticket");
              } catch {
                toast.error("Failed to close ticket");
              }
            },
            variant: "destructive" as const,
            separator: true,
          },
        ]
      : []),
    ...(ticket.status === "closed"
      ? [
          {
            label: "Reopen Ticket",
            icon: <MessageSquare className="h-4 w-4" />,
            onClick: async () => {
              try {
                const res = await fetch("/api/admin/tickets", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: ticket.id, status: "open" }),
                });
                if (res.ok) {
                  toast.success("Ticket reopened");
                  refetch();
                } else toast.error("Failed to reopen ticket");
              } catch {
                toast.error("Failed to reopen ticket");
              }
            },
            separator: true,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tickets</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <p>No tickets.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 sticky top-0">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Subject</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-white/5"
                        onClick={() => setSelectedTicket(t)}
                      >
                        <td className="p-2">{t.id}</td>
                        <td className="p-2">{t.user.username}</td>
                        <td className="p-2">{t.subject}</td>
                        <td className="p-2 text-center">
                          <Badge className={statusColor(t.status)}>{t.status}</Badge>
                        </td>
                        <td className="p-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <TableActions actions={getTicketActions(t)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                totalItems={tickets.length}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => { if (!open) setSelectedTicket(null); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id} - {selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>User: {selectedTicket.user.username} ({selectedTicket.user.email})</span>
                <Badge className={statusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3 rounded-lg border p-3">
                {selectedTicket.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">No messages yet.</p>
                ) : (
                  selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 ${
                        msg.senderRole === "admin"
                          ? "bg-blue-50 border border-blue-200 ml-8"
                          : "bg-muted border-border mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium capitalize">{msg.senderRole}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleAiMute}
                >
                  {selectedTicket.aiMuted ? (
                    <><BotOff className="h-4 w-4 mr-1" /> AI Muted</>
                  ) : (
                    <><Bot className="h-4 w-4 mr-1" /> AI Active</>
                  )}
                </Button>
                <div className="flex gap-2">
                  {selectedTicket.status !== "closed" && (
                    <Button variant="destructive" size="sm" onClick={handleCloseTicket}>
                      Close Ticket
                    </Button>
                  )}
                  {selectedTicket.status !== "closed" && (
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sending}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {sending ? "Sending..." : "Send Reply"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
