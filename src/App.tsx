import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CustomerDashboard from "./pages/CustomerDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrackDelivery from "./pages/TrackDelivery";
import TestSetup from "./pages/TestSetup";
import RestaurantMenu from "./pages/RestaurantMenu";
import Restaurants from "./pages/Restaurants";
import GroupOrder from "./pages/GroupOrder";
import MerchantAnalytics from "./pages/MerchantAnalytics";
import RiderEarnings from "./pages/RiderEarnings";
import MerchantAuth from "./pages/MerchantAuth";
import RiderAuth from "./pages/RiderAuth";
import PartnerRestaurant from "./pages/PartnerRestaurant";
import CustomerSettings from "./pages/CustomerSettings";
import RiderSettings from "./pages/RiderSettings";
import MerchantSettings from "./pages/MerchantSettings";
import Install from "./pages/Install";
import About from "./pages/About";
import HelpCenter from "./pages/HelpCenter";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Safety from "./pages/Safety";
import Careers from "./pages/Careers";
import RealtimeDemo from "./pages/RealtimeDemo";
import Favorites from "./pages/Favorites";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSetup from "./pages/AdminSetup";
import AuierDelivery from "./pages/AuierDelivery";
import Notifications from "./pages/Notifications";
import Orders from "./pages/Orders";
import MobileBottomNav from "./components/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="pb-16 sm:pb-0">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/merchant-auth" element={<MerchantAuth />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/rider-auth" element={<RiderAuth />} />
            <Route path="/install" element={<Install />} />
            <Route path="/partner-restaurant" element={<PartnerRestaurant />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/auier-delivery" element={<AuierDelivery />} />
            <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/merchant" element={<ProtectedRoute requiredRole="merchant"><MerchantDashboard /></ProtectedRoute>} />
            <Route path="/rider" element={<ProtectedRoute requiredRole="rider"><RiderDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/track/:orderId" element={<ProtectedRoute><TrackDelivery /></ProtectedRoute>} />
            <Route path="/test-setup" element={<TestSetup />} />
            <Route path="/restaurant/:restaurantId?" element={<RestaurantMenu />} />
            <Route path="/group-order/:mode?" element={<GroupOrder />} />
            <Route path="/merchant/analytics" element={<ProtectedRoute requiredRole="merchant"><MerchantAnalytics /></ProtectedRoute>} />
            <Route path="/rider/earnings" element={<ProtectedRoute requiredRole="rider"><RiderEarnings /></ProtectedRoute>} />
            <Route path="/customer/settings" element={<ProtectedRoute requiredRole="customer"><CustomerSettings /></ProtectedRoute>} />
            <Route path="/rider/settings" element={<ProtectedRoute requiredRole="rider"><RiderSettings /></ProtectedRoute>} />
            <Route path="/merchant/settings" element={<ProtectedRoute requiredRole="merchant"><MerchantSettings /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/realtime-demo" element={<RealtimeDemo />} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <MobileBottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
