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
import TrackDelivery from "./pages/TrackDelivery";
import TestSetup from "./pages/TestSetup";
import RestaurantMenu from "./pages/RestaurantMenu";
import Restaurants from "./pages/Restaurants";
import GroupOrder from "./pages/GroupOrder";
import MerchantAnalytics from "./pages/MerchantAnalytics";
import RiderEarnings from "./pages/RiderEarnings";
import MerchantAuth from "./pages/MerchantAuth";
import RiderAuth from "./pages/RiderAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/merchant-auth" element={<MerchantAuth />} />
          <Route path="/rider-auth" element={<RiderAuth />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/merchant" element={<MerchantDashboard />} />
          <Route path="/rider" element={<RiderDashboard />} />
          <Route path="/track/:orderId" element={<TrackDelivery />} />
          <Route path="/test-setup" element={<TestSetup />} />
          <Route path="/restaurant/:restaurantId?" element={<RestaurantMenu />} />
          <Route path="/group-order/:mode?" element={<GroupOrder />} />
          <Route path="/merchant/analytics" element={<MerchantAnalytics />} />
          <Route path="/rider/earnings" element={<RiderEarnings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
