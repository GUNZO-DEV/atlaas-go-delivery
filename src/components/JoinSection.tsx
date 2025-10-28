import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JoinSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Partner or Deliver with ATLAAS GO
          </h2>
          <p className="text-muted-foreground text-lg">
            Join Morocco's fastest-growing delivery platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Restaurant Card */}
          <Card 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30"
            onClick={() => navigate("/partner-restaurant")}
          >
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-primary mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Join as Restaurant</h3>
              <p className="text-muted-foreground mb-6">
                Fair 10% commission. Keep more of what you earn.
              </p>
              <Button size="lg" className="w-full group-hover:scale-105 transition-transform">
                Apply Now
              </Button>
            </CardContent>
          </Card>

          {/* Rider Card */}
          <Card 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30"
            onClick={() => navigate("/rider-auth")}
          >
            <CardContent className="p-8 text-center">
              <div className="bg-accent/10 rounded-full p-6 w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Bike className="w-8 h-8 text-accent mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Become a Rider</h3>
              <p className="text-muted-foreground mb-6">
                Flexible hours. Fair pay. Earn on your schedule.
              </p>
              <Button size="lg" variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                Rider Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
