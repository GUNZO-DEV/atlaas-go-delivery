-- Create table for push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for delivery metrics (ML data)
CREATE TABLE IF NOT EXISTS public.delivery_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  distance_km DECIMAL(10, 2),
  estimated_minutes INTEGER NOT NULL,
  actual_minutes INTEGER,
  day_of_week INTEGER NOT NULL,
  hour_of_day INTEGER NOT NULL,
  weather_condition TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (read-only for system analysis)
CREATE POLICY "Service can manage delivery metrics"
ON public.delivery_metrics
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_delivery_metrics_restaurant ON public.delivery_metrics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_metrics_completed ON public.delivery_metrics(completed_at);
CREATE INDEX IF NOT EXISTS idx_delivery_metrics_day_hour ON public.delivery_metrics(day_of_week, hour_of_day);