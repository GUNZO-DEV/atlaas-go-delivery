import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, MapPin, Phone, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Application {
  id: string;
  restaurant_name: string;
  description: string;
  cuisine_type: string;
  address: string;
  phone: string;
  business_license: string;
  status: string;
  created_at: string;
  merchant_id: string;
  rejection_reason: string;
}

const AdminRestaurantApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("approve_restaurant_application", {
        application_id: applicationId,
        admin_id: user.id,
      });

      if (error) throw error;

      toast.success("Restaurant application approved!");
      fetchApplications();
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Failed to approve application");
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("reject_restaurant_application", {
        application_id: applicationId,
        admin_id: user.id,
        reason: rejectionReason,
      });

      if (error) throw error;

      toast.success("Restaurant application rejected");
      setRejectionReason("");
      setSelectedApp(null);
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Restaurant Applications</h2>
      
      <div className="grid gap-6">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{app.restaurant_name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Cuisine Type</p>
                      <p className="text-sm text-muted-foreground">{app.cuisine_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{app.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{app.phone}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{app.description}</p>
                </div>
              </div>

              {app.rejection_reason && (
                <div className="bg-destructive/10 p-3 rounded-md">
                  <p className="text-sm font-medium text-destructive mb-1">Rejection Reason</p>
                  <p className="text-sm">{app.rejection_reason}</p>
                </div>
              )}

              {app.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApprove(app.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Dialog open={selectedApp === app.id} onOpenChange={(open) => !open && setSelectedApp(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setSelectedApp(app.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Provide a reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={4}
                        />
                        <Button
                          onClick={() => handleReject(app.id)}
                          variant="destructive"
                          className="w-full"
                        >
                          Confirm Rejection
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No restaurant applications found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantApplications;
