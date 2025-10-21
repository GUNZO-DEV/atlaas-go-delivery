import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import LiveTracking from "@/components/LiveTracking";
import MerchantSection from "@/components/MerchantSection";
import DriverSection from "@/components/DriverSection";
import CustomerSection from "@/components/CustomerSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CityPresenceMap from "@/components/CityPresenceMap";
import AppPreview from "@/components/AppPreview";
import Footer from "@/components/Footer";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike } from "lucide-react";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <LanguageToggle />
      <Hero />
      
      {/* Quick Order Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Order Now from Atlas Tajine House</h2>
            <p className="text-muted-foreground">Authentic Moroccan cuisine delivered to your door</p>
          </div>
          <div className="flex justify-center">
            <div className="flex gap-6 justify-center flex-wrap">
              <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/restaurants")}>
                <CardContent className="p-6">
                  <img 
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" 
                    alt="Browse Restaurants" 
                    className="w-full h-48 object-cover rounded-lg mb-4 transition-transform"
                  />
                  <h3 className="text-2xl font-bold mb-2">Browse All Restaurants</h3>
                  <p className="text-muted-foreground mb-4">Search, filter, and discover Moroccan restaurants</p>
                  <Button className="w-full" size="lg">
                    Browse Restaurants
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/restaurant")}>
                <CardContent className="p-6">
                  <img 
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" 
                    alt="Atlas Tajine House" 
                    className="w-full h-48 object-cover rounded-lg mb-4 transition-transform"
                  />
                  <h3 className="text-2xl font-bold mb-2">Atlas Tajine House</h3>
                  <p className="text-muted-foreground mb-4">Traditional tajines, couscous, and authentic Moroccan dishes</p>
                  <Button className="w-full" size="lg">
                    View Menu & Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <LiveTracking />
      
      {/* Login Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Partner With Us</h2>
            <p className="text-muted-foreground">Join ATLAAS GO as a restaurant or rider</p>
          </div>
          <div className="flex gap-6 justify-center flex-wrap">
            <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/partner-restaurant")}>
              <CardContent className="p-8 text-center">
                <Store className="w-16 h-16 text-primary mx-auto mb-4 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">Join as Restaurant</h3>
                <p className="text-muted-foreground mb-6">Partner with us and reach thousands of customers</p>
                <Button className="w-full" size="lg">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/rider-auth")}>
              <CardContent className="p-8 text-center">
                <Bike className="w-16 h-16 text-primary mx-auto mb-4 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">Rider Login</h3>
                <p className="text-muted-foreground mb-6">Start delivering and earn money</p>
                <Button className="w-full" size="lg">
                  Rider Portal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <MerchantSection />
      <DriverSection />
      <CustomerSection />
      <TestimonialsSection />
      <CityPresenceMap />
      <AppPreview />
      <Footer />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
