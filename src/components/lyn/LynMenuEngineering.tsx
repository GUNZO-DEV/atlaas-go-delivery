import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Star, DollarSign, BarChart3, Edit2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost_price: number | null;
  popularity_score: number | null;
  category: string | null;
  is_available: boolean | null;
}

interface LynMenuEngineeringProps {
  restaurant: any;
}

const LynMenuEngineering = ({ restaurant }: LynMenuEngineeringProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [costPrice, setCostPrice] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadMenuItems();
  }, [restaurant.id]);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("popularity_score", { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfitMargin = (item: MenuItem) => {
    if (!item.cost_price || item.cost_price === 0) return null;
    return ((item.price - item.cost_price) / item.price) * 100;
  };

  const getItemCategory = (item: MenuItem) => {
    const margin = calculateProfitMargin(item);
    const popularity = item.popularity_score || 0;

    if (margin === null) return "unknown";
    
    // Menu Engineering Matrix
    if (margin >= 60 && popularity >= 50) return "star"; // High profit, high popularity
    if (margin >= 60 && popularity < 50) return "puzzle"; // High profit, low popularity
    if (margin < 60 && popularity >= 50) return "plow-horse"; // Low profit, high popularity
    return "dog"; // Low profit, low popularity
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "star":
        return <Badge className="bg-yellow-500">⭐ Star</Badge>;
      case "puzzle":
        return <Badge className="bg-blue-500">🧩 Puzzle</Badge>;
      case "plow-horse":
        return <Badge className="bg-green-500">🐴 Plow Horse</Badge>;
      case "dog":
        return <Badge className="bg-red-500">🐕 Dog</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleUpdateCostPrice = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ cost_price: parseFloat(costPrice) || 0 })
        .eq("id", editingItem.id);

      if (error) throw error;

      toast({ title: "Cost price updated successfully" });
      setEditingItem(null);
      loadMenuItems();
    } catch (error) {
      console.error("Error updating cost price:", error);
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const stats = {
    totalItems: menuItems.length,
    stars: menuItems.filter(i => getItemCategory(i) === "star").length,
    puzzles: menuItems.filter(i => getItemCategory(i) === "puzzle").length,
    plowHorses: menuItems.filter(i => getItemCategory(i) === "plow-horse").length,
    dogs: menuItems.filter(i => getItemCategory(i) === "dog").length,
    avgMargin: menuItems.reduce((acc, item) => {
      const margin = calculateProfitMargin(item);
      return margin !== null ? acc + margin : acc;
    }, 0) / menuItems.filter(i => calculateProfitMargin(i) !== null).length || 0,
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading menu analysis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.stars}</div>
            <div className="text-sm text-muted-foreground">⭐ Stars</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.puzzles}</div>
            <div className="text-sm text-muted-foreground">🧩 Puzzles</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.plowHorses}</div>
            <div className="text-sm text-muted-foreground">🐴 Plow Horses</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.dogs}</div>
            <div className="text-sm text-muted-foreground">🐕 Dogs</div>
          </CardContent>
        </Card>
      </div>

      {/* Average Margin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Average Profit Margin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              {stats.avgMargin.toFixed(1)}%
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(stats.avgMargin, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Target: 65-70% for optimal profitability
          </p>
        </CardContent>
      </Card>

      {/* Menu Matrix Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Engineering Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="font-semibold text-yellow-600">⭐ Stars</div>
              <p className="text-muted-foreground">High profit, high popularity. Keep promoting!</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="font-semibold text-blue-600">🧩 Puzzles</div>
              <p className="text-muted-foreground">High profit, low popularity. Needs marketing.</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="font-semibold text-green-600">🐴 Plow Horses</div>
              <p className="text-muted-foreground">Low profit, high popularity. Consider price increase.</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="font-semibold text-red-600">🐕 Dogs</div>
              <p className="text-muted-foreground">Low profit, low popularity. Consider removing.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Cost</th>
                  <th className="text-right p-2">Margin</th>
                  <th className="text-right p-2">Popularity</th>
                  <th className="text-center p-2">Classification</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => {
                  const margin = calculateProfitMargin(item);
                  const category = getItemCategory(item);
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="p-2 text-muted-foreground">{item.category || "-"}</td>
                      <td className="p-2 text-right">{item.price.toFixed(2)} DH</td>
                      <td className="p-2 text-right">
                        {item.cost_price ? `${item.cost_price.toFixed(2)} DH` : "-"}
                      </td>
                      <td className="p-2 text-right">
                        {margin !== null ? (
                          <span className={margin >= 60 ? "text-green-600" : "text-orange-600"}>
                            {margin.toFixed(1)}%
                          </span>
                        ) : "-"}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.popularity_score || 0}
                          {(item.popularity_score || 0) >= 50 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center">{getCategoryBadge(category)}</td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setCostPrice(item.cost_price?.toString() || "");
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Cost Price Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cost Price - {editingItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selling Price</Label>
              <Input value={`${editingItem?.price.toFixed(2)} DH`} disabled />
            </div>
            <div>
              <Label>Cost Price (DH)</Label>
              <Input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="Enter cost price"
              />
            </div>
            {costPrice && editingItem && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Calculated Margin</div>
                <div className="text-xl font-bold">
                  {(((editingItem.price - parseFloat(costPrice)) / editingItem.price) * 100).toFixed(1)}%
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleUpdateCostPrice} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LynMenuEngineering;