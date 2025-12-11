import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PendingAction {
  id: string;
  action: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

const STORAGE_KEY = 'lyn_offline_queue';
const CACHE_KEY = 'lyn_offline_cache';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load pending actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }
  }, []);

  // Save pending actions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing pending changes...",
      });
      // Auto-sync when back online
      await syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Changes will be saved locally and synced when online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, pendingActions]);

  // Sync pending actions when online
  const syncPendingActions = useCallback(async () => {
    if (!navigator.onLine || pendingActions.length === 0) return;
    
    setIsSyncing(true);
    const actionsToSync = [...pendingActions];
    const failedActions: PendingAction[] = [];

    for (const action of actionsToSync) {
      try {
        if (action.action === 'insert') {
          await supabase.from(action.table as any).insert(action.data);
        } else if (action.action === 'update') {
          await supabase.from(action.table as any).update(action.data).eq('id', action.data.id);
        } else if (action.action === 'delete') {
          await supabase.from(action.table as any).delete().eq('id', action.data.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        failedActions.push(action);
      }
    }

    setPendingActions(failedActions);
    setIsSyncing(false);

    if (failedActions.length === 0 && actionsToSync.length > 0) {
      toast({
        title: "Sync Complete",
        description: `${actionsToSync.length} changes synced successfully.`,
      });
    } else if (failedActions.length > 0) {
      toast({
        title: "Sync Partial",
        description: `${failedActions.length} changes failed to sync.`,
        variant: "destructive",
      });
    }
  }, [pendingActions, toast]);

  // Queue an action for offline sync
  const queueAction = useCallback((action: 'insert' | 'update' | 'delete', table: string, data: any) => {
    const newAction: PendingAction = {
      id: crypto.randomUUID(),
      action,
      table,
      data,
      timestamp: Date.now(),
    };
    setPendingActions((prev) => [...prev, newAction]);
    return newAction.id;
  }, []);

  // Remove a synced action
  const removeAction = useCallback((id: string) => {
    setPendingActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Cache data for offline access
  const cacheData = useCallback((key: string, data: any) => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      cache[key] = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to cache data:', e);
    }
  }, []);

  // Get cached data
  const getCachedData = useCallback(function<T>(key: string, maxAge?: number): T | null {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const cached = cache[key];
      
      if (!cached) return null;
      
      if (maxAge && Date.now() - cached.timestamp > maxAge) {
        return null; // Cache expired
      }
      
      return cached.data as T;
    } catch (e) {
      console.error('Failed to get cached data:', e);
      return null;
    }
  }, []);

  // Clear all cached data
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setPendingActions([]);
  }, []);

  // Fetch with offline fallback
  const fetchWithCache = useCallback(async function<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    maxAge?: number
  ): Promise<{ data: T | null; fromCache: boolean }> {
    // If online, try to fetch fresh data
    if (navigator.onLine) {
      try {
        const data = await fetchFn();
        cacheData(cacheKey, data);
        return { data, fromCache: false };
      } catch (error) {
        console.error('Fetch failed, trying cache:', error);
        const cachedData = getCachedData<T>(cacheKey, maxAge);
        return { data: cachedData, fromCache: true };
      }
    }
    
    // If offline, return cached data
    const cachedData = getCachedData<T>(cacheKey, maxAge);
    return { data: cachedData, fromCache: true };
  }, [cacheData, getCachedData]);

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    queueAction,
    removeAction,
    cacheData,
    getCachedData,
    clearCache,
    fetchWithCache,
    syncPendingActions,
  };
};

export default useOfflineSync;
