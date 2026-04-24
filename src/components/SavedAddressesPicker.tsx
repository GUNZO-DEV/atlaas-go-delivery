import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Briefcase, MapPin, Plus, Loader2, Star } from "lucide-react";

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  notes: string | null;
}

interface Props {
  userId: string | null;
  selectedAddressId?: string | null;
  onSelect: (addr: SavedAddress) => void;
  onAddNew: () => void;
}

const labelIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("home") || l.includes("maison")) return <Home className="h-4 w-4" />;
  if (l.includes("office") || l.includes("work") || l.includes("bureau")) return <Briefcase className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
};

export default function SavedAddressesPicker({ userId, selectedAddressId, onSelect, onAddNew }: Props) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("saved_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      setAddresses((data as SavedAddress[]) || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              onClick={() => onSelect(addr)}
              className={`p-3 cursor-pointer transition-all hover:border-primary ${
                selectedAddressId === addr.id ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-primary">{labelIcon(addr.label)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-medium text-sm truncate">{addr.label}</span>
                    {addr.is_default && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        <Star className="h-2.5 w-2.5 mr-0.5" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{addr.address}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" className="w-full" onClick={onAddNew} type="button">
        <Plus className="h-4 w-4 mr-2" />
        {addresses.length === 0 ? "Add a delivery address" : "Use a new address"}
      </Button>
    </div>
  );
}
