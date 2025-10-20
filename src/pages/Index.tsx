import Hero from "@/components/Hero";
import LiveTracking from "@/components/LiveTracking";
import MerchantSection from "@/components/MerchantSection";
import DriverSection from "@/components/DriverSection";
import CustomerSection from "@/components/CustomerSection";
import AppPreview from "@/components/AppPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <LiveTracking />
      <MerchantSection />
      <DriverSection />
      <CustomerSection />
      <AppPreview />
      <Footer />
    </div>
  );
};

export default Index;
