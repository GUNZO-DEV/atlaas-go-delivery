import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  image_url: string;
  average_rating: number;
  review_count: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const FeaturedRestaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name, description, cuisine_type, image_url, average_rating, review_count")
          .eq("is_active", true)
          .order("average_rating", { ascending: false })
          .limit(6);

        if (error) throw error;
        setRestaurants(data || []);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (restaurants.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              Popular in Ifrane
            </h2>
            <p className="text-muted-foreground text-sm">
              Top-rated restaurants with fast delivery
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/restaurants")}
            className="hidden sm:flex items-center gap-1 text-primary font-semibold"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
            >
              <Card
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden border hover:border-primary/30"
              >
                <div className="relative overflow-hidden">
                  <motion.img
                    src={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
                    alt={restaurant.name}
                    className="w-full h-44 object-cover"
                    loading="lazy"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{(restaurant.average_rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({restaurant.review_count || 0})</span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-muted-foreground text-xs line-clamp-1 mb-3">
                    {restaurant.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        20-35 min
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Ifrane
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {restaurant.cuisine_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="text-center mt-8 sm:hidden">
          <Button onClick={() => navigate("/restaurants")} variant="outline" className="font-semibold">
            View All Restaurants
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurants;
