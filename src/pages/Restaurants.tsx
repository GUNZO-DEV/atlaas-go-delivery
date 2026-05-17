import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ArrowLeft, SlidersHorizontal, MapPin, Clock, Search,
  Bell, ChevronDown, Bike, Star, Heart,
} from "lucide-react";
import StarRating from "@/components/StarRating";
import FavoriteButton from "@/components/FavoriteButton";
import CategorySelector from "@/components/CategorySelector";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

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
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine_type?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const featured = filteredRestaurants.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky glass header */}
      <header
        className="sticky top-0 z-40 border-b border-border/50"
        style={{
          background: "rgba(11,14,20,0.55)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 pt-3 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full h-9 w-9 text-white hover:bg-white/15 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.08em] text-white/55 font-semibold">
                Deliver to
              </div>
              <div className="text-[13px] font-semibold text-white flex items-center gap-1 truncate">
                Ifrane · AUI Campus
                <ChevronDown className="h-3 w-3 opacity-60" />
              </div>
            </div>
            <div className="relative shrink-0">
              <Bell className="h-5 w-5 text-white/80" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-[#0B0E14]" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search restaurants, cuisines…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-white/[0.08] border-white/15 text-white placeholder:text-white/50 focus-visible:ring-primary/50"
            />
          </div>
        </div>

        {/* Category pills (horizontal scroll) */}
        <div className="-mt-1 pb-2">
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 pt-6 pb-24">
        {/* Sort row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
            {filteredRestaurants.length} places
            {selectedCategory !== "all" && ` · ${selectedCategory}`}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[140px] h-9 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured · Atlas Picks */}
        {featured.length > 0 && !searchQuery && selectedCategory === "all" && (
          <section className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-3">
              Featured · Atlas Picks
            </div>
            <div className="flex gap-3 overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2 snap-x snap-mandatory scrollbar-hide">
              {featured.map((r) => (
                <button
                  key={`feat-${r.id}`}
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                  className="shrink-0 w-[230px] snap-start text-left bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <div className="relative h-[110px] overflow-hidden bg-muted">
                    <img
                      src={r.image_url || FALLBACK_IMG}
                      alt={r.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 ag-grad-sunset text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Verified Local
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="ag-font-display text-[14px] truncate">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      20% off your first order
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* List */}
        {filteredRestaurants.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl py-16 text-center space-y-3">
            <div className="text-5xl mb-1">🔍</div>
            <h3 className="ag-font-display text-xl">No restaurants found</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              {selectedCategory !== "all"
                ? `We couldn't find any ${selectedCategory} restaurants. Try another category.`
                : "Try adjusting your search filters or check back later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRestaurants.map((r, idx) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(idx * 0.04, 0.4),
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => navigate(`/restaurant/${r.id}`)}
                className="text-left bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={r.image_url || FALLBACK_IMG}
                    alt={r.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 ag-grad-sunset text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    Verified
                  </span>
                  <div
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{
                      background: "rgba(11,14,20,0.55)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <FavoriteButton itemId={r.id} itemType="restaurant" />
                  </div>
                </div>
                <div className="p-3.5 sm:p-4">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="ag-font-display text-[15px] truncate">{r.name}</div>
                    <StarRating rating={r.average_rating || 0} size="sm" />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {r.cuisine_type || "Local cuisine"}
                  </div>
                  <div className="flex items-center gap-2.5 mt-2.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 25–35 min
                    </span>
                    <span className="w-px h-3 bg-border" />
                    <span className="inline-flex items-center gap-1">
                      <Bike className="w-3 h-3" /> from 12 DH
                    </span>
                    {r.review_count > 0 && (
                      <>
                        <span className="w-px h-3 bg-border" />
                        <span>({r.review_count})</span>
                      </>
                    )}
                  </div>
                  {r.address && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate mt-2 pt-2 border-t border-border/60">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      {r.address}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
