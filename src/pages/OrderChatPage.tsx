import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, User, Bike } from "lucide-react";
import OrderChat from "@/components/OrderChat";

export default function OrderChatPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [userType, setUserType] = useState<'customer' | 'rider'>('rider');
  const [otherParty, setOtherParty] = useState<{ name: string; type: string } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderAndRole();
  }, [orderId]);

  const fetchOrderAndRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const { data: order } = await supabase
      .from("orders")
      .select("id, status, delivery_address, total_amount, created_at, customer_id, rider_id, restaurant:restaurants(name)")
      .eq("id", orderId!)
      .single();

    if (order) {
      setOrderInfo(order);
      const isRider = order.rider_id === user.id;
      setUserType(isRider ? 'rider' : 'customer');

      // Fetch the other party's profile name
      const otherUserId = isRider ? order.customer_id : order.rider_id;
      if (otherUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", otherUserId)
          .single();
        setOtherParty({
          name: profile?.full_name || (isRider ? 'Customer' : 'Rider'),
          type: isRider ? 'customer' : 'rider',
        });
      }
    }
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: '⏳ Pending' },
    confirmed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: '✓ Confirmed' },
    preparing: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: '👨‍🍳 Preparing' },
    ready_for_pickup: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: '📦 Ready' },
    picked_up: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: '🏍️ Picked Up' },
    delivering: { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400', label: '🚀 On the Way' },
    delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: '✅ Delivered' },
  };

  const status = orderInfo?.status ? statusConfig[orderInfo.status] : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3 px-3 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9 text-primary-foreground hover:bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            {otherParty?.type === 'rider' ? (
              <Bike className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold truncate">
              {otherParty?.name || orderInfo?.restaurant?.name || 'Order Chat'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {status && (
                <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 ${status.color}`}>
                  {status.label}
                </Badge>
              )}
              <span className="text-[10px] text-primary-foreground/60">
                #{orderId?.slice(0, 8)}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold">{orderInfo?.total_amount?.toFixed(0)} MAD</p>
          </div>
        </div>

        {/* Delivery address bar */}
        {orderInfo?.delivery_address && (
          <div className="px-4 pb-2.5 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary-foreground/50 flex-shrink-0" />
            <p className="text-[11px] text-primary-foreground/70 truncate">
              {orderInfo.delivery_address}
            </p>
          </div>
        )}
      </div>

      {/* Chat */}
      {orderId && (
        <OrderChat orderId={orderId} userType={userType} fullPage />
      )}
    </div>
  );
}
