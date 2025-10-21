-- Fix security issue: Set search_path for the function
CREATE OR REPLACE FUNCTION update_rider_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rider profile stats when order is delivered
  IF NEW.status = 'delivered' AND NEW.rider_id IS NOT NULL THEN
    -- Update total deliveries count
    UPDATE rider_profiles 
    SET 
      total_deliveries = (
        SELECT COUNT(*) 
        FROM orders 
        WHERE rider_id = NEW.rider_id AND status = 'delivered'
      ),
      updated_at = now()
    WHERE rider_id = NEW.rider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;