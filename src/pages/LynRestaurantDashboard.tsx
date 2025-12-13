import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { 
  LayoutGrid, ChefHat, ShoppingCart, DollarSign, Package, UserCog, BarChart3,
  LogOut, Calendar, Megaphone, AlertTriangle, ClipboardList, Crown, History, PieChart,
  ArrowLeft, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import LynMenuEngineering from "@/components/lyn/LynMenuEngineering";
import LynAuditLogs from "@/components/lyn/LynAuditLogs";
import LynOfflineIndicator from "@/components/lyn/LynOfflineIndicator";

const LynRestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOnline, cacheData, getCachedData } = useOfflineSync();

  useEffect(() => {
    checkAuthAndLoadRestaurant();
  }, []);

  const checkAuthAndLoadRestaurant = async () => {
    try {
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
      
      cacheData('lyn_restaurant', restaurantData);
      cacheData('lyn_user_id', user.id);
      setRestaurant(restaurantData);
      preCacheMenuItems(restaurantData.id);
    } catch (error: any) {
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

  const features = [
    { id: "tables", label: "Tables", icon: LayoutGrid, color: "bg-blue-500", desc: "Floor plan & orders" },
    { id: "kitchen", label: "Kitchen", icon: ChefHat, color: "bg-orange-500", desc: "Live kitchen display" },
    { id: "orders", label: "Orders", icon: ShoppingCart, color: "bg-green-500", desc: "All orders history" },
    { id: "reservations", label: "Reservations", icon: Calendar, color: "bg-purple-500", desc: "Book & manage" },
    { id: "customers", label: "Loyalty", icon: Crown, color: "bg-yellow-500", desc: "Customer rewards" },
    { id: "finances", label: "Finances", icon: DollarSign, color: "bg-emerald-500", desc: "Revenue & expenses" },
    { id: "inventory", label: "Inventory", icon: Package, color: "bg-cyan-500", desc: "Stock management" },
    { id: "staff", label: "Staff", icon: UserCog, color: "bg-pink-500", desc: "Team & shifts" },
    { id: "checklists", label: "Checklists", icon: ClipboardList, color: "bg-indigo-500", desc: "Daily tasks" },
    { id: "menu", label: "Menu Eng.", icon: PieChart, color: "bg-rose-500", desc: "Profitability" },
    { id: "announcements", label: "Comms", icon: Megaphone, color: "bg-amber-500", desc: "Team messages" },
    { id: "incidents", label: "Incidents", icon: AlertTriangle, color: "bg-red-500", desc: "Issue tracking" },
    { id: "audit", label: "Audit Logs", icon: History, color: "bg-slate-500", desc: "Activity history" },
    { id: "overview", label: "Overview", icon: BarChart3, color: "bg-teal-500", desc: "Dashboard stats" },
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case "tables": return <LynTableFloorPlan restaurant={restaurant} />;
      case "kitchen": return <LynKitchenDisplay restaurant={restaurant} />;
      case "orders": return <LynOrdersManagement restaurant={restaurant} />;
      case "reservations": return <LynReservationsManagement restaurant={restaurant} />;
      case "customers": return <LynCustomerLoyalty restaurant={restaurant} />;
      case "menu": return <LynMenuEngineering restaurant={restaurant} />;
      case "finances": return <LynFinancesManagement restaurant={restaurant} />;
      case "inventory": return <LynInventoryManagement restaurant={restaurant} />;
      case "staff": return <LynStaffManagement restaurant={restaurant} />;
      case "checklists": return <LynChecklistsManager restaurant={restaurant} />;
      case "announcements": return <LynAnnouncementsBoard restaurant={restaurant} />;
      case "incidents": return <LynIncidentsLog restaurant={restaurant} />;
      case "audit": return <LynAuditLogs restaurant={restaurant} />;
      case "overview": return <LynManagerDashboard restaurant={restaurant} />;
      default: return null;
    }
  };

  const activeFeatureData = features.find(f => f.id === activeFeature);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {activeFeature ? (
              <Button variant="ghost" size="icon" onClick={() => setActiveFeature(null)} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
            )}
            <span className="font-semibold text-sm truncate max-w-[180px]">
              {activeFeature ? activeFeatureData?.label : restaurant.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LynOfflineIndicator />
            {activeFeature && (
              <Button variant="ghost" size="icon" onClick={() => setActiveFeature(null)} className="h-8 w-8">
                <Home className="h-4 w-4" />
              </Button>
            )}
            <LynDarkModeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {activeFeature ? (
          renderFeatureContent()
        ) : (
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">What would you like to do?</h1>
            <div className="flex flex-col gap-2">
              {features.map((feature) => (
                <Card 
                  key={feature.id}
                  className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center shrink-0`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LynRestaurantDashboard;
