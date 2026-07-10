"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema, type TicketInput } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserTickets } from "@/lib/queries";
import { Send } from "lucide-react";

interface TicketMessage {
  id: number;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  messages: TicketMessage[];
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="p-2"><div className="h-4 bg-muted animate-pulse rounded w-full" /></td>
      ))}
    </tr>
  );
}

export default function TicketsPage() {
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading } = useUserTickets();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", message: "" },
  });

  const onSubmit = async (data: TicketInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Ticket created!");
        setOpen(false);
        reset();
        queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
      } else {
        toast.error("Failed to create ticket");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/user/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTicket.id, message: replyText.trim() }),
      });
      if (res.ok) {
        toast.success("Reply sent");
        setReplyText("");
        queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
        setSelectedTicket({
          ...selectedTicket,
          messages: [
            ...selectedTicket.messages,
            { id: Date.now(), senderRole: "user", message: replyText.trim(), createdAt: new Date().toISOString() },
          ],
        });
      } else {
        toast.error("Failed to send reply");
      }
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "replied": return "bg-blue-100 text-blue-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>New Ticket</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register("subject")} />
                {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" {...register("message")} />
                {errors.message && <p className="text-sm text-red-600">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Ticket"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">
                  <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</th>
                  <th className="text-center p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                </tr></thead>
                <tbody>
                  {[1,2,3,4].map((i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-muted-foreground">No tickets yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Subject</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(tickets as Ticket[]).map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="p-2">{ticket.id}</td>
                      <td className="p-2">{ticket.subject}</td>
                      <td className="p-2 text-center">
                        <Badge className={statusColor(ticket.status)}>{ticket.status}</Badge>
                      </td>
                      <td className="p-2">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
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
                        msg.senderRole === "user"
                          ? "bg-blue-50 border border-blue-200 ml-8"
                          : "bg-gray-50 border border-gray-200 mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium capitalize">{msg.senderRole}</span>
                        <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</span>
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

              <div className="flex justify-end">
                {selectedTicket.status !== "closed" && (
                  <Button onClick={handleSendReply} disabled={!replyText.trim() || sendingReply}>
                    <Send className="h-4 w-4 mr-1" />
                    {sendingReply ? "Sending..." : "Send Reply"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
