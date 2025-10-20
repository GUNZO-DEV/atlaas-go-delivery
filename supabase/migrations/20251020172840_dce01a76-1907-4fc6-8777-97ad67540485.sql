-- Create user_favorites table for saved restaurants
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.user_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can add their own favorites"
ON public.user_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON public.user_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Add rating fields to restaurants table for performance
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add estimated delivery time to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS estimated_delivery_time INTEGER DEFAULT 30;

-- Create function to update restaurant ratings
CREATE OR REPLACE FUNCTION public.update_restaurant_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.restaurants
  SET 
    average_rating = (
      SELECT COALESCE(AVG(restaurant_rating), 0)
      FROM public.reviews
      WHERE restaurant_id = NEW.restaurant_id
      AND restaurant_rating IS NOT NULL
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE restaurant_id = NEW.restaurant_id
      AND restaurant_rating IS NOT NULL
    )
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update ratings when review is added
DROP TRIGGER IF EXISTS update_restaurant_rating_trigger ON public.reviews;
CREATE TRIGGER update_restaurant_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_restaurant_rating();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_restaurant_id ON public.user_favorites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_average_rating ON public.restaurants(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON public.reviews(restaurant_id);