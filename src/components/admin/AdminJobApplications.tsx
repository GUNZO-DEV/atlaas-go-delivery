import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  resume_url: string;
  cover_letter: string;
  job_postings: {
    title: string;
  };
}

const AdminJobApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job_postings(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      toast.error("Failed to load job applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("update_application_status", {
        p_application_id: applicationId,
        p_status: newStatus,
        p_notes: notes[applicationId] || null,
      });

      if (error) throw error;

      toast.success("Application status updated");
      setNotes((prev) => {
        const updated = { ...prev };
        delete updated[applicationId];
        return updated;
      });
      fetchApplications();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application status");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading job applications...</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      interview: "default",
      accepted: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Job Applications</h2>
      
      <div className="grid gap-6">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{app.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Applied for: {app.job_postings?.title}
                  </p>
                </div>
                {getStatusBadge(app.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{app.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{app.phone}</p>
                </div>
              </div>

              {app.cover_letter && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Cover Letter</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {app.cover_letter}
                  </p>
                </div>
              )}

              {app.resume_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Resume
                  </a>
                </Button>
              )}

              {app.status === "pending" && (
                <div className="space-y-3 pt-2">
                  <Textarea
                    placeholder="Add notes (optional)..."
                    value={notes[app.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => handleStatusUpdate(app.id, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interview">Schedule Interview</SelectItem>
                        <SelectItem value="accepted">Accept</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No job applications found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminJobApplications;
