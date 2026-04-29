import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Flame, MapPin, Star, Sparkles, Plus, ChevronRight, X } from "lucide-react";

const PRICE_MAX = 200; // DH

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cuisine_type: string | null;
  average_rating: number | null;
  review_count: number | null;
  address: string | null;
}

interface PopularItem {
  menu_item_id: string;
  name: string;
  price: number;
  image_url: string | null;
  restaurant_id: string;
  restaurant_name: string;
  total_qty: number;
}

export default function CommunityDashboard() {
  const navigate = useNavigate();
  
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [popular, setPopular] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cuisine, setCuisine] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_MAX]);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRestaurants) if (r.cuisine_type) set.add(r.cuisine_type);
    return Array.from(set).sort();
  }, [allRestaurants]);

  const filteredRestaurants = useMemo(() => {
    return allRestaurants.filter((r) => {
      if (cuisine !== "all" && r.cuisine_type !== cuisine) return false;
      // Restaurant-level price filter only applies when restaurant has any items in range.
      // Without per-restaurant price metadata loaded, keep all that pass cuisine.
      return true;
    });
  }, [allRestaurants, cuisine]);

  const filteredLegends = useMemo(() => filteredRestaurants.slice(0, 6), [filteredRestaurants]);

  const filteredPopular = useMemo(() => {
    return popular.filter((p) => {
      if (cuisine !== "all") {
        const r = allRestaurants.find((x) => x.id === p.restaurant_id);
        if (!r || r.cuisine_type !== cuisine) return false;
      }
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [popular, cuisine, priceRange, allRestaurants]);

  const filtersActive = cuisine !== "all" || priceRange[0] !== 0 || priceRange[1] !== PRICE_MAX;

  useEffect(() => {
    document.title = "Community Choice — Atlaasgo Ifrane";
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const { data: rests } = await supabase
        .from("restaurants")
        .select("id,name,description,image_url,cuisine_type,average_rating,review_count,address")
        .eq("is_active", true)
        .order("average_rating", { ascending: false });

      const list = (rests || []) as Restaurant[];
      setAllRestaurants(list);

      // Top 5 most-ordered items in last 30 days
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: items } = await supabase
        .from("order_items")
        .select("menu_item_id,quantity,created_at,menu_items(id,name,price,image_url,restaurant_id,restaurants(name))")
        .gte("created_at", since)
        .limit(500);

      const tally = new Map<string, PopularItem>();
      for (const row of (items || []) as any[]) {
        const mi = row.menu_items;
        if (!mi) continue;
        const existing = tally.get(mi.id);
        const qty = Number(row.quantity) || 0;
        if (existing) {
          existing.total_qty += qty;
        } else {
          tally.set(mi.id, {
            menu_item_id: mi.id,
            name: mi.name,
            price: Number(mi.price) || 0,
            image_url: mi.image_url,
            restaurant_id: mi.restaurant_id,
            restaurant_name: mi.restaurants?.name || "",
            total_qty: qty,
          });
        }
      }
      const top = Array.from(tally.values())
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 20);

      // Fallback: if no order history yet, surface 5 highest-rated restaurants' first menu item
      if (top.length === 0 && list.length > 0) {
        const ids = list.slice(0, 5).map((r) => r.id);
        const { data: fallback } = await supabase
          .from("menu_items")
          .select("id,name,price,image_url,restaurant_id,restaurants(name)")
          .in("restaurant_id", ids)
          .eq("is_available", true)
          .limit(5);
        for (const mi of (fallback || []) as any[]) {
          top.push({
            menu_item_id: mi.id,
            name: mi.name,
            price: Number(mi.price) || 0,
            image_url: mi.image_url,
            restaurant_id: mi.restaurant_id,
            restaurant_name: mi.restaurants?.name || "",
            total_qty: 0,
          });
        }
      }
      setPopular(top);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Glass header */}
      <div className="glass-nav sticky top-0 z-30 px-4 py-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Atlaasgo Ifrane</p>
          <h1 className="text-lg font-heading font-bold leading-tight">Community Choice</h1>
        </div>
        <Badge variant="secondary" className="gap-1"><MapPin className="h-3 w-3" /> Ifrane</Badge>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main column */}
          <div className="space-y-8">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/20"
            >
              <Sparkles className="absolute right-4 top-4 h-20 w-20 text-primary/20" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Curated by your campus</p>
                <h2 className="text-2xl sm:text-4xl font-heading font-extrabold leading-tight max-w-xl">
                  The spots Ifrane students actually order from.
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Verified local merchants, real rider coverage, dorm-aware delivery.
                </p>
              </div>
            </motion.div>

            {/* Filters */}
            <div className="rounded-[1.25rem] border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filters</p>
                {filtersActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCuisine("all"); setPriceRange([0, PRICE_MAX]); }}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold mb-2">Cuisine</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCuisine("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      cuisine === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/40"
                    }`}
                  >
                    All
                  </button>
                  {cuisines.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCuisine(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        cuisine === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold">Price range (Quick Order)</p>
                  <p className="text-xs text-muted-foreground">
                    {priceRange[0]}–{priceRange[1]} DH
                  </p>
                </div>
                <Slider
                  min={0}
                  max={PRICE_MAX}
                  step={5}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
                />
              </div>
            </div>

            {/* Community Choice grid */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                    <Flame className="h-4 w-4" /> Community Choice
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold">Local Ifrane merchants</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/restaurants")}>
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 rounded-[1.25rem]" />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {legends.map((r, i) => (
                    <motion.button
                      key={r.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/restaurant/${r.id}`)}
                      className="group relative overflow-hidden rounded-[1.25rem] border border-border bg-card text-left hover:shadow-2xl hover:-translate-y-1 transition-all"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt={r.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                            ✓ Local Legend
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h4 className="font-heading font-bold text-lg leading-tight">{r.name}</h4>
                          <div className="flex items-center gap-2 text-xs mt-1 opacity-90">
                            {r.cuisine_type && <span>{r.cuisine_type}</span>}
                            {r.average_rating ? (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {Number(r.average_rating).toFixed(1)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </section>

            {/* All restaurants strip */}
            {!loading && allRestaurants.length > 6 && (
              <section>
                <h3 className="text-lg font-heading font-bold mb-3">More on the platform</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                  {allRestaurants.slice(6).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(`/restaurant/${r.id}`)}
                      className="flex-none w-44 snap-start text-left rounded-2xl border border-border overflow-hidden bg-card hover:border-primary/40 transition"
                    >
                      <div className="aspect-square bg-muted">
                        {r.image_url && (
                          <img src={r.image_url} alt={r.name} loading="lazy" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-semibold truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.cuisine_type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Quick-Order sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.25rem] border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Quick Order</p>
              </div>
              <h3 className="font-heading font-bold text-base mb-3">Top 5 on campus</h3>

              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : popular.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet — order history unlocks this.</p>
              ) : (
                <ul className="space-y-2">
                  {popular.map((p, i) => (
                    <li key={p.menu_item_id}>
                      <button
                        onClick={() => navigate(`/restaurant/${p.restaurant_id}`)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl bg-card hover:bg-accent border border-border transition group"
                      >
                        <div className="relative flex-none w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10" />
                          )}
                          <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow">
                            {i + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{p.restaurant_name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-primary">{p.price.toFixed(0)} DH</span>
                          <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                className="w-full mt-4"
                onClick={() => navigate("/restaurants")}
              >
                Browse full menu
              </Button>
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-border bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Dorm Drop</p>
              <p className="text-sm">Delivery straight to your building & room — choose at checkout.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
