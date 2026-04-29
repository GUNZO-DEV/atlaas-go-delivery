import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Only eagerly load the landing page and auth
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-load everything else
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const RiderDashboard = lazy(() => import("./pages/RiderDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TrackDelivery = lazy(() => import("./pages/TrackDelivery"));
const TestSetup = lazy(() => import("./pages/TestSetup"));
const RestaurantMenu = lazy(() => import("./pages/RestaurantMenu"));
const Restaurants = lazy(() => import("./pages/Restaurants"));
const GroupOrder = lazy(() => import("./pages/GroupOrder"));
const MerchantAnalytics = lazy(() => import("./pages/MerchantAnalytics"));
const RiderEarnings = lazy(() => import("./pages/RiderEarnings"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PartnerRestaurant = lazy(() => import("./pages/PartnerRestaurant"));
const CustomerSettings = lazy(() => import("./pages/CustomerSettings"));
const RiderSettings = lazy(() => import("./pages/RiderSettings"));
const MerchantSettings = lazy(() => import("./pages/MerchantSettings"));
const Install = lazy(() => import("./pages/Install"));
const About = lazy(() => import("./pages/About"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Safety = lazy(() => import("./pages/Safety"));
const Careers = lazy(() => import("./pages/Careers"));
const RealtimeDemo = lazy(() => import("./pages/RealtimeDemo"));
const Favorites = lazy(() => import("./pages/Favorites"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));
const AuierDelivery = lazy(() => import("./pages/AuierDelivery"));
const AuierAdminDashboard = lazy(() => import("./pages/AuierAdminDashboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Orders = lazy(() => import("./pages/Orders"));
const LynRestaurantDashboard = lazy(() => import("./pages/LynRestaurantDashboard"));
const CustomerTableMenu = lazy(() => import("./pages/CustomerTableMenu"));
const OrderChatPage = lazy(() => import("./pages/OrderChatPage"));
const Services = lazy(() => import("./pages/Services"));
const CommunityDashboard = lazy(() => import("./pages/CommunityDashboard"));

// Lazy-load heavier components
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Eagerly load bottom nav - needed immediately on every page
import MobileBottomNav from "./components/MobileBottomNav";

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <div className="pb-16 sm:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/merchant-auth" element={<Auth defaultRole="merchant" />} />
              <Route path="/rider-auth" element={<Auth defaultRole="rider" />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin/setup" element={<AdminSetup />} />
              <Route path="/install" element={<Install />} />
              <Route path="/partner-restaurant" element={<PartnerRestaurant />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/auier-delivery" element={<AuierDelivery />} />
              <Route path="/auier-admin" element={<ProtectedRoute requiredRole="admin"><AuierAdminDashboard /></ProtectedRoute>} />
              <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/merchant" element={<ProtectedRoute requiredRole="merchant"><LynRestaurantDashboard /></ProtectedRoute>} />
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
              <Route path="/lyn-dashboard" element={<ProtectedRoute requiredRole="merchant"><LynRestaurantDashboard /></ProtectedRoute>} />
              <Route path="/order/:restaurantId/:tableNumber?" element={<CustomerTableMenu />} />
              <Route path="/order-chat/:orderId" element={<ProtectedRoute><OrderChatPage /></ProtectedRoute>} />
              <Route path="/services" element={<Services />} />
              <Route path="/dashboard" element={<CommunityDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <MobileBottomNav />
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
