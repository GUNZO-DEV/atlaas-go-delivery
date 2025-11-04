import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  itemId: string;
  itemType: "restaurant" | "menu_item";
  size?: "sm" | "default" | "lg";
}

const FavoriteButton = ({ itemId, itemType, size = "default" }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFavoriteStatus();
  }, [itemId, itemType]);

  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (itemType === "restaurant") {
        const { data, error } = await supabase
          .from("favorite_restaurants")
          .select("id")
          .eq("user_id", user.id)
          .eq("restaurant_id", itemId)
          .maybeSingle();

        if (error) throw error;
        setIsFavorite(!!data);
      } else {
        const { data, error } = await supabase
          .from("favorite_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("menu_item_id", itemId)
          .maybeSingle();

        if (error) throw error;
        setIsFavorite(!!data);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to save favorites",
          variant: "destructive"
        });
        return;
      }

      if (itemType === "restaurant") {
        if (isFavorite) {
          // Remove restaurant from favorites
          const { error } = await supabase
            .from("favorite_restaurants")
            .delete()
            .eq("user_id", user.id)
            .eq("restaurant_id", itemId);

          if (error) throw error;
          
          setIsFavorite(false);
          toast({
            title: "Removed from favorites",
            description: "Restaurant removed from your favorites"
          });
        } else {
          // Add restaurant to favorites
          const { error } = await supabase
            .from("favorite_restaurants")
            .insert({
              user_id: user.id,
              restaurant_id: itemId
            });

          if (error) throw error;
          
          setIsFavorite(true);
          toast({
            title: "Added to favorites",
            description: "Restaurant saved to your favorites"
          });
        }
      } else {
        if (isFavorite) {
          // Remove menu item from favorites
          const { error } = await supabase
            .from("favorite_items")
            .delete()
            .eq("user_id", user.id)
            .eq("menu_item_id", itemId);

          if (error) throw error;
          
          setIsFavorite(false);
          toast({
            title: "Removed from favorites",
            description: "Item removed from your favorites"
          });
        } else {
          // Add menu item to favorites
          const { error } = await supabase
            .from("favorite_items")
            .insert({
              user_id: user.id,
              menu_item_id: itemId
            });

          if (error) throw error;
          
          setIsFavorite(true);
          toast({
            title: "Added to favorites",
            description: "Item saved to your favorites"
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "sm" : "icon"}
      onClick={toggleFavorite}
      disabled={loading}
      className="relative group"
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isFavorite 
            ? "fill-red-500 text-red-500" 
            : "text-muted-foreground group-hover:text-red-500"
        }`}
      />
    </Button>
  );
};

export default FavoriteButton;