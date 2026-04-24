import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Sparkles, RefreshCw, MapPin, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  address: string | null;
  _score?: number;
  _reason?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const RecommendedForYou = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const buildRecommendations = useCallback(async (uid: string | null) => {
    // Pull all active restaurants (single source of truth)
    const { data: allRestaurants, error: rErr } = await supabase
      .from("restaurants")
      .select("id, name, description, cuisine_type, image_url, average_rating, review_count, address")
      .eq("is_active", true);

    if (rErr) throw rErr;
    if (!allRestaurants || allRestaurants.length === 0) return [];

    // Anonymous users: top-rated fallback with light shuffle
    if (!uid) {
      return [...allRestaurants]
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 8)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map((r) => ({ ...r, _reason: "Top-rated in your area" }));
    }

    // Gather signals in parallel
    const [ordersRes, favRestRes, favItemsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("restaurant_id, restaurants(cuisine_type)")
        .eq("customer_id", uid)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("favorite_restaurants").select("restaurant_id").eq("user_id", uid),
      supabase
        .from("favorite_items")
        .select("menu_items(restaurant_id, category)")
        .eq("user_id", uid),
    ]);

    // Count cuisine preferences
    const cuisineCounts = new Map<string, number>();
    const orderedRestaurantIds = new Set<string>();

    ordersRes.data?.forEach((o: any) => {
      if (o.restaurant_id) orderedRestaurantIds.add(o.restaurant_id);
      const c = o.restaurants?.cuisine_type;
      if (c) cuisineCounts.set(c, (cuisineCounts.get(c) || 0) + 2);
    });

    favItemsRes.data?.forEach((f: any) => {
      const c = f.menu_items?.category;
      if (c) cuisineCounts.set(c, (cuisineCounts.get(c) || 0) + 1);
    });

    const favoriteIds = new Set(favRestRes.data?.map((f) => f.restaurant_id) || []);

    // Score each restaurant
    const scored: Restaurant[] = allRestaurants.map((r) => {
      let score = (r.average_rating || 0) * 2; // baseline quality
      let reason = "Popular pick";

      if (favoriteIds.has(r.id)) {
        score += 8;
        reason = "From your favorites";
      }

      const cuisineBoost = r.cuisine_type ? cuisineCounts.get(r.cuisine_type) || 0 : 0;
      if (cuisineBoost > 0) {
        score += cuisineBoost * 1.5;
        reason = `Because you like ${r.cuisine_type}`;
      }

      // Slight penalty for restaurants ordered very recently (encourage variety)
      if (orderedRestaurantIds.has(r.id) && !favoriteIds.has(r.id)) {
        score -= 2;
      }

      // Random tie-breaker so refresh shuffles ties
      score += Math.random() * 0.5;

      return { ...r, _score: score, _reason: reason };
    });

    return scored.sort((a, b) => (b._score || 0) - (a._score || 0)).slice(0, 4);
  }, []);

  const load = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const uid = authData.user?.id || null;
        setUserId(uid);
        const recs = await buildRecommendations(uid);
        setRecommendations(recs);
      } catch (err) {
        console.error("Recommendation error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildRecommendations]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary mt-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                {userId ? "Recommended for you" : "You might love these"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {userId
                  ? "Picked from your orders, favorites & local favorites"
                  : "Sign in to get personalized picks"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={refreshing || loading}
            className="shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-44 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {recommendations.map((restaurant, index) => (
              <motion.div
                key={`${restaurant.id}-${index}`}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden border hover:border-primary/30 h-full"
                >
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={
                        restaurant.image_url ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
                      }
                      alt={restaurant.name}
                      className="w-full h-44 object-cover"
                      loading="lazy"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                    />
                    <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold">
                        {(restaurant.average_rating || 0).toFixed(1)}
                      </span>
                    </div>
                    {restaurant._reason && (
                      <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground border-0 text-[10px] shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        {restaurant._reason}
                      </Badge>
                    )}
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
                      {restaurant.cuisine_type && (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {restaurant.cuisine_type}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button
            onClick={() => navigate("/restaurants")}
            variant="ghost"
            className="text-primary font-semibold"
          >
            Browse all restaurants
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecommendedForYou;
