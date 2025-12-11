import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from './useOfflineSync';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing Lyn dashboard data with offline support
 */
export const useLynOfflineData = <T>(
  tableName: string,
  restaurantId: string,
  options?: {
    orderBy?: string;
    filters?: Record<string, any>;
    select?: string;
  }
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const { isOnline, cacheData, getCachedData, queueAction } = useOfflineSync();
  const { toast } = useToast();

  const cacheKey = `lyn_${tableName}_${restaurantId}`;

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Try cache first if offline
    if (!isOnline) {
      const cached = getCachedData<T[]>(cacheKey);
      if (cached) {
        setData(cached);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }

    try {
      let query = supabase
        .from(tableName as any)
        .select(options?.select || '*')
        .eq('restaurant_id', restaurantId);

      // Apply additional filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy);
      }

      const { data: fetchedData, error } = await query;

      if (error) throw error;

      setData((fetchedData as T[]) || []);
      setFromCache(false);
      
      // Cache for offline use
      cacheData(cacheKey, fetchedData);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      
      // Fall back to cache
      const cached = getCachedData<T[]>(cacheKey);
      if (cached) {
        setData(cached);
        setFromCache(true);
        toast({
          title: "Using Cached Data",
          description: "Showing saved data from last sync.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [tableName, restaurantId, isOnline, cacheKey, options?.orderBy, options?.filters, options?.select]);

  // Insert with offline support
  const insert = useCallback(async (newData: Partial<T> & { id?: string }) => {
    const dataWithId = {
      ...newData,
      id: newData.id || crypto.randomUUID(),
      restaurant_id: restaurantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isOnline) {
      const { error } = await supabase
        .from(tableName as any)
        .insert(dataWithId);
      
      if (error) throw error;
    } else {
      queueAction('insert', tableName, dataWithId);
      // Optimistically add to local state
      setData(prev => [...prev, dataWithId as T]);
      toast({
        title: "Saved Offline",
        description: "Changes will sync when back online.",
      });
    }

    await fetchData();
    return dataWithId;
  }, [tableName, restaurantId, isOnline, queueAction, fetchData]);

  // Update with offline support
  const update = useCallback(async (id: string, updates: Partial<T>) => {
    const dataWithTimestamp = {
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    };

    if (isOnline) {
      const { error } = await supabase
        .from(tableName as any)
        .update(dataWithTimestamp)
        .eq('id', id);
      
      if (error) throw error;
    } else {
      queueAction('update', tableName, dataWithTimestamp);
      // Optimistically update local state
      setData(prev => prev.map(item => 
        (item as any).id === id ? { ...item, ...dataWithTimestamp } : item
      ));
      toast({
        title: "Saved Offline",
        description: "Changes will sync when back online.",
      });
    }

    await fetchData();
  }, [tableName, isOnline, queueAction, fetchData]);

  // Delete with offline support
  const remove = useCallback(async (id: string) => {
    if (isOnline) {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      queueAction('delete', tableName, { id });
      // Optimistically remove from local state
      setData(prev => prev.filter(item => (item as any).id !== id));
      toast({
        title: "Deleted Offline",
        description: "Changes will sync when back online.",
      });
    }

    await fetchData();
  }, [tableName, isOnline, queueAction, fetchData]);

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId, fetchData]);

  return {
    data,
    loading,
    fromCache,
    isOnline,
    refetch: fetchData,
    insert,
    update,
    remove,
  };
};

export default useLynOfflineData;
