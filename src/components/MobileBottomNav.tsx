import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ShoppingBag, label: "Orders", path: "/customer" },
    { icon: GraduationCap, label: "AUIER", path: "/auier-delivery", featured: true },
    { icon: User, label: "Profile", path: "/auth" },
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
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
              item.featured 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110 -mt-4"
                : isActive(item.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5", item.featured && "w-6 h-6")} />
            <span className={cn("text-xs font-medium", item.featured && "font-bold")}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
