import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BentoCategories from "@/components/dashboard/BentoCategories";
import QuickOrders from "@/components/dashboard/QuickOrders";
import FeaturedCards from "@/components/dashboard/FeaturedCards";
import PromoBanner from "@/components/dashboard/PromoBanner";
import SloganBanner from "@/components/dashboard/SloganBanner";
import Footer from "@/components/Footer";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <PromoBanner />
      <BentoCategories />
      <QuickOrders />
      <SloganBanner />
      <FeaturedCards />
      <Footer />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
