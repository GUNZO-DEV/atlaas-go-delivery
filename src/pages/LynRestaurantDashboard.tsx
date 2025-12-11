import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutGrid, ChefHat, ShoppingCart, DollarSign, Package, UserCog, BarChart3,
  LogOut, Calendar, Megaphone, AlertTriangle, ClipboardList, Crown, History, PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LynTableFloorPlan from "@/components/lyn/LynTableFloorPlan";
import LynKitchenDisplay from "@/components/lyn/LynKitchenDisplay";
import LynManagerDashboard from "@/components/lyn/LynManagerDashboard";
import LynOrdersManagement from "@/components/lyn/LynOrdersManagement";
import LynFinancesManagement from "@/components/lyn/LynFinancesManagement";
import LynInventoryManagement from "@/components/lyn/LynInventoryManagement";
import LynStaffManagement from "@/components/lyn/LynStaffManagement";
import LynDarkModeToggle from "@/components/lyn/LynDarkModeToggle";
import LynReservationsManagement from "@/components/lyn/LynReservationsManagement";
import LynAnnouncementsBoard from "@/components/lyn/LynAnnouncementsBoard";
import LynIncidentsLog from "@/components/lyn/LynIncidentsLog";
import LynChecklistsManager from "@/components/lyn/LynChecklistsManager";
import LynCustomerLoyalty from "@/components/lyn/LynCustomerLoyalty";
import LynOperationalAlerts from "@/components/lyn/LynOperationalAlerts";
import LynWeatherWidget from "@/components/lyn/LynWeatherWidget";
import LynMenuEngineering from "@/components/lyn/LynMenuEngineering";
import LynAuditLogs from "@/components/lyn/LynAuditLogs";
import LynOfflineIndicator from "@/components/lyn/LynOfflineIndicator";

const LynRestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tables");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchWithCache, isOnline, cacheData, getCachedData } = useOfflineSync();

  useEffect(() => {
    checkAuthAndLoadRestaurant();
  }, []);

  const checkAuthAndLoadRestaurant = async () => {
    try {
      // Try to get cached user and restaurant first for offline support
      const cachedRestaurant = getCachedData<any>('lyn_restaurant');
      
      if (!isOnline && cachedRestaurant) {
        setRestaurant(cachedRestaurant);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        if (!isOnline && cachedRestaurant) {
          setRestaurant(cachedRestaurant);
          setLoading(false);
          return;
        }
        navigate("/merchant-auth"); 
        return; 
      }

      const { data: restaurantData, error } = await supabase
        .from("restaurants").select("*").eq("merchant_id", user.id).maybeSingle();
      if (error) throw error;
      if (!restaurantData) {
        if (!isOnline && cachedRestaurant) {
          setRestaurant(cachedRestaurant);
          setLoading(false);
          return;
        }
        toast({ title: "No Restaurant Found", variant: "destructive" });
        navigate("/merchant"); return;
      }
      
      // Cache the restaurant data for offline use
cacheData('lyn_restaurant', restaurantData);
      cacheData('lyn_user_id', user.id);
      setRestaurant(restaurantData);
      
      // Pre-cache menu items for offline order creation
      preCacheMenuItems(restaurantData.id);
    } catch (error: any) {
      // If offline and we have cached data, use it
      const cachedRestaurant = getCachedData<any>('lyn_restaurant');
      if (!isOnline && cachedRestaurant) {
        setRestaurant(cachedRestaurant);
        toast({ 
          title: "Offline Mode", 
          description: "Using cached data. Some features may be limited.",
        });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Pre-cache menu items for offline use
  const preCacheMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await supabase
        .from("menu_items")
        .select("id, name, price, category")
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true)
        .order("category")
        .order("name");
      
      if (data) {
        cacheData(`menu_items_${restaurantId}`, data);
      }
    } catch (error) {
      console.error("Failed to pre-cache menu items:", error);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

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
    { id: "reservations", label: "Reservations", icon: Calendar },
    { id: "customers", label: "Loyalty", icon: Crown },
    { id: "menu", label: "Menu Eng.", icon: PieChart },
    { id: "finances", label: "Finances", icon: DollarSign },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "staff", label: "Staff", icon: UserCog },
    { id: "checklists", label: "Checklists", icon: ClipboardList },
    { id: "announcements", label: "Comms", icon: Megaphone },
    { id: "incidents", label: "Incidents", icon: AlertTriangle },
    { id: "audit", label: "Audit Logs", icon: History },
    { id: "overview", label: "Overview", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">{restaurant.name}</h1>
              <p className="text-xs text-muted-foreground">Enterprise Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LynOfflineIndicator />
            <LynDarkModeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Alerts & Weather Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <LynOperationalAlerts restaurant={restaurant} />
          <LynWeatherWidget restaurant={restaurant} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 h-auto flex-nowrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-background whitespace-nowrap">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tables"><LynTableFloorPlan restaurant={restaurant} /></TabsContent>
          <TabsContent value="kitchen"><LynKitchenDisplay restaurant={restaurant} /></TabsContent>
          <TabsContent value="orders"><LynOrdersManagement restaurant={restaurant} /></TabsContent>
          <TabsContent value="reservations"><LynReservationsManagement restaurant={restaurant} /></TabsContent>
          <TabsContent value="customers"><LynCustomerLoyalty restaurant={restaurant} /></TabsContent>
          <TabsContent value="menu"><LynMenuEngineering restaurant={restaurant} /></TabsContent>
          <TabsContent value="finances"><LynFinancesManagement restaurant={restaurant} /></TabsContent>
          <TabsContent value="inventory"><LynInventoryManagement restaurant={restaurant} /></TabsContent>
          <TabsContent value="staff"><LynStaffManagement restaurant={restaurant} /></TabsContent>
          <TabsContent value="checklists"><LynChecklistsManager restaurant={restaurant} /></TabsContent>
          <TabsContent value="announcements"><LynAnnouncementsBoard restaurant={restaurant} /></TabsContent>
          <TabsContent value="incidents"><LynIncidentsLog restaurant={restaurant} /></TabsContent>
          <TabsContent value="audit"><LynAuditLogs restaurant={restaurant} /></TabsContent>
          <TabsContent value="overview"><LynManagerDashboard restaurant={restaurant} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LynRestaurantDashboard;
