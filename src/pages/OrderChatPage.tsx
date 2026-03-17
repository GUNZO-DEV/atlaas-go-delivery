import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import OrderChat from "@/components/OrderChat";

export default function OrderChatPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [userType, setUserType] = useState<'customer' | 'rider'>('rider');

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
      setUserType(order.rider_id === user.id ? 'rider' : 'customer');
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    preparing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    ready_for_pickup: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    picked_up: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivering: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold truncate">
              {orderInfo?.restaurant?.name || 'Order Chat'}
            </h1>
            {orderInfo?.status && (
              <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[orderInfo.status] || 'bg-muted text-muted-foreground'}`}>
                {orderInfo.status.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
          {orderInfo?.delivery_address && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {orderInfo.delivery_address}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-semibold text-primary">{orderInfo?.total_amount?.toFixed(2)} MAD</p>
          <p className="text-[10px] text-muted-foreground">
            #{orderId?.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Chat */}
      {orderId && (
        <OrderChat orderId={orderId} userType={userType} fullPage />
      )}
    </div>
  );
}
