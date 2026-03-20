import { Search, Bell, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import AtlaasGoLogo from "@/components/AtlaasGoLogo";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DashboardHeader = () => {
  const { language, setLanguage } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);
      setUnreadCount(count || 0);
    };
    fetchCount();
  }, [userId]);

  const toggleLang = () => setLanguage(language === "en" ? "fr" : "en");
  const langLabel = language === "fr" ? "FR" : "EN";

  return (
    <header className="sticky top-0 z-50">
      {/* Glassmorphism bar */}
      <div className="bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <AtlaasGoLogo className="w-28 h-auto" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLang}
                className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              >
                {langLabel}
              </Button>
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Ifrane, Morocco</span>
          </div>

          {/* Search bar - Glassmorphism */}
          <Link to="/restaurants" className="block">
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-lg border border-border/60 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow">
              <Search className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm font-medium">Where to today?</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
