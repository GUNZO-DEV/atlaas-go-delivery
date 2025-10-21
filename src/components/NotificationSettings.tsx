import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationSettings() {
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get real-time updates about your orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isSubscribed 
            ? "You'll receive notifications when your order status changes"
            : "Enable notifications to get instant updates about your deliveries"
          }
        </p>
        <Button
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          variant={isSubscribed ? "outline" : "default"}
          className="w-full"
        >
          {isSubscribed ? (
            <>
              <BellOff className="mr-2 h-4 w-4" />
              Disable Notifications
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
