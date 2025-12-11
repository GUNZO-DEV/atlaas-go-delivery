import { cn } from "@/lib/utils";
import { Users, Clock, DollarSign, UtensilsCrossed, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, differenceInMinutes } from "date-fns";

interface LynTableCardProps {
  table: {
    id: string;
    table_number: string;
    capacity: number;
    status: string;
    shape: string;
    position_x: number;
    position_y: number;
    current_order_id?: string;
  };
  order?: {
    id: string;
    total: number;
    guests_count: number;
    kitchen_status: string;
    created_at: string;
    items: any[];
  };
  onClick: () => void;
  isSelected?: boolean;
}

const statusColors: Record<string, string> = {
  available: "bg-emerald-500/20 border-emerald-500 text-emerald-700",
  occupied: "bg-orange-500/20 border-orange-500 text-orange-700",
  reserved: "bg-blue-500/20 border-blue-500 text-blue-700",
  cleaning: "bg-yellow-500/20 border-yellow-500 text-yellow-700",
};

const kitchenStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3 text-yellow-600" />,
  preparing: <UtensilsCrossed className="h-3 w-3 text-orange-600 animate-pulse" />,
  ready: <CheckCircle className="h-3 w-3 text-green-600" />,
  served: <CheckCircle className="h-3 w-3 text-emerald-600" />,
};

const LynTableCard = ({ table, order, onClick, isSelected }: LynTableCardProps) => {
  const getWaitTime = () => {
    if (!order) return null;
    const minutes = differenceInMinutes(new Date(), new Date(order.created_at));
    return minutes;
  };

  const waitTime = getWaitTime();
  const isLongWait = waitTime && waitTime > 20;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-3 border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
        table.shape === "round" ? "rounded-full" : table.shape === "rectangle" ? "rounded-lg aspect-[2/1]" : "rounded-lg aspect-square",
        statusColors[table.status] || statusColors.available,
        isSelected && "ring-2 ring-primary ring-offset-2",
        table.status === "occupied" && isLongWait && "animate-pulse"
      )}
      style={{
        width: table.shape === "rectangle" ? "140px" : "90px",
        height: table.shape === "rectangle" ? "70px" : "90px",
      }}
    >
      {/* Table Number */}
      <div className="font-bold text-lg">{table.table_number}</div>
      
      {/* Capacity */}
      <div className="flex items-center justify-center gap-1 text-xs">
        <Users className="h-3 w-3" />
        {order ? order.guests_count : 0}/{table.capacity}
      </div>

      {/* Order Info (when occupied) */}
      {table.status === "occupied" && order && (
        <div className="absolute -bottom-1 -right-1 flex gap-1">
          {/* Kitchen Status */}
          <Badge 
            variant="secondary" 
            className="h-5 px-1 text-[10px] flex items-center gap-0.5"
          >
            {kitchenStatusIcons[order.kitchen_status]}
          </Badge>
          
          {/* Wait Time Warning */}
          {isLongWait && (
            <Badge variant="destructive" className="h-5 px-1 text-[10px]">
              {waitTime}m
            </Badge>
          )}
        </div>
      )}

      {/* Total */}
      {table.status === "occupied" && order && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
          {order.total.toFixed(0)}
        </div>
      )}

      {/* Reserved indicator */}
      {table.status === "reserved" && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className="text-[9px] bg-background">
            Reserved
          </Badge>
        </div>
      )}
    </button>
  );
};

export default LynTableCard;
