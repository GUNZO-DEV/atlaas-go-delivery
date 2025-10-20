-- Create payment method enum
CREATE TYPE payment_method_type AS ENUM ('cash', 'card', 'cih_pay', 'wallet');

-- Add payment_status column to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Update existing orders to have completed payment status if delivered
UPDATE orders 
SET payment_status = 'completed' 
WHERE status = 'delivered' AND payment_status = 'pending';

-- Add wallet balance to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund')),
  description text,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own wallet transactions"
ON wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);