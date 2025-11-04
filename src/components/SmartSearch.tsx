import { useState, useEffect, useMemo } from "react";
import { Search, X, UtensilsCrossed, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  average_rating: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurant_id: string;
  restaurants: {
    name: string;
  };
}

interface SmartSearchProps {
  onClose?: () => void;
  isModal?: boolean;
}

const SmartSearch = ({ onClose, isModal = false }: SmartSearchProps) => {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setRestaurants([]);
      setMenuItems([]);
      return;
    }

    searchAll();
  }, [debouncedQuery]);

  const searchAll = async () => {
    setLoading(true);
    try {
      const searchPattern = `%${debouncedQuery}%`;

      // Search restaurants
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, average_rating")
        .or(`name.ilike.${searchPattern},cuisine_type.ilike.${searchPattern}`)
        .eq("is_active", true)
        .limit(5);

      // Search menu items
      const { data: menuData } = await supabase
        .from("menu_items")
        .select(`
          id,
          name,
          description,
          price,
          restaurant_id,
          restaurants (name)
        `)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .eq("is_available", true)
        .limit(8);

      setRestaurants(restaurantData || []);
      setMenuItems(menuData || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
    onClose?.();
  };

  const handleMenuItemClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
    onClose?.();
  };

  const clearSearch = () => {
    setQuery("");
    setRestaurants([]);
    setMenuItems([]);
  };

  return (
    <div className={isModal ? "w-full" : "w-full max-w-2xl mx-auto"}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search restaurants, dishes, cuisine types..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 h-12 text-lg"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results */}
      {query.trim().length >= 2 && (
        <Card className="mt-4 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {/* Restaurants */}
              {restaurants.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Restaurants</h3>
                  </div>
                  <div className="space-y-2">
                    {restaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        onClick={() => handleRestaurantClick(restaurant.id)}
                        className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{restaurant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {restaurant.cuisine_type}
                            </p>
                          </div>
                          {restaurant.average_rating > 0 && (
                            <Badge variant="secondary">
                              ⭐ {restaurant.average_rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Items */}
              {menuItems.length > 0 && (
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <UtensilsCrossed className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-lg">Menu Items</h3>
                  </div>
                  <div className="space-y-2">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleMenuItemClick(item.restaurant_id)}
                        className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              at {item.restaurants.name}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {item.price} MAD
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {restaurants.length === 0 && menuItems.length === 0 && !loading && (
                <div className="p-8 text-center text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default SmartSearch;