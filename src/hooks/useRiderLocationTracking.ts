import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRiderLocationTracking = (orderId: string | null, isActive: boolean) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId || !isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { error } = await supabase
                .from('delivery_tracking')
                .update({
                  current_latitude: position.coords.latitude,
                  current_longitude: position.coords.longitude,
                  updated_at: new Date().toISOString(),
                })
                .eq('order_id', orderId);

              if (error) {
                console.error('Error updating rider location:', error);
              }
            } catch (err) {
              console.error('Location update error:', err);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    };

    // Update location immediately
    updateLocation();

    // Then update every 5 seconds
    intervalRef.current = setInterval(updateLocation, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId, isActive]);
};
