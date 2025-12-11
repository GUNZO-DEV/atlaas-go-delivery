import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PendingAction {
  id: string;
  action: string;
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
      setPendingActions(JSON.parse(stored));
    }
  }, []);

  // Save pending actions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing pending changes...",
      });
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
  }, [toast]);

  // Queue an action for offline sync
  const queueAction = useCallback((action: string, table: string, data: any) => {
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
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }, []);

  // Get cached data
  const getCachedData = useCallback((key: string, maxAge?: number) => {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const cached = cache[key];
    
    if (!cached) return null;
    
    if (maxAge && Date.now() - cached.timestamp > maxAge) {
      return null; // Cache expired
    }
    
    return cached.data;
  }, []);

  // Clear all cached data
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setPendingActions([]);
  }, []);

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
  };
};

export default useOfflineSync;