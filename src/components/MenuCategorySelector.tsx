import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MenuCategory {
  name: string;
  icon: string;
  count: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  nigiris: "🍣",
  sashimis: "🐟",
  "spring rolls": "🥟",
  "california rolls": "🍙",
  "fry rolls": "🔥",
  assortiments: "🎁",
  "sushi bateau": "⛵",
  woks: "🥘",
  thai: "🌶️",
  brochettes: "�串",
  riz: "🍚",
  makis: "🍱",
  temaki: "🌯",
  soupes: "🍜",
  salades: "🥗",
  nems: "🥢",
  drinks: "🥤",
  "fresh juices": "🧃",
};

interface MenuCategorySelectorProps {
  menuItems: any[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MenuCategorySelector({
  menuItems,
  selectedCategory,
  onSelectCategory,
}: MenuCategorySelectorProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  useEffect(() => {
    // Extract unique categories from menu items
    const categoryMap = new Map<string, number>();
    
    menuItems.forEach((item) => {
      const category = item.category || "Other";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categoryList: MenuCategory[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      icon: CATEGORY_ICONS[name.toLowerCase()] || "🍽️",
      count,
    }));

    // Sort by count (most items first)
    categoryList.sort((a, b) => b.count - a.count);

    setCategories(categoryList);
  }, [menuItems]);

  const allCategories: MenuCategory[] = [
    { name: "all", icon: "⭐", count: menuItems.length },
    ...categories,
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-2 mb-6">
      <div className="flex gap-3 px-4 min-w-max">
        {allCategories.map((category) => (
          <Button
            key={category.name}
            variant="ghost"
            onClick={() => onSelectCategory(category.name)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[80px] h-auto transition-all duration-200",
              "hover:scale-105",
              selectedCategory === category.name
                ? "bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-lg shadow-primary/20 scale-105"
                : "border border-border hover:border-primary/50"
            )}
          >
            <span className="text-3xl">{category.icon}</span>
            <div className="flex flex-col items-center gap-0.5">
              <span className={cn(
                "text-xs font-medium whitespace-nowrap capitalize",
                selectedCategory === category.name
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}>
                {category.name === "all" ? "All" : category.name}
              </span>
              <span className={cn(
                "text-[10px]",
                selectedCategory === category.name
                  ? "text-primary/70"
                  : "text-muted-foreground/60"
              )}>
                {category.count} items
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
