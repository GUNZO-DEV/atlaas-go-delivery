-- Fix Critical Security Issues

-- 1. Fix profiles table - restrict to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- 2. Fix group orders access control bug
DROP POLICY IF EXISTS "Users can view their group orders" ON group_orders;

CREATE POLICY "Users can view their group orders" ON group_orders
  FOR SELECT 
  USING (
    host_user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM group_order_participants 
      WHERE group_order_participants.group_order_id = group_orders.id 
      AND group_order_participants.user_id = auth.uid()
    )
  );

-- 3. Add role-based RLS policies for merchant/rider operations

-- Restaurants table - only merchants can manage
DROP POLICY IF EXISTS "Merchants can manage their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view restaurants" ON restaurants;

CREATE POLICY "Public can view restaurants" ON restaurants
  FOR SELECT
  USING (true);

CREATE POLICY "Merchants can insert restaurants" ON restaurants
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'merchant') AND merchant_id = auth.uid());

CREATE POLICY "Merchants can update own restaurants" ON restaurants
  FOR UPDATE
  USING (has_role(auth.uid(), 'merchant') AND merchant_id = auth.uid());

CREATE POLICY "Merchants can delete own restaurants" ON restaurants
  FOR DELETE
  USING (has_role(auth.uid(), 'merchant') AND merchant_id = auth.uid());

-- Menu items - only merchants can manage
DROP POLICY IF EXISTS "Merchants can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;

CREATE POLICY "Public can view menu items" ON menu_items
  FOR SELECT
  USING (true);

CREATE POLICY "Merchants can insert menu items" ON menu_items
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'merchant') 
    AND EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.merchant_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can update own menu items" ON menu_items
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'merchant')
    AND EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.merchant_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can delete own menu items" ON menu_items
  FOR DELETE
  USING (
    has_role(auth.uid(), 'merchant')
    AND EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.merchant_id = auth.uid()
    )
  );

-- 4. Secure storage bucket for menu items
DROP POLICY IF EXISTS "Public can view menu items" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can upload menu items" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete menu items" ON storage.objects;
DROP POLICY IF EXISTS "Public can view menu item images" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can upload menu item images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update their menu item images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their menu item images" ON storage.objects;

CREATE POLICY "Public can view menu item images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-items');

CREATE POLICY "Merchants can upload menu item images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-items' 
    AND has_role(auth.uid(), 'merchant')
  );

CREATE POLICY "Owners can update their menu item images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'menu-items' 
    AND auth.uid() = owner
  );

CREATE POLICY "Owners can delete their menu item images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'menu-items' 
    AND auth.uid() = owner
  );