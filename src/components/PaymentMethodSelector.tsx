import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, CreditCard, Banknote, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  orderTotal?: number;
}

const PaymentMethodSelector = ({ value, onChange, orderTotal = 0 }: PaymentMethodSelectorProps) => {
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setWalletBalance(data?.wallet_balance || 0);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const paymentMethods = [
    {
      id: "cash",
      name: "Cash on Delivery",
      icon: Banknote,
      description: "Pay with cash when your order arrives",
      color: "text-green-600",
      available: true,
    },
    {
      id: "card",
      name: "Card on Delivery",
      icon: CreditCard,
      description: "Pay with card when your order arrives",
      color: "text-blue-600",
      available: true,
    },
    {
      id: "cih_pay",
      name: "CIH Pay",
      icon: Smartphone,
      description: "Pay instantly with CIH mobile banking",
      color: "text-orange-600",
      available: true,
    },
    {
      id: "wallet",
      name: "ATLAAS Wallet",
      icon: Wallet,
      description: `Balance: ${walletBalance.toFixed(2)} MAD`,
      color: "text-purple-600",
      available: walletBalance >= orderTotal,
    },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Payment Method</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                value === method.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : method.available
                  ? "hover:bg-accent"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => method.available && onChange(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    disabled={!method.available}
                    className="mt-1"
                  />
                  <Icon className={`h-6 w-6 mt-0.5 ${method.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label
                        htmlFor={method.id}
                        className={`font-semibold cursor-pointer ${
                          !method.available ? "text-muted-foreground" : ""
                        }`}
                      >
                        {method.name}
                      </Label>
                      {method.id === "cih_pay" && (
                        <Badge variant="secondary" className="text-xs">
                          Instant
                        </Badge>
                      )}
                      {!method.available && method.id === "wallet" && (
                        <Badge variant="destructive" className="text-xs">
                          Insufficient Balance
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
      {value === "wallet" && walletBalance >= orderTotal && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Payment will be deducted from your wallet balance
          </p>
        </div>
      )}
      {value === "cih_pay" && (
        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg animate-fade-in">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            📱 You'll receive a payment link via SMS after placing your order
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
