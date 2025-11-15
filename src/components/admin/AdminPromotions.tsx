import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Calendar, TrendingUp, Plus } from "lucide-react";
import { CreatePromotionDialog } from "./CreatePromotionDialog";

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  usage_count: number;
  usage_limit: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  restaurants: {
    name: string;
  } | null;
}

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select(`
          *,
          restaurants(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading promotions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Promotions Overview</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Promotion
        </Button>
      </div>

      <div className="grid gap-6">
        {promotions.map((promo) => (
          <Card key={promo.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {promo.code}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {promo.restaurants?.name || "All Restaurants"}
                  </p>
                </div>
                <Badge variant={promo.is_active ? "default" : "secondary"}>
                  {promo.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{promo.description}</p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Discount</p>
                  <p className="text-lg font-bold text-primary">
                    {promo.discount_type === "percentage"
                      ? `${promo.discount_value}%`
                      : `${promo.discount_value} MAD`}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Min Order</p>
                  <p className="text-lg font-bold">{promo.min_order_amount} MAD</p>
                </div>
                <div className="space-y-1 flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Usage</p>
                    <p className="text-lg font-bold">
                      {promo.usage_count} / {promo.usage_limit || "∞"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(promo.valid_from).toLocaleDateString()} -{" "}
                  {new Date(promo.valid_until).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {promotions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No promotions found
            </CardContent>
          </Card>
        )}
      </div>

      <CreatePromotionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchPromotions}
      />
    </div>
  );
};

export default AdminPromotions;
