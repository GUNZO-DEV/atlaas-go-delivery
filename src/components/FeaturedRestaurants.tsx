import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, Percent } from "lucide-react";

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
  const navigate = useNavigate();

  // Hardcoded Ifrane restaurants for display
  const restaurants: Restaurant[] = [
    {
      id: "cafe-la-paix",
      name: "Café Restaurant LA PAIX",
      description: "Traditional Moroccan café with a cozy atmosphere and delicious local cuisine",
      cuisine_type: "Moroccan",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      average_rating: 4.5,
      review_count: 128,
      address: "Ifrane, Morocco"
    },
    {
      id: "for-you-ifrane",
      name: "Restaurant For You Ifrane",
      description: "Modern dining experience with diverse menu options for every taste",
      cuisine_type: "International",
      image_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
      average_rating: 4.3,
      review_count: 95,
      address: "Ifrane, Morocco"
    },
    {
      id: "foodies-ifrane",
      name: "Foodies Ifrane",
      description: "Trendy spot for food lovers with Instagram-worthy dishes",
      cuisine_type: "Fast Food",
      image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
      average_rating: 4.4,
      review_count: 156,
      address: "Ifrane, Morocco"
    },
    {
      id: "forest-restaurant",
      name: "Forest Restaurant",
      description: "Scenic restaurant surrounded by nature with fresh local ingredients",
      cuisine_type: "Moroccan",
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
      average_rating: 4.6,
      review_count: 203,
      address: "Ifrane Forest, Morocco"
    },
    {
      id: "diafa-2-awlad-alhaj",
      name: "Restaurant Diafa 2 Awlad ALHaj",
      description: "Authentic Moroccan hospitality with traditional tagines and couscous",
      cuisine_type: "Moroccan",
      image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
      average_rating: 4.7,
      review_count: 312,
      address: "Ifrane, Morocco"
    },
    {
      id: "restaurant-platane",
      name: "Restaurant Platane",
      description: "Classic dining under the shade of platane trees with Moroccan flavors",
      cuisine_type: "Moroccan",
      image_url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
      average_rating: 4.4,
      review_count: 178,
      address: "Ifrane, Morocco"
    },
    {
      id: "bonsai-sushi-bar",
      name: "Bonsai Sushi Bar",
      description: "Fresh sushi and Japanese cuisine in the heart of Ifrane",
      cuisine_type: "Japanese",
      image_url: "/images/bonsai-sushi-bar.jpg",
      average_rating: 4.8,
      review_count: 89,
      address: "Ifrane, Morocco"
    },
    {
      id: "lyn-restaurant",
      name: "Lyn Restaurant",
      description: "Contemporary cuisine with a touch of elegance and creativity",
      cuisine_type: "International",
      image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
      average_rating: 4.5,
      review_count: 145,
      address: "Ifrane, Morocco"
    },
    {
      id: "green-coffee",
      name: "Green Coffee",
      description: "Cozy coffee shop with premium blends and light bites",
      cuisine_type: "Café",
      image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      average_rating: 4.6,
      review_count: 234,
      address: "Ifrane, Morocco"
    }
  ];

  const specialOffers = [
    { text: "20% OFF", color: "bg-red-500" },
    { text: "Free Delivery", color: "bg-green-500" },
    { text: "15% OFF", color: "bg-orange-500" },
    { text: "Buy 1 Get 1", color: "bg-purple-500" },
  ];

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
            Popular Restaurants in Ifrane
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
            Discover the best restaurants with exclusive offers and deals
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {restaurants.map((restaurant, index) => {
            const offer = specialOffers[index % specialOffers.length];
            return (
              <Card
                key={restaurant.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2 hover:border-primary/50"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={restaurant.image_url}
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
