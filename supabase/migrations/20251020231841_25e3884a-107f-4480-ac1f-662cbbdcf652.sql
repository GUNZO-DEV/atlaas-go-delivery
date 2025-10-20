-- Add cash-out request tracking
CREATE TABLE IF NOT EXISTS payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  bank_details jsonb,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  rejection_reason text
);

-- Enable RLS
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Riders can view their own payout requests
CREATE POLICY "Riders can view their own payout requests"
ON payout_requests FOR SELECT
USING (auth.uid() = rider_id);

-- Riders can create payout requests
CREATE POLICY "Riders can create payout requests"
ON payout_requests FOR INSERT
WITH CHECK (auth.uid() = rider_id);

-- Create performance badges table
CREATE TABLE IF NOT EXISTS rider_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES auth.users(id),
  badge_type text NOT NULL CHECK (badge_type IN ('fast_delivery', 'customer_favorite', 'night_owl', 'weekend_warrior', 'streak_master', 'top_rated', 'eco_champion')),
  earned_at timestamptz DEFAULT now(),
  level integer DEFAULT 1,
  UNIQUE(rider_id, badge_type)
);

-- Enable RLS
ALTER TABLE rider_badges ENABLE ROW LEVEL SECURITY;

-- Riders can view their own badges
CREATE POLICY "Riders can view their own badges"
ON rider_badges FOR SELECT
USING (auth.uid() = rider_id);

-- Create emergency contacts table
CREATE TABLE IF NOT EXISTS rider_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(rider_id)
);

-- Enable RLS
ALTER TABLE rider_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Riders can manage their emergency contacts
CREATE POLICY "Riders can manage their emergency contacts"
ON rider_emergency_contacts FOR ALL
USING (auth.uid() = rider_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_rider_id ON payout_requests(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_badges_rider_id ON rider_badges(rider_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_rider_id ON rider_emergency_contacts(rider_id);