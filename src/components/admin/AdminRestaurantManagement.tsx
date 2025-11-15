import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreateRestaurantDialog } from "./CreateRestaurantDialog";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Store, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string;
  phone: string;
  is_active: boolean;
  whatsapp_enabled: boolean;
  whatsapp_number: string;
}

const AdminRestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (restaurantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ is_active: !currentStatus })
        .eq("id", restaurantId);

      if (error) throw error;

      setRestaurants(prev => prev.map(r => 
        r.id === restaurantId ? { ...r, is_active: !currentStatus } : r
      ));

      toast.success(`Restaurant ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast.error("Failed to update restaurant");
    }
  };

  const toggleWhatsAppMode = async (restaurantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ whatsapp_enabled: !currentStatus })
        .eq("id", restaurantId);

      if (error) throw error;

      setRestaurants(prev => prev.map(r => 
        r.id === restaurantId ? { ...r, whatsapp_enabled: !currentStatus } : r
      ));

      toast.success(`WhatsApp ordering ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error updating WhatsApp mode:", error);
      toast.error("Failed to update WhatsApp mode");
    }
  };

  const updateWhatsAppNumber = async (restaurantId: string) => {
    if (!whatsappNumber.trim()) {
      toast.error("Please enter a WhatsApp number");
      return;
    }

    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ whatsapp_number: whatsappNumber })
        .eq("id", restaurantId);

      if (error) throw error;

      setRestaurants(prev => prev.map(r => 
        r.id === restaurantId ? { ...r, whatsapp_number: whatsappNumber } : r
      ));

      toast.success("WhatsApp number updated");
      setSelectedRestaurant(null);
      setWhatsappNumber("");
    } catch (error) {
      console.error("Error updating WhatsApp number:", error);
      toast.error("Failed to update WhatsApp number");
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading restaurants...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Restaurant Management</h2>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>WhatsApp Mode</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{restaurant.cuisine_type || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{restaurant.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={restaurant.is_active}
                        onCheckedChange={() => toggleRestaurantStatus(restaurant.id, restaurant.is_active)}
                      />
                      <span className="text-sm">
                        {restaurant.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={restaurant.whatsapp_enabled}
                        onCheckedChange={() => toggleWhatsAppMode(restaurant.id, restaurant.whatsapp_enabled)}
                      />
                      {restaurant.whatsapp_enabled && (
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setWhatsappNumber(restaurant.whatsapp_number || "");
                          }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          WhatsApp
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>WhatsApp Settings - {restaurant.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number</Label>
                            <Input
                              id="whatsapp"
                              placeholder="+212 6XX XXX XXX"
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Include country code (e.g., +212 for Morocco)
                            </p>
                          </div>
                          <Button onClick={() => updateWhatsAppNumber(restaurant.id)}>
                            Save WhatsApp Number
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRestaurants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No restaurants found
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRestaurantDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchRestaurants}
      />
    </div>
  );
};

export default AdminRestaurantManagement;