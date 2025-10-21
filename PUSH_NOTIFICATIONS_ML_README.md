# Push Notifications & ML Delivery Estimation

## Features Overview

### 1. Push Notifications (Web Push API)
Real-time order status updates delivered directly to users' devices.

#### How It Works:
- **Service Worker**: Listens for push notifications in the background (`public/service-worker.js`)
- **Subscription Management**: Users can enable/disable notifications via Settings
- **Database Storage**: Push subscriptions stored in `push_subscriptions` table
- **Edge Function**: `send-push-notification` handles sending notifications

#### Implementation:
```typescript
import { usePushNotifications } from "@/hooks/usePushNotifications";

const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
```

#### User Flow:
1. User navigates to Settings page
2. Clicks "Enable Notifications"
3. Browser requests permission
4. Upon approval, subscription is saved to database
5. Notifications are sent when order status changes

#### Component:
- `NotificationSettings.tsx` - Settings UI for managing notifications
- Located in Customer Settings page (`/settings`)

---

### 2. ML-Based Delivery Time Estimation

Machine learning algorithm that improves delivery time accuracy based on historical data.

#### Key Features:
- **Historical Analysis**: Learns from past deliveries
- **Time-Based Adjustments**: Accounts for rush hours (lunch 12-14, dinner 18-21)
- **Day-Based Adjustments**: Weekends have 15% longer estimates
- **Restaurant-Specific**: Each restaurant has unique accuracy profile
- **Real-Time Learning**: Every completed delivery improves future predictions

#### Factors Considered:
- Distance in kilometers
- Restaurant ID (historical performance)
- Day of week
- Hour of day
- Past delivery times (weighted by recency)

#### Algorithm:
```typescript
// Base calculation
estimate = PREP_TIME + (distance / speed)

// Apply ML adjustments
accuracyFactor = calculateFromHistoricalData()
estimate *= accuracyFactor

// Time of day adjustment (rush hours = +25-35%)
estimate *= timeOfDayAdjustment()

// Day of week adjustment (weekends = +15%)
estimate *= dayOfWeekAdjustment()
```

#### Database Schema:
```sql
CREATE TABLE delivery_metrics (
  order_id UUID,
  restaurant_id UUID,
  distance_km DECIMAL,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  day_of_week INTEGER,
  hour_of_day INTEGER,
  completed_at TIMESTAMP
);
```

#### Usage:
```typescript
import { DeliveryEstimator } from "@/utils/deliveryEstimator";

// Get estimate
const estimate = await DeliveryEstimator.estimateDeliveryTime({
  distanceKm: 5.2,
  restaurantId: "uuid",
  dayOfWeek: 5, // Friday
  hourOfDay: 19 // 7 PM
});

// Record actual delivery time
await DeliveryEstimator.recordDeliveryMetrics(
  orderId,
  restaurantId,
  distanceKm,
  estimatedMinutes,
  actualMinutes
);

// Get accuracy stats
const stats = await DeliveryEstimator.getAccuracyStats(restaurantId);
// Returns: { averageAccuracy, totalDeliveries, onTimePercentage }
```

#### Component:
```tsx
<MLDeliveryEstimate 
  restaurantId={restaurantId}
  distanceKm={5.2}
/>
```

#### Accuracy Metrics:
- **On-Time Percentage**: Deliveries within 5 minutes of estimate
- **Average Accuracy**: Ratio of estimated vs actual times
- **Total Deliveries**: Historical data points used

---

## Integration Points

### For Order Status Updates:
When order status changes, trigger push notification:

```typescript
// In your order update logic
await supabase.functions.invoke('send-push-notification', {
  body: {
    userId: customerId,
    title: 'Order Update',
    body: `Your order is now ${newStatus}`,
    url: `/track/${orderId}`,
    tag: orderId
  }
});
```

### For Tracking Delivery Accuracy:
When delivery completes, record metrics:

```typescript
await DeliveryEstimator.recordDeliveryMetrics(
  orderId,
  restaurantId,
  distanceKm,
  estimatedMinutes,
  actualMinutes
);
```

---

## Future Enhancements

### Push Notifications:
- [ ] Custom notification sounds
- [ ] Rich notifications with images
- [ ] Notification preferences (which events to notify)
- [ ] Silent notifications for background updates

### ML Delivery Estimation:
- [ ] Weather integration (rain/snow = longer delivery)
- [ ] Traffic API integration
- [ ] Rider capacity/availability factor
- [ ] Special events detection (holidays, sports events)
- [ ] Neural network for complex pattern recognition

---

## Security Considerations

### Push Notifications:
- VAPID keys should be generated and stored as Supabase secrets
- Subscriptions tied to authenticated users only
- RLS policies prevent unauthorized access to subscriptions

### ML Data:
- Delivery metrics accessible only through secure functions
- No personal data stored in metrics table
- Aggregated analytics only

---

## Testing

### Push Notifications:
1. Enable notifications in Settings
2. Verify subscription saved to database
3. Trigger test notification via edge function
4. Confirm notification appears on device

### ML Estimation:
1. Create test deliveries with known times
2. Verify metrics recorded in `delivery_metrics` table
3. Request estimate and compare to baseline
4. Add more deliveries and verify improvement

---

## Browser Support

### Push Notifications:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari 16+ (macOS, iOS)
- ❌ Safari < 16
- ❌ Opera Mini

### Service Workers:
- Required for push notifications
- Automatically registered at `/service-worker.js`

---

## Production Setup

### Required:
1. Generate VAPID keys for push notifications
2. Configure keys as Supabase secrets
3. Update `VAPID_PUBLIC_KEY` in `usePushNotifications.ts`
4. Implement actual web-push library in edge function
5. Set up monitoring for notification delivery

### Recommended:
- Set up analytics for notification engagement
- Monitor ML prediction accuracy
- Regular cleanup of old delivery metrics
- A/B test different estimation algorithms
