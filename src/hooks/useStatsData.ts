import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  ordersDelivered: number;
  totalUsers: number;
  avgRating: number;
  activeRiders: number;
  isLoading: boolean;
}

export const useStatsData = (): StatsData => {
  const [stats, setStats] = useState<StatsData>({
    ordersDelivered: 0,
    totalUsers: 0,
    avgRating: 4.8,
    activeRiders: 10,
    isLoading: true,
  });

  const fetchStats = async () => {
    try {
      // Fetch delivered orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      // Fetch AUIER completed orders
      const { count: auierCount } = await supabase
        .from('auier_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Fetch total users (profiles)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch average rating from reviews
      const { data: ratings } = await supabase
        .from('reviews')
        .select('restaurant_rating')
        .not('restaurant_rating', 'is', null);

      const avgRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + (r.restaurant_rating || 0), 0) / ratings.length
        : 4.8;

      // Fetch active riders
      const { count: ridersCount } = await supabase
        .from('rider_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('is_available', true);

      const totalOrders = (ordersCount || 0) + (auierCount || 0);

      setStats({
        ordersDelivered: Math.max(totalOrders, 50), // Minimum display value
        totalUsers: Math.max(usersCount || 0, 100),
        avgRating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : 4.8,
        activeRiders: Math.max(ridersCount || 0, 10),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time updates for orders
    const channel = supabase
      .channel('stats-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auier_orders' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
};
