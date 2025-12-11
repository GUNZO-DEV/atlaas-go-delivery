
-- Inventory items table for simple stock tracking
CREATE TABLE public.lyn_inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 10,
  unit TEXT NOT NULL DEFAULT 'units',
  cost_per_unit NUMERIC(10,2) DEFAULT 0,
  supplier_id UUID,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suppliers table
CREATE TABLE public.lyn_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for supplier in inventory
ALTER TABLE public.lyn_inventory_items
ADD CONSTRAINT lyn_inventory_items_supplier_fkey 
FOREIGN KEY (supplier_id) REFERENCES public.lyn_suppliers(id) ON DELETE SET NULL;

-- Expenses table
CREATE TABLE public.lyn_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Other',
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff table (for tracking, not login)
CREATE TABLE public.lyn_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff',
  phone TEXT,
  email TEXT,
  hourly_rate NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  hired_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff shifts table
CREATE TABLE public.lyn_staff_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.lyn_staff(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME,
  hours_worked NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff tasks table
CREATE TABLE public.lyn_staff_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.lyn_staff(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily closings table
CREATE TABLE public.lyn_daily_closings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  closing_date DATE NOT NULL,
  total_revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  cash_revenue NUMERIC(10,2) DEFAULT 0,
  card_revenue NUMERIC(10,2) DEFAULT 0,
  wallet_revenue NUMERIC(10,2) DEFAULT 0,
  total_expenses NUMERIC(10,2) DEFAULT 0,
  net_profit NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  closed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, closing_date)
);

-- Restaurant orders extended (for table/pickup tracking)
CREATE TABLE public.lyn_restaurant_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL DEFAULT 'dine_in', -- dine_in, delivery, pickup
  table_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  receipt_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer feedback table
CREATE TABLE public.lyn_customer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.lyn_restaurant_orders(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lyn_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_daily_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_customer_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Merchant can manage their restaurant data
CREATE POLICY "Merchants can manage inventory" ON public.lyn_inventory_items
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage suppliers" ON public.lyn_suppliers
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage expenses" ON public.lyn_expenses
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage staff" ON public.lyn_staff
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage shifts" ON public.lyn_staff_shifts
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage tasks" ON public.lyn_staff_tasks
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage daily closings" ON public.lyn_daily_closings
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage restaurant orders" ON public.lyn_restaurant_orders
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

CREATE POLICY "Merchants can manage feedback" ON public.lyn_customer_feedback
FOR ALL USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
);

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number(p_restaurant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_count INTEGER;
  receipt_num TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO today_count
  FROM lyn_restaurant_orders
  WHERE restaurant_id = p_restaurant_id
  AND DATE(created_at) = CURRENT_DATE;
  
  receipt_num := 'LYN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 4, '0');
  RETURN receipt_num;
END;
$$;

-- Trigger to auto-generate receipt number
CREATE OR REPLACE FUNCTION public.set_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number(NEW.restaurant_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_receipt_number
BEFORE INSERT ON public.lyn_restaurant_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_receipt_number();
