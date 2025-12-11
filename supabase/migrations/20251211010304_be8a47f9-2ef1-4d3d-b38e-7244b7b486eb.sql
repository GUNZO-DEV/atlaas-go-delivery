-- LYN Restaurant Enterprise Tables

-- Reservations table
CREATE TABLE public.lyn_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES public.lyn_tables(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  no_show BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer loyalty profiles
CREATE TABLE public.lyn_customer_loyalty (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  tags TEXT[] DEFAULT '{}',
  loyalty_points INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  allergies TEXT,
  preferences TEXT,
  birthday DATE,
  is_vip BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, customer_phone)
);

-- Staff announcements and messaging
CREATE TABLE public.lyn_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  author_id UUID,
  author_name TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement',
  priority TEXT DEFAULT 'normal',
  target_role TEXT,
  is_pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incident and complaint logbook
CREATE TABLE public.lyn_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  reported_by TEXT,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Operations checklists
CREATE TABLE public.lyn_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Checklist completions
CREATE TABLE public.lyn_checklist_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES public.lyn_checklists(id) ON DELETE CASCADE,
  completed_by TEXT NOT NULL,
  completion_date DATE NOT NULL,
  items_completed JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu item costs for profit calculation
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;

-- Staff performance tracking on orders
ALTER TABLE public.lyn_restaurant_orders ADD COLUMN IF NOT EXISTS created_by_staff TEXT;
ALTER TABLE public.lyn_restaurant_orders ADD COLUMN IF NOT EXISTS served_by_staff TEXT;
ALTER TABLE public.lyn_restaurant_orders ADD COLUMN IF NOT EXISTS closed_by_staff TEXT;

-- Enable RLS
ALTER TABLE public.lyn_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyn_checklist_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Merchants can manage reservations" ON public.lyn_reservations
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = lyn_reservations.restaurant_id AND restaurants.merchant_id = auth.uid()));

CREATE POLICY "Merchants can manage customer loyalty" ON public.lyn_customer_loyalty
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = lyn_customer_loyalty.restaurant_id AND restaurants.merchant_id = auth.uid()));

CREATE POLICY "Merchants can manage announcements" ON public.lyn_announcements
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = lyn_announcements.restaurant_id AND restaurants.merchant_id = auth.uid()));

CREATE POLICY "Merchants can manage incidents" ON public.lyn_incidents
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = lyn_incidents.restaurant_id AND restaurants.merchant_id = auth.uid()));

CREATE POLICY "Merchants can manage checklists" ON public.lyn_checklists
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = lyn_checklists.restaurant_id AND restaurants.merchant_id = auth.uid()));

CREATE POLICY "Merchants can manage checklist completions" ON public.lyn_checklist_completions
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = lyn_checklist_completions.restaurant_id AND restaurants.merchant_id = auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lyn_reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lyn_announcements;