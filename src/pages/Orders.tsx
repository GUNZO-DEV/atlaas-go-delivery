import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { 
  Search, 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  special_instructions: string | null;
  menu_item: {
    name: string;
    image_url: string | null;
  } | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  created_at: string;
  restaurant: {
    name: string;
    image_url: string | null;
  } | null;
  order_items: OrderItem[];
}

type FilterStatus = 'all' | 'active' | 'completed' | 'cancelled';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Package },
  preparing: { label: 'Preparing', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: Package },
  ready_for_pickup: { label: 'Ready', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Package },
  picked_up: { label: 'Picked Up', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', icon: Package },
  picking_it_up: { label: 'Picking Up', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', icon: Package },
  delivering: { label: 'On the Way', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', icon: Package },
  delivered: { label: 'Delivered', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
};

const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'picking_it_up', 'delivering'];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpand = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  const fetchOrders = async () => {
    if (!userId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        delivery_fee,
        delivery_address,
        created_at,
        restaurant:restaurants(name, image_url),
        order_items(
          id,
          quantity,
          price,
          special_instructions,
          menu_item:menu_items(name, image_url)
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load orders');
    } else {
      setOrders((data as unknown as Order[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  // Filter orders based on status and search
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filter === 'active' && !activeStatuses.includes(order.status)) return false;
    if (filter === 'completed' && order.status !== 'delivered') return false;
    if (filter === 'cancelled' && order.status !== 'cancelled') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const restaurantName = order.restaurant?.name?.toLowerCase() || '';
      const address = order.delivery_address.toLowerCase();
      const orderId = order.id.toLowerCase();
      
      return restaurantName.includes(query) || address.includes(query) || orderId.includes(query);
    }

    return true;
  });

  const counts = {
    all: orders.length,
    active: orders.filter(o => activeStatuses.includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || { label: status, color: 'bg-muted text-muted-foreground', icon: Package };
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5" />
                My Orders
              </h1>
              <p className="text-sm text-muted-foreground">
                {counts.all} total orders
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by restaurant, address, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">
                Active ({counts.active})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Done ({counts.completed})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs">
                Cancelled ({counts.cancelled})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No orders found' : filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery 
                ? 'Try a different search term'
                : 'Your orders will appear here once you place one'
              }
            </p>
            {!searchQuery && filter === 'all' && (
              <Button onClick={() => navigate('/restaurants')}>
                Browse Restaurants
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const isActive = activeStatuses.includes(order.status);
              const isExpanded = expandedOrders.has(order.id);
              const itemCount = order.order_items?.length || 0;
              
              return (
                <Card 
                  key={order.id}
                  className={cn(
                    "transition-all overflow-hidden",
                    isActive && "border-primary/30"
                  )}
                >
                  <Collapsible open={isExpanded}>
                    {/* Main Order Header */}
                    <div className="p-4">
                      <div className="flex gap-3">
                        {/* Restaurant Image */}
                        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                          {order.restaurant?.image_url ? (
                            <img 
                              src={order.restaurant.image_url} 
                              alt={order.restaurant.name || 'Restaurant'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-sm line-clamp-1">
                                {order.restaurant?.name || 'Unknown Restaurant'}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={cn("mt-1 text-[10px] h-5", statusInfo.color)}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="line-clamp-1">{order.delivery_address}</span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </span>
                            <span className="font-semibold text-sm">
                              {(order.total_amount + order.delivery_fee).toFixed(2)} MAD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => toggleExpand(order.id, e)}
                          >
                            <ChevronDown className={cn(
                              "w-4 h-4 mr-1 transition-transform",
                              isExpanded && "rotate-180"
                            )} />
                            {isExpanded ? 'Hide' : 'View'} {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </Button>
                        </CollapsibleTrigger>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => navigate(`/track/${order.id}`)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {isActive ? 'Track Order' : 'View Details'}
                        </Button>
                      </div>

                      {/* Active Order Indicator */}
                      {isActive && (
                        <div className="flex items-center gap-2 text-xs text-primary mt-3">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="font-medium">Order in progress</span>
                        </div>
                      )}
                    </div>

                    {/* Expandable Order Items */}
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                {/* Item Image */}
                                <div className="w-10 h-10 rounded-md bg-background overflow-hidden shrink-0">
                                  {item.menu_item?.image_url ? (
                                    <img 
                                      src={item.menu_item.image_url} 
                                      alt={item.menu_item.name || 'Item'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Item Details */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-1">
                                    {item.menu_item?.name || 'Unknown Item'}
                                  </p>
                                  {item.special_instructions && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      Note: {item.special_instructions}
                                    </p>
                                  )}
                                </div>

                                {/* Quantity & Price */}
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-medium">{item.price.toFixed(2)} MAD</p>
                                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              No items found
                            </p>
                          )}

                          {/* Order Summary */}
                          <div className="pt-2 mt-2 border-t border-border/50 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Subtotal</span>
                              <span>{order.total_amount.toFixed(2)} MAD</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Delivery Fee</span>
                              <span>{order.delivery_fee.toFixed(2)} MAD</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold pt-1">
                              <span>Total</span>
                              <span>{(order.total_amount + order.delivery_fee).toFixed(2)} MAD</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
