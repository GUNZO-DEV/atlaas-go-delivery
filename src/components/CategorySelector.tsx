import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  value: string;
  label: string;
  icon: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  sushi: "🍣",
  japanese: "🍣",
  burgers: "🍔",
  american: "🍔",
  pizza: "🍕",
  italian: "🍕",
  healthy: "🥗",
  salad: "🥗",
  snacks: "🍟",
  "fast food": "🍟",
  moroccan: "🥘",
  desserts: "🍰",
  bakery: "🍰",
};

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategorySelector({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("restaurants")
      .select("cuisine_type")
      .eq("is_active", true);

    if (data) {
      // Extract unique categories and map to icons
      const uniqueTypes = [...new Set(data.map((r) => r.cuisine_type).filter(Boolean))];
      const categoryList: Category[] = uniqueTypes.map((type) => ({
        value: type.toLowerCase(),
        label: type,
        icon: CATEGORY_ICONS[type.toLowerCase()] || "🍽️",
      }));

      setCategories(categoryList);
    }
  };

  const allCategories: Category[] = [
    { value: "all", label: "All", icon: "🌟" },
    ...categories,
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-2">
      <div className="flex gap-3 px-4 min-w-max">
        {allCategories.map((category) => (
          <Button
            key={category.value}
            variant="ghost"
            onClick={() => onSelectCategory(category.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[80px] h-auto transition-all duration-200",
              "hover:scale-105",
              selectedCategory === category.value
                ? "bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-lg shadow-primary/20 scale-105"
                : "border border-border hover:border-primary/50"
            )}
          >
            <span className="text-3xl">{category.icon}</span>
            <span className={cn(
              "text-xs font-medium whitespace-nowrap",
              selectedCategory === category.value
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            )}>
              {category.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
