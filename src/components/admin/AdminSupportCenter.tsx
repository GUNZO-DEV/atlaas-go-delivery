import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, User, Clock } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  user_name: string;
  order_id?: string;
}

const AdminSupportCenter = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          profiles!support_tickets_user_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedTickets = data?.map((ticket: any) => ({
        id: ticket.id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at,
        user_name: ticket.profiles?.full_name || "Unknown User",
        order_id: ticket.order_id,
      })) || [];

      setTickets(formattedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (error) throw error;

      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));

      toast.success(`Ticket ${newStatus}`);
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket");
    }
  };

  const sendResponse = async () => {
    if (!selectedTicket || !response.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("support_responses")
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: response,
          is_staff: true,
        });

      if (error) throw error;

      toast.success("Response sent successfully");
      setResponse("");
      await updateTicketStatus(selectedTicket.id, "in_progress");
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in_progress": return "default";
      case "closed": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading support tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-8 w-8" />
        <h2 className="text-3xl font-bold">Support Center</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-semibold">All Tickets ({tickets.length})</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTicket?.id === ticket.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm line-clamp-1">{ticket.subject}</h4>
                    <Badge variant={getStatusColor(ticket.status)} className="text-xs">
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{ticket.user_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                      {ticket.priority}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tickets.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No support tickets
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <Badge variant={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {selectedTicket.user_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </div>
                    <Badge variant={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority} priority
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Customer Message:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>

                {selectedTicket.order_id && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Related Order:</h4>
                    <Badge variant="outline">{selectedTicket.order_id}</Badge>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-semibold">Admin Response:</h4>
                  <Textarea
                    placeholder="Type your response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button onClick={sendResponse} disabled={!response.trim()}>
                      Send Response
                    </Button>
                    {selectedTicket.status !== "closed" && (
                      <Button
                        variant="outline"
                        onClick={() => updateTicketStatus(selectedTicket.id, "closed")}
                      >
                        Close Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-20 text-center text-muted-foreground">
                Select a ticket to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportCenter;