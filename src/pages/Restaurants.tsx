import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, ArrowLeft, SlidersHorizontal, MapPin } from "lucide-react";
import StarRating from "@/components/StarRating";
import SmartSearch from "@/components/SmartSearch";
import FavoriteButton from "@/components/FavoriteButton";
import CategorySelector from "@/components/CategorySelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cuisine_type: string;
  average_rating: number;
  review_count: number;
  address: string;
}

export default function Restaurants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    filterAndSortRestaurants();
  }, [restaurants, searchQuery, sortBy, selectedCategory]);

  // Hardcoded Ifrane restaurants for display
  const ifraneRestaurants: Restaurant[] = [
    {
      id: "ifrane-1",
      name: "Café Restaurant LA PAIX",
      description: "Traditional Moroccan café with a peaceful atmosphere. Serving authentic local dishes and refreshing beverages.",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      cuisine_type: "Moroccan",
      average_rating: 4.5,
      review_count: 120,
      address: "Ifrane City Center"
    },
    {
      id: "ifrane-2",
      name: "Restaurant For You Ifrane",
      description: "Modern dining experience with international and Moroccan fusion cuisine. Perfect for family gatherings.",
      image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      cuisine_type: "International",
      average_rating: 4.3,
      review_count: 85,
      address: "Avenue Mohammed V, Ifrane"
    },
    {
      id: "ifrane-3",
      name: "Foodies Ifrane",
      description: "Casual dining spot popular among students. Great burgers, sandwiches and quick bites.",
      image_url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
      cuisine_type: "Fast Food",
      average_rating: 4.4,
      review_count: 200,
      address: "Near AUI Campus, Ifrane"
    },
    {
      id: "ifrane-4",
      name: "Forest Restaurant",
      description: "Scenic restaurant surrounded by cedar forests. Specializing in grilled meats and traditional tagines.",
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      cuisine_type: "Moroccan",
      average_rating: 4.6,
      review_count: 150,
      address: "Cedar Forest Road, Ifrane"
    },
    {
      id: "ifrane-5",
      name: "Restaurant Diafa 2 Awlad ALHaj",
      description: "Authentic Moroccan hospitality with generous portions. Famous for couscous and traditional dishes.",
      image_url: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800",
      cuisine_type: "Moroccan",
      average_rating: 4.7,
      review_count: 180,
      address: "Downtown Ifrane"
    },
    {
      id: "ifrane-6",
      name: "Restaurant Platane",
      description: "Charming restaurant under the plane trees. Mediterranean and Moroccan specialties in a relaxed setting.",
      image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
      cuisine_type: "Mediterranean",
      average_rating: 4.4,
      review_count: 95,
      address: "Place du Marché, Ifrane"
    },
    {
      id: "ifrane-7",
      name: "Bonsai Sushi Bar",
      description: "Fresh sushi and Japanese cuisine in the heart of Ifrane. Modern ambiance with authentic flavors.",
      image_url: "/images/bonsai-sushi-bar.jpg",
      cuisine_type: "Japanese",
      average_rating: 4.5,
      review_count: 110,
      address: "Ifrane City Center"
    },
    {
      id: "ifrane-8",
      name: "Lyn Restaurant",
      description: "Contemporary dining with a creative menu. Perfect blend of local ingredients and modern techniques.",
      image_url: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800",
      cuisine_type: "Contemporary",
      average_rating: 4.3,
      review_count: 75,
      address: "Avenue Hassan II, Ifrane"
    },
    {
      id: "ifrane-9",
      name: "Green Coffee",
      description: "Cozy coffee shop with excellent espresso, pastries and light meals. Student favorite hangout spot.",
      image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      cuisine_type: "Café",
      average_rating: 4.6,
      review_count: 220,
      address: "Near University, Ifrane"
    }
  ];

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("average_rating", { ascending: false });

      if (error) throw error;
      // Merge database restaurants with hardcoded Ifrane restaurants
      setRestaurants([...(data || []), ...ifraneRestaurants]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRestaurants = () => {
    let filtered = [...restaurants];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (r) => r.cuisine_type?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "rating") {
      filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRestaurants(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Restaurants</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Smart Search */}
        <div className="mb-6">
          <SmartSearch />
        </div>

        {/* Category Selector */}
        <div className="mb-8 -mx-4">
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Basic Search and Filters */}
        <div className="mb-8 space-y-4">
          <Input
            placeholder="Filter current page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Restaurant Grid */}
        {filteredRestaurants.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold">No restaurants found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {selectedCategory !== "all"
                  ? `We couldn't find any ${selectedCategory} restaurants. Try selecting a different category.`
                  : "Try adjusting your search filters or check back later for new restaurants."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <div className="relative aspect-video">
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full">
                    <FavoriteButton itemId={restaurant.id} itemType="restaurant" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {restaurant.description}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                    <div className="flex items-center gap-1">
                      <StarRating rating={restaurant.average_rating || 0} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        ({restaurant.review_count || 0})
                      </span>
                    </div>
                  </div>
                  {restaurant.id === 'df84d31b-0214-4a78-bd37-775422949bcf' ? (
                    <div className="space-y-2 text-xs pt-2 border-t">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Hours: Mon-Thu, Sat-Sun 2pm-11pm | Fri 3pm-12am</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>Résidence bowling, Bd massira, Ifrane</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-primary">✓</span>
                        <span className="text-muted-foreground">Personalized cakes • 10+ years experience</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{restaurant.address}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
