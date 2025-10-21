import { supabase } from '@/integrations/supabase/client';

interface DeliveryFactors {
  distanceKm: number;
  restaurantId: string;
  dayOfWeek: number;
  hourOfDay: number;
}

export class DeliveryEstimator {
  private static BASE_PREP_TIME = 15; // Base restaurant prep time in minutes
  private static KM_PER_MINUTE = 0.5; // Average speed in km/min

  /**
   * Calculates estimated delivery time using ML-based historical data
   */
  static async estimateDeliveryTime(factors: DeliveryFactors): Promise<number> {
    const { distanceKm, restaurantId, dayOfWeek, hourOfDay } = factors;

    try {
      // Fetch historical data for similar conditions
      const { data: metrics, error } = await supabase
        .from('delivery_metrics')
        .select('estimated_minutes, actual_minutes')
        .eq('restaurant_id', restaurantId)
        .eq('day_of_week', dayOfWeek)
        .gte('hour_of_day', hourOfDay - 2)
        .lte('hour_of_day', hourOfDay + 2)
        .not('actual_minutes', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      let estimate = this.calculateBaseEstimate(distanceKm);

      // Apply ML adjustments if we have historical data
      if (metrics && metrics.length > 0) {
        const accuracyFactor = this.calculateAccuracyFactor(metrics);
        estimate = Math.round(estimate * accuracyFactor);

        // Time of day adjustment
        const timeAdjustment = this.getTimeOfDayAdjustment(hourOfDay);
        estimate = Math.round(estimate * timeAdjustment);

        // Day of week adjustment
        const dayAdjustment = this.getDayOfWeekAdjustment(dayOfWeek);
        estimate = Math.round(estimate * dayAdjustment);
      }

      // Ensure reasonable bounds
      return Math.max(15, Math.min(90, estimate));
    } catch (error) {
      console.error('Error calculating delivery estimate:', error);
      // Fallback to basic calculation
      return this.calculateBaseEstimate(distanceKm);
    }
  }

  /**
   * Calculate base estimate without ML
   */
  private static calculateBaseEstimate(distanceKm: number): number {
    const travelTime = Math.ceil(distanceKm / this.KM_PER_MINUTE);
    return this.BASE_PREP_TIME + travelTime;
  }

  /**
   * Calculate accuracy factor from historical data
   */
  private static calculateAccuracyFactor(metrics: any[]): number {
    const ratios = metrics
      .filter(m => m.estimated_minutes > 0 && m.actual_minutes > 0)
      .map(m => m.actual_minutes / m.estimated_minutes);

    if (ratios.length === 0) return 1.0;

    // Calculate weighted average (more recent = higher weight)
    const weights = ratios.map((_, i) => Math.exp(-i * 0.05));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = ratios.reduce((sum, ratio, i) => sum + ratio * weights[i], 0);

    return weightedSum / totalWeight;
  }

  /**
   * Adjust for time of day (rush hours = longer)
   */
  private static getTimeOfDayAdjustment(hour: number): number {
    // Lunch rush (12-14)
    if (hour >= 12 && hour <= 14) return 1.25;
    // Dinner rush (18-21)
    if (hour >= 18 && hour <= 21) return 1.35;
    // Late night (22-24, 0-6)
    if (hour >= 22 || hour <= 6) return 0.9;
    // Normal hours
    return 1.0;
  }

  /**
   * Adjust for day of week (weekends = longer)
   */
  private static getDayOfWeekAdjustment(day: number): number {
    // Friday (5), Saturday (6), Sunday (0)
    if (day === 0 || day === 5 || day === 6) return 1.15;
    return 1.0;
  }

  /**
   * Record actual delivery time for ML learning
   */
  static async recordDeliveryMetrics(
    orderId: string,
    restaurantId: string,
    distanceKm: number,
    estimatedMinutes: number,
    actualMinutes: number
  ): Promise<void> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hourOfDay = now.getHours();

    try {
      await supabase.from('delivery_metrics').insert({
        order_id: orderId,
        restaurant_id: restaurantId,
        distance_km: distanceKm,
        estimated_minutes: estimatedMinutes,
        actual_minutes: actualMinutes,
        day_of_week: dayOfWeek,
        hour_of_day: hourOfDay,
        completed_at: now.toISOString()
      });
    } catch (error) {
      console.error('Error recording delivery metrics:', error);
    }
  }

  /**
   * Get delivery accuracy stats for a restaurant
   */
  static async getAccuracyStats(restaurantId: string): Promise<{
    averageAccuracy: number;
    totalDeliveries: number;
    onTimePercentage: number;
  }> {
    try {
      const { data: metrics, error } = await supabase
        .from('delivery_metrics')
        .select('estimated_minutes, actual_minutes')
        .eq('restaurant_id', restaurantId)
        .not('actual_minutes', 'is', null)
        .limit(100);

      if (error) throw error;

      if (!metrics || metrics.length === 0) {
        return { averageAccuracy: 0, totalDeliveries: 0, onTimePercentage: 0 };
      }

      const accuracies = metrics.map(m => {
        const diff = Math.abs(m.actual_minutes - m.estimated_minutes);
        return diff <= 5 ? 1 : 0; // Within 5 minutes = accurate
      });

      const onTimePercentage = (accuracies.reduce((a, b) => a + b, 0) / accuracies.length) * 100;
      const avgActual = metrics.reduce((sum, m) => sum + m.actual_minutes, 0) / metrics.length;
      const avgEstimated = metrics.reduce((sum, m) => sum + m.estimated_minutes, 0) / metrics.length;
      const averageAccuracy = (avgEstimated / avgActual) * 100;

      return {
        averageAccuracy: Math.round(averageAccuracy),
        totalDeliveries: metrics.length,
        onTimePercentage: Math.round(onTimePercentage)
      };
    } catch (error) {
      console.error('Error getting accuracy stats:', error);
      return { averageAccuracy: 0, totalDeliveries: 0, onTimePercentage: 0 };
    }
  }
}
