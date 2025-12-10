import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MobileBottomNav = () => {
  const location = useLocation();
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (!userId) {
      setUnreadOrders(0);
      return;
    }

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      setUnreadOrders(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const navItems = [
    { icon: Home, label: "Home", path: "/", badge: 0 },
    { icon: ShoppingBag, label: "Orders", path: "/customer", badge: unreadOrders },
    { icon: GraduationCap, label: "AUIER", path: "/auier-delivery", featured: true, badge: 0 },
    { icon: User, label: "Profile", path: "/auth", badge: 0 },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
              item.featured 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110 -mt-4"
                : isActive(item.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <item.icon className={cn("w-5 h-5", item.featured && "w-6 h-6")} />
              {item.badge > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1 animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className={cn("text-xs font-medium", item.featured && "font-bold")}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
