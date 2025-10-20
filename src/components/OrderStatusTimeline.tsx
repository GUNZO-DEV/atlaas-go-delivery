import { CheckCircle, Clock, Package, Bike, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatusTimelineProps {
  currentStatus: string;
}

const statusSteps = [
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "ready_for_pickup", label: "Ready for Pickup", icon: Clock },
  { key: "picking_it_up", label: "Rider on the way", icon: Bike },
  { key: "picked_up", label: "Picked Up", icon: CheckCircle },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const OrderStatusTimeline = ({ currentStatus }: OrderStatusTimelineProps) => {
  const currentIndex = statusSteps.findIndex((step) => step.key === currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{
              width: `${currentIndex >= 0 ? (currentIndex / (statusSteps.length - 1)) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Status Steps */}
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              {/* Icon Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  isCompleted && "bg-primary text-primary-foreground animate-scale-in",
                  isActive && "bg-primary text-primary-foreground animate-pulse scale-110",
                  isPending && "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium text-center transition-all duration-300 max-w-[80px]",
                  (isActive || isCompleted) && "text-foreground",
                  isPending && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
