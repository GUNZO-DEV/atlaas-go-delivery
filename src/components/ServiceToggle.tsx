import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  active: "food" | "services";
}

const ServiceToggle = ({ active }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="glass-surface inline-flex p-1 rounded-full gap-1 mx-auto" role="tablist">
        <button
          onClick={() => navigate("/")}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
            active === "food"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-foreground/70 hover:text-foreground"
          )}
        >
          <UtensilsCrossed className="h-4 w-4" />
          Food
        </button>
        <button
          onClick={() => navigate("/services")}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
            active === "services"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-foreground/70 hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Services
        </button>
      </div>
    </div>
  );
};

export default ServiceToggle;
