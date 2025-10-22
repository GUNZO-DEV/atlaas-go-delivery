import { CheckCircle, Clock, Package, Truck, Home } from "lucide-react";

interface OrderStatusProgressProps {
  currentStatus: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "ready_for_pickup", label: "Ready for Pickup", icon: Truck },
  { key: "picking_it_up", label: "Rider on the way", icon: Truck },
  { key: "picked_up", label: "Picked Up", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default function OrderStatusProgress({ currentStatus }: OrderStatusProgressProps) {
  const currentIndex = statusSteps.findIndex((step) => step.key === currentStatus);

  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-5 h-1 w-full bg-muted" />
        <div
          className="absolute left-0 top-5 h-1 bg-primary transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (statusSteps.length - 1)) * 100}%` }}
        />

        {/* Status Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-muted text-muted-foreground"
                    }
                    ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p
                  className={`
                    text-xs mt-2 text-center max-w-[80px]
                    ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground"}
                  `}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
