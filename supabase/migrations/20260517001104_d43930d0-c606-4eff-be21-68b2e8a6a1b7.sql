-- Drop overly permissive blanket SELECT policy on menu_items
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;

-- Restrict access to internal cost_price column for non-merchants
REVOKE SELECT (cost_price) ON public.menu_items FROM anon, authenticated;