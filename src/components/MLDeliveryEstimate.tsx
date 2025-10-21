import { useEffect, useState } from "react";
import { Clock, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeliveryEstimator } from "@/utils/deliveryEstimator";

interface MLDeliveryEstimateProps {
  restaurantId: string;
  distanceKm: number;
}

export default function MLDeliveryEstimate({ restaurantId, distanceKm }: MLDeliveryEstimateProps) {
  const [estimate, setEstimate] = useState<number>(0);
  const [stats, setStats] = useState<{
    averageAccuracy: number;
    totalDeliveries: number;
    onTimePercentage: number;
  } | null>(null);

  useEffect(() => {
    const calculateEstimate = async () => {
      const now = new Date();
      const estimated = await DeliveryEstimator.estimateDeliveryTime({
        distanceKm,
        restaurantId,
        dayOfWeek: now.getDay(),
        hourOfDay: now.getHours()
      });
      setEstimate(estimated);

      const accuracyStats = await DeliveryEstimator.getAccuracyStats(restaurantId);
      setStats(accuracyStats);
    };

    calculateEstimate();
  }, [restaurantId, distanceKm]);

  const getAccuracyColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          ML-Powered Delivery Estimate
        </CardTitle>
        <CardDescription>
          Based on historical data and current conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-background/50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-center mb-2">
            {estimate} minutes
          </div>
          <div className="text-sm text-center text-muted-foreground">
            Estimated delivery time
          </div>
        </div>

        {stats && stats.totalDeliveries > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Accuracy Rate</span>
              </div>
              <Badge variant="secondary" className={getAccuracyColor(stats.onTimePercentage)}>
                {stats.onTimePercentage}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Historical Deliveries</span>
              </div>
              <Badge variant="outline">
                {stats.totalDeliveries}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Our ML algorithm improves accuracy with each delivery
            </div>
          </div>
        )}

        {(!stats || stats.totalDeliveries === 0) && (
          <div className="text-sm text-muted-foreground text-center p-2 bg-muted/50 rounded">
            Building accuracy model... More deliveries = better predictions!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
