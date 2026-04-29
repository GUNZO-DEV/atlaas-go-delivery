import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, SlidersHorizontal, MapPin, Clock, Search } from "lucide-react";
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

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("average_rating", { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
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

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (r) => r.cuisine_type?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
      <header className="sticky top-0 z-50 glass-nav">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold">Restaurants</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                Ifrane — AUI Campus & Surrounds
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <SmartSearch />
        </div>

        <div className="mb-6 -mx-4">
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 glass-surface"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[160px] h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-3">
              <div className="text-6xl mb-2">🔍</div>
              <h3 className="font-display text-xl font-semibold">No restaurants found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {selectedCategory !== "all"
                  ? `We couldn't find any ${selectedCategory} restaurants. Try another category.`
                  : "Try adjusting your search filters or check back later."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filteredRestaurants.map((restaurant, idx) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
              >
                <Card
                  className="overflow-hidden cursor-pointer group border-border/60 hover:border-primary/40 hover:shadow-elevation hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                      alt={restaurant.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 rounded-full glass-surface p-1">
                      <FavoriteButton itemId={restaurant.id} itemType="restaurant" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                      <h3 className="font-display font-bold text-lg leading-tight drop-shadow">
                        {restaurant.name}
                      </h3>
                      <Badge className="bg-primary text-primary-foreground border-0 shrink-0">
                        {restaurant.cuisine_type}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {restaurant.description || "Discover authentic flavors delivered to your dorm."}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <div className="flex items-center gap-1">
                        <StarRating rating={restaurant.average_rating || 0} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          ({restaurant.review_count || 0})
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        25–35 min
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      {restaurant.address}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
