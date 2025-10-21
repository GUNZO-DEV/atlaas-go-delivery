import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Truck, Star, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PrimeMembershipDialog } from "./PrimeMembershipDialog";

export const PrimeCard = () => {
  const { language } = useLanguage();
  const [isPrime, setIsPrime] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchPrimeStatus();
  }, []);

  const fetchPrimeStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("is_prime_member, prime_expires_at")
      .eq("id", user.id)
      .single();

    if (data) {
      setIsPrime(data.is_prime_member || false);
      setExpiresAt(data.prime_expires_at);
    }
  };

  const content = {
    en: {
      title: "ATLAAS Prime",
      subtitle: "Premium Membership",
      active: "Active Member",
      notMember: "Join Prime",
      expires: "Expires",
      benefits: "Prime Benefits",
      freeDelivery: "Free Delivery",
      freeDeliveryDesc: "On all orders",
      doublePoints: "2x Loyalty Points",
      doublePointsDesc: "Earn faster",
      prioritySupport: "Priority Support",
      prioritySupportDesc: "Get help first",
      price: "49 MAD/month",
    },
    fr: {
      title: "ATLAAS Prime",
      subtitle: "Adhésion Premium",
      active: "Membre Actif",
      notMember: "Rejoindre Prime",
      expires: "Expire",
      benefits: "Avantages Prime",
      freeDelivery: "Livraison Gratuite",
      freeDeliveryDesc: "Sur toutes les commandes",
      doublePoints: "2x Points de Fidélité",
      doublePointsDesc: "Gagnez plus vite",
      prioritySupport: "Support Prioritaire",
      prioritySupportDesc: "Assistance rapide",
      price: "49 MAD/mois",
    },
    ar: {
      title: "أطلس برايم",
      subtitle: "العضوية المميزة",
      active: "عضو نشط",
      notMember: "انضم لبرايم",
      expires: "تنتهي",
      benefits: "مزايا برايم",
      freeDelivery: "توصيل مجاني",
      freeDeliveryDesc: "على جميع الطلبات",
      doublePoints: "ضعف نقاط الولاء",
      doublePointsDesc: "اربح أسرع",
      prioritySupport: "دعم أولوية",
      prioritySupportDesc: "مساعدة سريعة",
      price: "49 درهم/شهر",
    },
  };

  const t = content[language];

  return (
    <>
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            {isPrime && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Crown className="h-3 w-3 mr-1" />
                {t.active}
              </Badge>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t.freeDelivery}</p>
                <p className="text-sm text-muted-foreground">{t.freeDeliveryDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t.doublePoints}</p>
                <p className="text-sm text-muted-foreground">{t.doublePointsDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Headphones className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t.prioritySupport}</p>
                <p className="text-sm text-muted-foreground">{t.prioritySupportDesc}</p>
              </div>
            </div>
          </div>

          {isPrime ? (
            <div className="text-center py-2 px-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                {t.expires}: {expiresAt ? new Date(expiresAt).toLocaleDateString() : "-"}
              </p>
            </div>
          ) : (
            <Button
              onClick={() => setShowDialog(true)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Crown className="h-4 w-4 mr-2" />
              {t.notMember} - {t.price}
            </Button>
          )}
        </div>
      </Card>

      <PrimeMembershipDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={fetchPrimeStatus}
      />
    </>
  );
};
