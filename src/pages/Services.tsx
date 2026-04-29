import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Shirt, Wand2, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import ServiceToggle from "@/components/ServiceToggle";
import Footer from "@/components/Footer";

const SERVICES = [
  {
    id: "errands",
    name: "Errands",
    description: "Pharmacy, groceries, packages — we run it for you.",
    icon: ShoppingBag,
    eta: "30–60 min",
    base: "From 25 MAD",
  },
  {
    id: "laundry",
    name: "Laundry",
    description: "Pickup, wash, fold, deliver back to your dorm.",
    icon: Shirt,
    eta: "24h turnaround",
    base: "From 40 MAD",
  },
  {
    id: "custom",
    name: "Custom Request",
    description: "Anything legal we can carry on a scooter. Just ask.",
    icon: Wand2,
    eta: "We reply in <10 min",
    base: "Quote on demand",
  },
];

const Services = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeService, setActiveService] = useState<typeof SERVICES[number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    building: "",
    room: "",
    details: "",
  });

  const launch = (svc: typeof SERVICES[number]) => {
    setActiveService(svc);
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name || !form.phone || !form.details) {
      toast({ title: "Missing info", description: "Name, phone and details are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    // Phase 1: confirmation only. Phase 2 will write to a service_requests table.
    setTimeout(() => {
      setSubmitting(false);
      setOpen(false);
      toast({
        title: "Request received",
        description: `We'll text ${form.phone} within 10 minutes to confirm your ${activeService?.name.toLowerCase()} request.`,
      });
      setForm({ name: "", phone: "", building: "", room: "", details: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <ServiceToggle active="services" />

      <section className="container mx-auto px-4 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Beyond food. <span className="text-primary">Anything Ifrane.</span>
          </h1>
          <p className="text-muted-foreground mt-3">
            Local-only delivery for the things food apps forget. Pharmacy runs, laundry, packages, custom errands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <Card
                key={svc.id}
                className="p-6 cursor-pointer group hover:-translate-y-1 hover:shadow-elevation transition-all duration-300 border-border/60"
                onClick={() => launch(svc)}
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">{svc.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{svc.description}</p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">{svc.eta}</span>
                  <span className="text-sm font-semibold text-primary inline-flex items-center gap-1">
                    {svc.base} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{activeService?.name} request</DialogTitle>
            <DialogDescription>Tell us what you need. We'll text back to confirm and quote.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" placeholder="+212 6.." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="building">Building / Dorm</Label>
                <Input id="building" placeholder="e.g. Dorm 3" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="room">Room #</Label>
                <Input id="room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="details">What do you need? *</Label>
              <Textarea id="details" rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            </div>
            <Button className="w-full" size="lg" onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending</> : "Send request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Services;
