import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, MapPin, Phone, Car } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RiderProfile {
  id: string;
  rider_id: string;
  phone: string;
  city: string;
  vehicle_type: string;
  license_number: string;
  vehicle_plate_number: string;
  status: string;
  rejection_reason: string;
  created_at: string;
}

const AdminRiderApplications = () => {
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRider, setSelectedRider] = useState<string | null>(null);

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      const { data, error } = await supabase
        .from("rider_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRiders(data || []);
    } catch (error) {
      console.error("Error fetching riders:", error);
      toast.error("Failed to load rider applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (riderProfileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("approve_rider_application", {
        rider_profile_id: riderProfileId,
        admin_id: user.id,
      });

      if (error) throw error;

      toast.success("Rider application approved!");
      fetchRiders();
    } catch (error) {
      console.error("Error approving rider:", error);
      toast.error("Failed to approve rider application");
    }
  };

  const handleReject = async (riderProfileId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("reject_rider_application", {
        rider_profile_id: riderProfileId,
        admin_id: user.id,
        reason: rejectionReason,
      });

      if (error) throw error;

      toast.success("Rider application rejected");
      setRejectionReason("");
      setSelectedRider(null);
      fetchRiders();
    } catch (error) {
      console.error("Error rejecting rider:", error);
      toast.error("Failed to reject rider application");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading rider applications...</div>;
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
      <h2 className="text-3xl font-bold">Rider Applications</h2>
      
      <div className="grid gap-6">
        {riders.map((rider) => (
          <Card key={rider.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl">Rider ID: {rider.rider_id.slice(0, 8)}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(rider.created_at).toLocaleDateString()}
                  </div>
                </div>
                {getStatusBadge(rider.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{rider.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">City</p>
                      <p className="text-sm text-muted-foreground">{rider.city}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Car className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Vehicle Type</p>
                      <p className="text-sm text-muted-foreground">{rider.vehicle_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Car className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">License Number</p>
                      <p className="text-sm text-muted-foreground">{rider.license_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Car className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Plate Number</p>
                      <p className="text-sm text-muted-foreground">{rider.vehicle_plate_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {rider.rejection_reason && (
                <div className="bg-destructive/10 p-3 rounded-md">
                  <p className="text-sm font-medium text-destructive mb-1">Rejection Reason</p>
                  <p className="text-sm">{rider.rejection_reason}</p>
                </div>
              )}

              {rider.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApprove(rider.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Dialog open={selectedRider === rider.id} onOpenChange={(open) => !open && setSelectedRider(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setSelectedRider(rider.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Rider Application</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Provide a reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={4}
                        />
                        <Button
                          onClick={() => handleReject(rider.id)}
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

        {riders.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No rider applications found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminRiderApplications;
