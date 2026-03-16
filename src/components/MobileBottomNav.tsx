import { Link, useLocation } from "react-router-dom";
import { Home, Bell, GraduationCap, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const MobileBottomNav = () => {
  const location = useLocation();
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (!userId) { setUnreadOrders(0); return; }

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      setUnreadOrders(count || 0);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => fetchUnreadCount())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const navItems = [
    { icon: Home, label: "Home", path: "/", badge: 0 },
    { icon: ShoppingBag, label: "Orders", path: "/orders", badge: 0 },
    { icon: GraduationCap, label: "AUIER", path: "/auier-delivery", featured: true, badge: 0 },
    { icon: Bell, label: "Inbox", path: "/notifications", badge: unreadOrders },
    { icon: User, label: "Profile", path: "/auth", badge: 0 },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-2px_20px_rgba(0,0,0,0.08)]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
    >
      <div className="flex items-center justify-around py-1.5 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300",
                item.featured 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110 -mt-5 rounded-2xl"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                {active && !item.featured && (
                  <motion.div
                    className="absolute -inset-2 bg-primary/10 rounded-xl"
                    layoutId="nav-indicator"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10", item.featured && "w-6 h-6")} />
                {item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium relative z-10", item.featured && "font-bold text-xs")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;
