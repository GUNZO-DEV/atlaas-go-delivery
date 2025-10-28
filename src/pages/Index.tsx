import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import LiveTracking from "@/components/LiveTracking";
import JoinSection from "@/components/JoinSection";
import TrustedSection from "@/components/TrustedSection";
import Footer from "@/components/Footer";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedRestaurants />
      <LiveTracking />
      <JoinSection />
      <TrustedSection />
      <Footer />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
