import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SupportLocalBadgeProps {
  variant?: "default" | "compact" | "detailed";
  showArabic?: boolean;
}

const SupportLocalBadge = ({ variant = "default", showArabic = false }: SupportLocalBadgeProps) => {
  if (variant === "compact") {
    return (
      <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-accent/30 border-2 hover:from-accent/90 hover:to-accent/70 transition-all">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🇲🇦</span>
          <span className="font-semibold text-xs">Support Local</span>
        </div>
      </Badge>
    );
  }

  if (variant === "detailed") {
    return (
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/10 to-primary/10 border-2 border-accent/30 rounded-xl px-4 py-2.5 shadow-sm">
        <div className="relative">
          <span className="text-2xl">🇲🇦</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground">Support Local</span>
          {showArabic && (
            <span className="font-semibold text-xs text-muted-foreground">محلي وطني</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/15 via-accent/10 to-primary/15 border-2 border-accent/30 rounded-lg px-3 py-1.5 backdrop-blur-sm">
      <span className="text-lg">🇲🇦</span>
      <span className="font-bold text-sm text-foreground">Support Local</span>
      {showArabic && (
        <span className="text-xs text-muted-foreground font-semibold">محلي وطني</span>
      )}
    </div>
  );
};

export default SupportLocalBadge;
