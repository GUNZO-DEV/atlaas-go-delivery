import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, UtensilsCrossed, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/FavoriteButton";
import { useToast } from "@/hooks/use-toast";

interface FavoriteRestaurant {
  id: string;
  restaurants: {
    id: string;
    name: string;
    cuisine_type: string;
    average_rating: number;
    image_url: string | null;
  };
}

interface FavoriteMenuItem {
  id: string;
  menu_items: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    restaurants: {
      name: string;
      id: string;
    };
  };
}

const Favorites = () => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<FavoriteRestaurant[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch favorite restaurants
      const { data: restaurants } = await supabase
        .from("favorite_restaurants")
        .select(`
          id,
          restaurants (
            id,
            name,
            cuisine_type,
            average_rating,
            image_url
          )
        `)
        .eq("user_id", user.id);

      // Fetch favorite menu items
      const { data: items } = await supabase
        .from("favorite_items")
        .select(`
          id,
          menu_items (
            id,
            name,
            description,
            price,
            image_url,
            restaurants (
              name,
              id
            )
          )
        `)
        .eq("user_id", user.id);

      setFavoriteRestaurants(restaurants || []);
      setFavoriteItems(items || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-4xl font-bold">My Favorites</h1>
      </div>

      <Tabs defaultValue="restaurants" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Restaurants ({favoriteRestaurants.length})
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            Items ({favoriteItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants" className="mt-6">
          {favoriteRestaurants.length === 0 ? (
            <Card className="p-12 text-center">
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No favorite restaurants yet</h3>
              <p className="text-muted-foreground">
                Start exploring and save your favorite restaurants
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRestaurants.map((fav) => (
                <Card
                  key={fav.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => navigate(`/restaurant/${fav.restaurants.id}`)}
                >
                  {fav.restaurants.image_url && (
                    <img
                      src={fav.restaurants.image_url}
                      alt={fav.restaurants.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{fav.restaurants.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {fav.restaurants.cuisine_type}
                        </p>
                      </div>
                      <FavoriteButton
                        itemId={fav.restaurants.id}
                        itemType="restaurant"
                        size="sm"
                      />
                    </div>
                    {fav.restaurants.average_rating > 0 && (
                      <Badge variant="secondary">
                        ⭐ {fav.restaurants.average_rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          {favoriteItems.length === 0 ? (
            <Card className="p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No favorite items yet</h3>
              <p className="text-muted-foreground">
                Save your favorite dishes for quick reordering
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItems.map((fav) => (
                <Card
                  key={fav.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => navigate(`/restaurant/${fav.menu_items.restaurants.id}`)}
                >
                  {fav.menu_items.image_url && (
                    <img
                      src={fav.menu_items.image_url}
                      alt={fav.menu_items.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{fav.menu_items.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {fav.menu_items.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          at {fav.menu_items.restaurants.name}
                        </p>
                      </div>
                      <FavoriteButton
                        itemId={fav.menu_items.id}
                        itemType="menu_item"
                        size="sm"
                      />
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {fav.menu_items.price} MAD
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Favorites;