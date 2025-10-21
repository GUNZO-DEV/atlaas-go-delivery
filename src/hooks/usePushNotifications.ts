import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = 'BMxZ8f5qNqB9YhJ_Ys3mG4kL7pQrV2wXz9A0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2zA3bC4dE5fG6hI7j';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          const existingSub = await registration.pushManager.getSubscription();
          if (existingSub) {
            setSubscription(existingSub);
            setIsSubscribed(true);
          }
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    };

    checkSupport();
  }, []);

  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to enable notifications');
        return false;
      }

      const subJSON = sub.toJSON();
      const { error } = await supabase.from('push_subscriptions').insert({
        user_id: user.id,
        endpoint: sub.endpoint,
        p256dh: subJSON.keys?.p256dh || '',
        auth: subJSON.keys?.auth || ''
      });

      if (error) throw error;

      setSubscription(sub);
      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
        
        setSubscription(null);
        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Failed to disable notifications');
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
