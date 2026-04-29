import { CheckCircle2, Clock, ChefHat, Package, Bike, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderStatusProgressProps {
  currentStatus: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", sub: "We've got it", icon: Clock },
  { key: "confirmed", label: "Confirmed", sub: "Restaurant accepted", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", sub: "Cooking now", icon: ChefHat },
  { key: "ready_for_pickup", label: "Ready", sub: "Awaiting rider", icon: Package },
  { key: "picking_it_up", label: "Picked Up", sub: "On the road", icon: Bike },
  { key: "delivered", label: "Delivered", sub: "Enjoy!", icon: MapPin },
];

// Map legacy/alt statuses to canonical step keys
const STATUS_MAP: Record<string, string> = {
  picked_up: "picking_it_up",
  out_for_delivery: "picking_it_up",
};

export default function OrderStatusProgress({ currentStatus }: OrderStatusProgressProps) {
  const normalized = STATUS_MAP[currentStatus] || currentStatus;
  const currentIndex = Math.max(
    0,
    statusSteps.findIndex((s) => s.key === normalized)
  );
  const progress = (currentIndex / (statusSteps.length - 1)) * 100;

  return (
    <div className="w-full py-4 md:py-6">
      {/* Desktop / tablet: horizontal */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute left-0 right-0 top-6 h-1.5 rounded-full bg-muted" />
          <motion.div
            className="absolute left-0 top-6 h-1.5 rounded-full bg-gradient-to-r from-primary via-primary to-primary-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ boxShadow: "0 0 16px hsl(var(--primary) / 0.6)" }}
          />

          <div className="relative flex justify-between">
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentIndex;
              const active = i === currentIndex;
              return (
                <div key={step.key} className="flex flex-col items-center max-w-[110px]">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: active ? 1.1 : done ? 1 : 0.92,
                    }}
                    className={cn(
                      "relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                      done
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card border-border text-muted-foreground"
                    )}
                    style={done ? { boxShadow: "0 8px 24px hsl(var(--primary) / 0.35)" } : undefined}
                  >
                    {active && (
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <p
                    className={cn(
                      "text-xs font-semibold mt-3 text-center",
                      done ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 text-center">{step.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <ol className="md:hidden relative pl-3">
        <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-muted rounded" />
        <motion.div
          className="absolute left-[22px] top-2 w-0.5 rounded bg-gradient-to-b from-primary to-primary-glow"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {statusSteps.map((step, i) => {
          const Icon = step.icon;
          const done = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.key} className="relative flex items-start gap-3 pb-5 last:pb-0">
              <div
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0",
                  done ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
                )}
                style={done ? { boxShadow: "0 6px 16px hsl(var(--primary) / 0.35)" } : undefined}
              >
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
                <Icon className="h-4 w-4" />
              </div>
              <div className="pt-1">
                <p className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
