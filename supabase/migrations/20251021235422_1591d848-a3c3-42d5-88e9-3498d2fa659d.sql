-- Create function to update rider stats when order status changes to delivered
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS update_rider_stats_on_delivery ON orders;
CREATE TRIGGER update_rider_stats_on_delivery
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'delivered')
  EXECUTE FUNCTION update_rider_stats();

-- Backfill existing data for all riders
UPDATE rider_profiles rp
SET total_deliveries = (
  SELECT COUNT(*) 
  FROM orders o 
  WHERE o.rider_id = rp.rider_id AND o.status = 'delivered'
)
WHERE EXISTS (
  SELECT 1 FROM orders WHERE rider_id = rp.rider_id AND status = 'delivered'
);