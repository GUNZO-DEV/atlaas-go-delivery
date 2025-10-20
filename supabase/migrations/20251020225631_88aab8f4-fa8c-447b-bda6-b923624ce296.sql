-- Add new status to order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'picking_it_up';

-- Note: The order will be: pending → confirmed → preparing → ready_for_pickup → picking_it_up → picked_up → delivered