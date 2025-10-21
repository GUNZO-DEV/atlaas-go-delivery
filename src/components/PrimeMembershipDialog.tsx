import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Crown, Truck, Star, Headphones, CreditCard } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PrimeMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const PrimeMembershipDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: PrimeMembershipDialogProps) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const content = {
    en: {
      title: "Join ATLAAS Prime",
      description: "Unlock premium benefits for just 49 MAD/month",
      benefits: "What you get:",
      freeDelivery: "Free delivery on all orders",
      doublePoints: "Earn 2x loyalty points on every order",
      prioritySupport: "Priority customer support",
      price: "49 MAD/month",
      subscribe: "Subscribe Now",
      paymentNote: "Payment will be processed via CMI payment gateway",
      comingSoon: "Subscribe (Payment Coming Soon)",
      success: "Prime membership activated!",
      error: "Failed to activate membership",
    },
    fr: {
      title: "Rejoindre ATLAAS Prime",
      description: "Débloquez des avantages premium pour seulement 49 MAD/mois",
      benefits: "Ce que vous obtenez:",
      freeDelivery: "Livraison gratuite sur toutes les commandes",
      doublePoints: "Gagnez 2x points de fidélité sur chaque commande",
      prioritySupport: "Support client prioritaire",
      price: "49 MAD/mois",
      subscribe: "S'abonner maintenant",
      paymentNote: "Le paiement sera traité via la passerelle CMI",
      comingSoon: "S'abonner (Paiement bientôt)",
      success: "Adhésion Prime activée!",
      error: "Échec de l'activation",
    },
    ar: {
      title: "انضم إلى أطلس برايم",
      description: "احصل على مزايا مميزة مقابل 49 درهم فقط شهرياً",
      benefits: "ما ستحصل عليه:",
      freeDelivery: "توصيل مجاني على جميع الطلبات",
      doublePoints: "اربح ضعف نقاط الولاء على كل طلب",
      prioritySupport: "دعم عملاء ذو أولوية",
      price: "49 درهم/شهر",
      subscribe: "اشترك الآن",
      paymentNote: "سيتم معالجة الدفع عبر بوابة CMI",
      comingSoon: "اشترك (الدفع قريباً)",
      success: "تم تفعيل عضوية برايم!",
      error: "فشل التفعيل",
    },
  };

  const t = content[language];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // For now, create a pending membership
      // Later integrate with CMI payment gateway
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase.from("prime_memberships").insert({
        user_id: user.id,
        status: "active", // Change to 'pending' when CMI is integrated
        expires_at: expiresAt.toISOString(),
        payment_method: "pending",
      });

      if (error) throw error;

      toast.success(t.success);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error subscribing to Prime:", error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">{t.title}</DialogTitle>
          </div>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h4 className="font-semibold mb-3 text-foreground">{t.benefits}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-foreground">{t.freeDelivery}</p>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-foreground">{t.doublePoints}</p>
              </div>
              <div className="flex items-start gap-3">
                <Headphones className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-foreground">{t.prioritySupport}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">{t.price}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">{t.paymentNote}</p>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Crown className="h-4 w-4 mr-2" />
            {loading ? "..." : t.comingSoon}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
