import { useEffect, useState } from "react";
import { CreateMenuItemDialog } from "./CreateMenuItemDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UtensilsCrossed, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  restaurant_name: string;
  restaurant_id: string;
}

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuResponse, restaurantResponse] = await Promise.all([
        supabase
          .from("menu_items")
          .select(`
            *,
            restaurants(name, id)
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("restaurants")
          .select("id, name")
          .eq("is_active", true)
      ]);

      if (menuResponse.error) throw menuResponse.error;
      if (restaurantResponse.error) throw restaurantResponse.error;

      const formattedMenuItems = menuResponse.data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category || "Other",
        is_available: item.is_available,
        restaurant_name: item.restaurants?.name || "Unknown",
        restaurant_id: item.restaurants?.id || "",
      })) || [];

      setMenuItems(formattedMenuItems);
      setRestaurants(restaurantResponse.data || []);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: !currentStatus })
        .eq("id", itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      ));

      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRestaurant = selectedRestaurant === "all" || item.restaurant_id === selectedRestaurant;
    return matchesSearch && matchesRestaurant;
  });

  if (loading) {
    return <div className="text-center py-8">Loading menu items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8" />
          Menu Management
        </h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by item or restaurant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filter by restaurant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.restaurant_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="font-bold">{item.price} MAD</TableCell>
                  <TableCell>
                    <Badge variant={item.is_available ? "default" : "secondary"}>
                      {item.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(item.id, item.is_available)}
                    >
                      {item.is_available ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No menu items found
            </div>
          )}
        </CardContent>
      </Card>

      <CreateMenuItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminMenuManagement;