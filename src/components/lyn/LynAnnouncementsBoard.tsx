import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Megaphone, MessageSquare, AlertTriangle, Pin, Plus, Send, 
  ChefHat, User, Clock, Trash2 
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface LynAnnouncementsBoardProps {
  restaurant: any;
}

const LynAnnouncementsBoard = ({ restaurant }: LynAnnouncementsBoardProps) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    type: "announcement",
    priority: "normal",
    target_role: "",
    is_pinned: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  useEffect(() => {
    const channel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lyn_announcements' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("lyn_announcements")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      setAnnouncements(data || []);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("lyn_announcements").insert({
        restaurant_id: restaurant.id,
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        type: newAnnouncement.type,
        priority: newAnnouncement.priority,
        target_role: newAnnouncement.target_role || null,
        is_pinned: newAnnouncement.is_pinned,
        author_name: "Manager"
      });

      if (error) throw error;
      toast({ title: "Announcement Posted" });
      setDialogOpen(false);
      setNewAnnouncement({ title: "", message: "", type: "announcement", priority: "normal", target_role: "", is_pinned: false });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const { error } = await supabase.from("lyn_announcements").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "announcement": return <Megaphone className="h-4 w-4" />;
      case "message": return <MessageSquare className="h-4 w-4" />;
      case "alert": return <AlertTriangle className="h-4 w-4" />;
      case "shift_note": return <Clock className="h-4 w-4" />;
      case "issue": return <AlertTriangle className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/20 text-red-700 border-red-300";
      case "high": return "bg-orange-500/20 text-orange-700 border-orange-300";
      default: return "bg-blue-500/20 text-blue-700 border-blue-300";
    }
  };

  const pinnedAnnouncements = announcements.filter(a => a.is_pinned);
  const regularAnnouncements = announcements.filter(a => !a.is_pinned);
  const messages = announcements.filter(a => a.type === "message");
  const issues = announcements.filter(a => a.type === "issue");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Staff Communications</h2>
          <p className="text-muted-foreground">Announcements, messages, and shift notes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Announcement / Message</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <Label>Message *</Label>
                <Textarea
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  placeholder="Your message..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={newAnnouncement.type} onValueChange={(v) => setNewAnnouncement({...newAnnouncement, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="shift_note">Shift Note</SelectItem>
                      <SelectItem value="issue">Issue Report</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={newAnnouncement.priority} onValueChange={(v) => setNewAnnouncement({...newAnnouncement, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Target Role (Optional)</Label>
                <Select value={newAnnouncement.target_role} onValueChange={(v) => setNewAnnouncement({...newAnnouncement, target_role: v})}>
                  <SelectTrigger><SelectValue placeholder="All staff" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Staff</SelectItem>
                    <SelectItem value="chef">Chefs</SelectItem>
                    <SelectItem value="waiter">Waiters</SelectItem>
                    <SelectItem value="cashier">Cashiers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={newAnnouncement.is_pinned}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, is_pinned: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="pin" className="cursor-pointer">Pin this announcement</Label>
              </div>
              <Button onClick={createAnnouncement} className="w-full">
                <Send className="h-4 w-4 mr-2" />Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-xl font-bold">{announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Pin className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pinned</p>
                <p className="text-xl font-bold">{pinnedAnnouncements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-xl font-bold">{issues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Pin className="h-4 w-4" />Pinned</h3>
          {pinnedAnnouncements.map(announcement => (
            <Card key={announcement.id} className="border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center mt-1">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{announcement.title}</p>
                        <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {announcement.author_name} • {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(announcement.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Posts */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({regularAnnouncements.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {regularAnnouncements.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No announcements yet</CardContent></Card>
          ) : (
            regularAnnouncements.map(announcement => (
              <Card key={announcement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                        {getTypeIcon(announcement.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{announcement.title}</p>
                          {announcement.priority !== "normal" && (
                            <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                          )}
                          {announcement.target_role && (
                            <Badge variant="outline">{announcement.target_role}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {announcement.author_name} • {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(announcement.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-3">
          {messages.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No messages</CardContent></Card>
          ) : (
            messages.map(announcement => (
              <Card key={announcement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center mt-1">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-3">
          {issues.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No issues reported</CardContent></Card>
          ) : (
            issues.map(announcement => (
              <Card key={announcement.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-red-500/10 rounded-full flex items-center justify-center mt-1">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-700">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LynAnnouncementsBoard;
