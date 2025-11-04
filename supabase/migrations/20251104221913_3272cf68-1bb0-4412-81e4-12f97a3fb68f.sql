-- Add restaurant_id column to promotions for restaurant-specific promos
ALTER TABLE promotions ADD COLUMN restaurant_id uuid REFERENCES restaurants(id);

-- Add index for better query performance
CREATE INDEX idx_promotions_restaurant_id ON promotions(restaurant_id);

-- Update RLS policy to include restaurant-specific check
DROP POLICY IF EXISTS "Anyone can view active promotions" ON promotions;

CREATE POLICY "Anyone can view active promotions" 
ON promotions 
FOR SELECT 
USING (
  is_active = true 
  AND valid_until > now()
);