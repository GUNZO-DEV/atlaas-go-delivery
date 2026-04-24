import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import AddressSelector from "./AddressSelector";
import { Home, Briefcase, MapPin, Plus, Trash2, Star, Edit } from "lucide-react";
import type { SavedAddress } from "./SavedAddressesPicker";

const labelIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("home") || l.includes("maison")) return <Home className="h-4 w-4" />;
  if (l.includes("office") || l.includes("work") || l.includes("bureau")) return <Briefcase className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
};

interface Props {
  userId: string;
}

export default function SavedAddressesManager({ userId }: Props) {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<SavedAddress> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("saved_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    setAddresses((data as SavedAddress[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  const handleAddNew = () => {
    setEditing({ label: "", address: "", latitude: null, longitude: null, is_default: false, notes: "" });
    setMapOpen(true);
  };

  const handleEdit = (addr: SavedAddress) => {
    setEditing(addr);
    setDialogOpen(true);
  };

  const handleAddressChosen = (address: string, lat: number, lng: number) => {
    setEditing((prev) => ({ ...(prev || {}), address, latitude: lat, longitude: lng }));
    setMapOpen(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.label || !editing?.address) {
      toast({ title: "Label and address required", variant: "destructive" });
      return;
    }
    const payload = {
      user_id: userId,
      label: editing.label,
      address: editing.address,
      latitude: editing.latitude ?? null,
      longitude: editing.longitude ?? null,
      is_default: editing.is_default ?? false,
      notes: editing.notes ?? null,
    };
    if (editing.id) {
      const { error } = await supabase.from("saved_addresses").update(payload).eq("id", editing.id);
      if (error) return toast({ title: "Failed to update", description: error.message, variant: "destructive" });
      toast({ title: "Address updated" });
    } else {
      const { error } = await supabase.from("saved_addresses").insert(payload);
      if (error) return toast({ title: "Failed to add", description: error.message, variant: "destructive" });
      toast({ title: "Address saved" });
    }
    setDialogOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_addresses").delete().eq("id", id);
    if (error) return toast({ title: "Failed to delete", variant: "destructive" });
    toast({ title: "Address deleted" });
    load();
  };

  const handleSetDefault = async (id: string) => {
    const { error } = await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
    if (error) return toast({ title: "Failed", variant: "destructive" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Saved Addresses</h3>
          <p className="text-sm text-muted-foreground">Save Home, Office and more for faster checkout</p>
        </div>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No saved addresses yet. Add one to checkout faster next time.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">{labelIcon(addr.label)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{addr.label}</span>
                      {addr.is_default && (
                        <Badge variant="secondary" className="h-5">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground break-words mb-3">{addr.address}</p>
                    <div className="flex flex-wrap gap-2">
                      {!addr.is_default && (
                        <Button size="sm" variant="ghost" onClick={() => handleSetDefault(addr.id)}>
                          <Star className="h-3.5 w-3.5 mr-1" />
                          Set default
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(addr)}>
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(addr.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressSelector
        open={mapOpen}
        onOpenChange={setMapOpen}
        initialAddress={editing?.address || ""}
        onSelectAddress={handleAddressChosen}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit address" : "Save address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="Home, Office, Mom's place..."
                value={editing?.label || ""}
                onChange={(e) => setEditing((p) => ({ ...(p || {}), label: e.target.value }))}
              />
            </div>
            <div>
              <Label>Address</Label>
              <div className="flex gap-2">
                <Input value={editing?.address || ""} readOnly className="flex-1" />
                <Button type="button" variant="outline" onClick={() => setMapOpen(true)}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Floor 3, ring twice..."
                value={editing?.notes || ""}
                onChange={(e) => setEditing((p) => ({ ...(p || {}), notes: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing?.is_default || false}
                onChange={(e) => setEditing((p) => ({ ...(p || {}), is_default: e.target.checked }))}
              />
              Set as default address
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
