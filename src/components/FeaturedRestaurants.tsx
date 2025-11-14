import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  image_url: string;
  average_rating: number;
  review_count: number;
  address: string;
}

const FeaturedRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedRestaurants();
  }, []);

  const fetchFeaturedRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("average_rating", { ascending: false })
        .limit(4);

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error("Error fetching featured restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const specialOffers = [
    { text: "20% OFF", color: "bg-red-500" },
    { text: "Free Delivery", color: "bg-green-500" },
    { text: "15% OFF", color: "bg-orange-500" },
    { text: "Buy 1 Get 1", color: "bg-purple-500" },
  ];

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-3 md:mb-4 text-xs md:text-sm px-3 md:px-4 py-1 md:py-2">
            <Percent className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
            Featured Offers
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-4">
            Popular Restaurants
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
            Discover the best restaurants with exclusive offers and deals
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {restaurants.map((restaurant, index) => {
            const offer = specialOffers[index % specialOffers.length];
            return (
              <Card
                key={restaurant.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2 hover:border-primary/50"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={restaurant.image_url || "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400"}
                    alt={restaurant.name}
                    className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Special Offer Badge */}
                  <div className={`absolute top-2 right-2 md:top-3 md:right-3 ${offer.color} text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg animate-pulse`}>
                    {offer.text}
                  </div>
                  {/* Rating Badge */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-background/95 backdrop-blur-sm px-2 md:px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs md:text-sm font-semibold">{restaurant.average_rating.toFixed(1)}</span>
                  </div>
                </div>

                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base md:text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                  </div>

                  <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 mb-2 md:mb-3 min-h-[32px] md:min-h-[40px]">
                    {restaurant.description}
                  </p>

                  {restaurant.id === 'df84d31b-0214-4a78-bd37-775422949bcf' ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">Mon-Thu, Sat-Sun: 2pm-11pm | Fri: 3pm-12am</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-xs">Résidence bowling, Bd massira, Ifrane</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {restaurant.cuisine_type}
                      </Badge>
                      <div className="pt-2 border-t space-y-1 text-xs">
                        <div className="flex items-start gap-1.5">
                          <span className="text-primary">✓</span>
                          <span className="text-muted-foreground">Personalized cake designs</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-primary">✓</span>
                          <span className="text-muted-foreground">10+ years experience in Morocco</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {restaurant.review_count} reviews
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>25-35 min</span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {restaurant.cuisine_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {restaurant.review_count} reviews
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/restaurants")}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:scale-105"
          >
            View All Restaurants
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurants;
