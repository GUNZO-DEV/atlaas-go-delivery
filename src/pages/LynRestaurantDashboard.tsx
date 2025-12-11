import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutGrid, 
  ChefHat,
  ShoppingCart, 
  Users, 
  DollarSign, 
  Package, 
  UserCog, 
  BarChart3,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LynTableFloorPlan from "@/components/lyn/LynTableFloorPlan";
import LynKitchenDisplay from "@/components/lyn/LynKitchenDisplay";
import LynManagerDashboard from "@/components/lyn/LynManagerDashboard";
import LynOrdersManagement from "@/components/lyn/LynOrdersManagement";
import LynCustomersManagement from "@/components/lyn/LynCustomersManagement";
import LynFinancesManagement from "@/components/lyn/LynFinancesManagement";
import LynInventoryManagement from "@/components/lyn/LynInventoryManagement";
import LynStaffManagement from "@/components/lyn/LynStaffManagement";
import LynAnalytics from "@/components/lyn/LynAnalytics";

const LynRestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tables");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoadRestaurant();
  }, []);

  const checkAuthAndLoadRestaurant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/merchant-auth");
        return;
      }

      const { data: restaurantData, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("merchant_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!restaurantData) {
        toast({
          title: "No Restaurant Found",
          description: "You don't have a restaurant associated with this account.",
          variant: "destructive"
        });
        navigate("/merchant");
        return;
      }

      setRestaurant(restaurantData);
    } catch (error: any) {
      console.error("Error loading restaurant:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) return null;

  const tabs = [
    { id: "tables", label: "Tables", icon: LayoutGrid },
    { id: "kitchen", label: "Kitchen", icon: ChefHat },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "finances", label: "Finances", icon: DollarSign },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "staff", label: "Staff", icon: UserCog },
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">{restaurant.name}</h1>
              <p className="text-xs text-muted-foreground">Restaurant Management</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation - Scrollable on mobile */}
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 h-auto flex-wrap md:flex-nowrap">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="tables" className="space-y-6">
            <LynTableFloorPlan restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="kitchen" className="space-y-6">
            <LynKitchenDisplay restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <LynOrdersManagement restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            <LynFinancesManagement restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <LynInventoryManagement restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <LynStaffManagement restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <LynManagerDashboard restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <LynAnalytics restaurant={restaurant} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LynRestaurantDashboard;
