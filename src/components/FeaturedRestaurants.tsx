import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const restaurants = [
  {
    name: "Bonsai Sushi Bar",
    tagline: "Fresh sushi & Japanese cuisine",
    image: "/images/bonsai-sushi-bar.jpg",
    route: "/restaurant"
  },
  {
    name: "Moroccan Delights",
    tagline: "Traditional tajine & couscous",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
    route: "/restaurants"
  },
  {
    name: "La Petite Boulangerie",
    tagline: "French pastries & café",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    route: "/restaurants"
  }
];

const FeaturedRestaurants = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Order from Top Local Restaurants
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover authentic flavors from the best spots in Morocco
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
          {restaurants.map((restaurant, index) => (
            <Card 
              key={index}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-primary/30"
              onClick={() => navigate(restaurant.route)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {restaurant.tagline}
                  </p>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Order Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            variant="outline"
            className="px-8 border-2 hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate("/restaurants")}
          >
            Browse All Restaurants
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurants;
