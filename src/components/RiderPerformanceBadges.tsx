import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Star, Moon, Calendar, ThumbsUp, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RiderBadge {
  id: string;
  badge_type: string;
  level: number;
  earned_at: string;
}

const badgeConfig = {
  fast_delivery: {
    icon: Zap,
    name: "Fast Delivery",
    color: "text-yellow-500",
    description: "Consistently complete deliveries quickly",
  },
  customer_favorite: {
    icon: ThumbsUp,
    name: "Customer Favorite",
    color: "text-pink-500",
    description: "High customer satisfaction ratings",
  },
  night_owl: {
    icon: Moon,
    name: "Night Owl",
    color: "text-purple-500",
    description: "Late night delivery champion",
  },
  weekend_warrior: {
    icon: Calendar,
    name: "Weekend Warrior",
    color: "text-blue-500",
    description: "Weekend delivery expert",
  },
  streak_master: {
    icon: Trophy,
    name: "Streak Master",
    color: "text-orange-500",
    description: "Consistent delivery streaks",
  },
  top_rated: {
    icon: Star,
    name: "Top Rated",
    color: "text-amber-500",
    description: "5-star rating excellence",
  },
  eco_champion: {
    icon: Leaf,
    name: "Eco Champion",
    color: "text-green-500",
    description: "Eco-friendly delivery methods",
  },
};

const RiderPerformanceBadges = () => {
  const [badges, setBadges] = useState<RiderBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("rider_badges")
        .select("*")
        .eq("rider_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Performance Badges
        </CardTitle>
        <CardDescription>
          Earn badges for your outstanding performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete more deliveries to earn badges!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const config = badgeConfig[badge.badge_type as keyof typeof badgeConfig];
              const Icon = config?.icon || Trophy;
              
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-card animate-scale-in"
                >
                  <div className="relative">
                    <Icon className={`h-12 w-12 ${config?.color || 'text-gray-500'}`} />
                    {badge.level > 1 && (
                      <Badge
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        variant="secondary"
                      >
                        {badge.level}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm mt-2 text-center">
                    {config?.name || badge.badge_type}
                  </h4>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {config?.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiderPerformanceBadges;
