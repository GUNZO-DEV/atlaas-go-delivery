import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ComplianceItem {
  id: string;
  type: "restaurant" | "rider";
  name: string;
  business_license?: string;
  driver_license_url?: string;
  id_card_url?: string;
  vehicle_registration_url?: string;
  status: string;
}

const AdminCompliancePanel = () => {
  const [restaurants, setRestaurants] = useState<ComplianceItem[]>([]);
  const [riders, setRiders] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      const [restaurantApps, riderProfiles] = await Promise.all([
        supabase
          .from("restaurant_applications")
          .select("id, restaurant_name, business_license, status")
          .eq("status", "pending"),
        supabase
          .from("rider_profiles")
          .select(`
            id,
            driver_license_url,
            id_card_url,
            vehicle_registration_url,
            status,
            profiles!rider_profiles_rider_id_fkey(full_name)
          `)
          .eq("status", "pending")
      ]);

      if (restaurantApps.error) throw restaurantApps.error;
      if (riderProfiles.error) throw riderProfiles.error;

      const restaurantData = restaurantApps.data?.map((app: any) => ({
        id: app.id,
        type: "restaurant" as const,
        name: app.restaurant_name,
        business_license: app.business_license,
        status: app.status,
      })) || [];

      const riderData = riderProfiles.data?.map((profile: any) => ({
        id: profile.id,
        type: "rider" as const,
        name: profile.profiles?.full_name || "Unknown Rider",
        driver_license_url: profile.driver_license_url,
        id_card_url: profile.id_card_url,
        vehicle_registration_url: profile.vehicle_registration_url,
        status: profile.status,
      })) || [];

      setRestaurants(restaurantData);
      setRiders(riderData);
    } catch (error) {
      console.error("Error fetching compliance data:", error);
      toast.error("Failed to load compliance data");
    } finally {
      setLoading(false);
    }
  };

  const DocumentViewer = ({ url, label }: { url?: string; label: string }) => (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {url ? (
        <Button variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            View Document
          </a>
        </Button>
      ) : (
        <Badge variant="secondary">Not Uploaded</Badge>
      )}
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-8 w-8" />
        <h2 className="text-3xl font-bold">Compliance & Licensing</h2>
      </div>

      <Tabs defaultValue="restaurants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="restaurants">
            Restaurant Documents ({restaurants.length})
          </TabsTrigger>
          <TabsTrigger value="riders">
            Rider Documents ({riders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants" className="space-y-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{restaurant.name}</span>
                  <Badge variant="secondary">{restaurant.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DocumentViewer 
                  url={restaurant.business_license} 
                  label="Business License" 
                />
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {restaurants.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending restaurant documents
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="riders" className="space-y-4">
          {riders.map((rider) => (
            <Card key={rider.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{rider.name}</span>
                  <Badge variant="secondary">{rider.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <DocumentViewer 
                    url={rider.driver_license_url} 
                    label="Driver License" 
                  />
                  <DocumentViewer 
                    url={rider.id_card_url} 
                    label="ID Card" 
                  />
                  <DocumentViewer 
                    url={rider.vehicle_registration_url} 
                    label="Vehicle Registration" 
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {riders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending rider documents
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCompliancePanel;