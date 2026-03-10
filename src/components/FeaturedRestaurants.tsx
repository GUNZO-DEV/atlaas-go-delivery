import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  image_url: string;
  average_rating: number;
  review_count: number;
  delivery_time: string;
}

const FeaturedRestaurants = () => {
  const navigate = useNavigate();

  const restaurants: Restaurant[] = [
    {
      id: "cafe-la-paix",
      name: "Café Restaurant LA PAIX",
      description: "Traditional Moroccan café with cozy atmosphere and local cuisine",
      cuisine_type: "Moroccan",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      average_rating: 4.5,
      review_count: 128,
      delivery_time: "25-35",
    },
    {
      id: "for-you-ifrane",
      name: "Restaurant For You",
      description: "Modern dining with diverse menu options for every taste",
      cuisine_type: "International",
      image_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
      average_rating: 4.3,
      review_count: 95,
      delivery_time: "20-30",
    },
    {
      id: "foodies-ifrane",
      name: "Foodies Ifrane",
      description: "Trendy spot for food lovers with creative dishes",
      cuisine_type: "Fast Food",
      image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
      average_rating: 4.4,
      review_count: 156,
      delivery_time: "15-25",
    },
    {
      id: "diafa-2-awlad-alhaj",
      name: "Restaurant Diafa 2",
      description: "Authentic hospitality with traditional tagines and couscous",
      cuisine_type: "Moroccan",
      image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
      average_rating: 4.7,
      review_count: 312,
      delivery_time: "30-40",
    },
    {
      id: "bonsai-sushi-bar",
      name: "Bonsai Sushi Bar",
      description: "Fresh sushi and Japanese cuisine in the heart of Ifrane",
      cuisine_type: "Japanese",
      image_url: "/images/bonsai-sushi-bar.jpg",
      average_rating: 4.8,
      review_count: 89,
      delivery_time: "25-35",
    },
    {
      id: "5b731ce8-f229-4304-985a-a2dd4bcc2385",
      name: "Lyn Restaurant",
      description: "Contemporary cuisine with elegance and creativity",
      cuisine_type: "International",
      image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
      average_rating: 4.5,
      review_count: 145,
      delivery_time: "20-30",
    },
  ];

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
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden border hover:border-primary/30"
            >
              <div className="relative overflow-hidden">
                <img
                  src={restaurant.image_url}
                  alt={restaurant.name}
                  className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold">{restaurant.average_rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({restaurant.review_count})</span>
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
                      {restaurant.delivery_time} min
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
