-- Add account status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'blocked'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Update RLS policy for orders - prevent blocked users from creating orders
CREATE POLICY "Blocked users cannot create orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND account_status = 'active'
  )
);