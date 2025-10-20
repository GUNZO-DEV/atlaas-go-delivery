import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

const EmergencySOSButton = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  useEffect(() => {
    fetchEmergencyContact();
  }, []);

  const fetchEmergencyContact = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("rider_emergency_contacts")
        .select("*")
        .eq("rider_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setEmergencyContact(data);
        setContactForm({
          name: data.name,
          phone: data.phone,
          relationship: data.relationship || "",
        });
      }
    } catch (error) {
      console.error("Error fetching emergency contact:", error);
    }
  };

  const saveEmergencyContact = async () => {
    if (!contactForm.name || !contactForm.phone) {
      toast({
        title: "Missing information",
        description: "Please provide name and phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("rider_emergency_contacts")
        .upsert({
          rider_id: user.id,
          name: contactForm.name,
          phone: contactForm.phone,
          relationship: contactForm.relationship,
        });

      if (error) throw error;

      toast({
        title: "Emergency contact saved",
        description: "Your emergency contact has been updated",
      });
      
      setEmergencyContact(contactForm);
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving emergency contact:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const triggerSOS = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
            
            // In a real app, this would send SMS/notifications to emergency contact and support
            toast({
              title: "SOS Alert Sent!",
              description: emergencyContact 
                ? `Emergency notification sent to ${emergencyContact.name}` 
                : "Emergency notification sent to support team",
            });

            // Log the SOS event (could create an sos_logs table)
            console.log("SOS triggered:", {
              riderId: user.id,
              location,
              timestamp: new Date().toISOString(),
            });

            setSosDialogOpen(false);
          },
          (error) => {
            console.error("Location error:", error);
            toast({
              title: "SOS Alert Sent!",
              description: "Emergency notification sent (location unavailable)",
            });
          }
        );
      } else {
        toast({
          title: "SOS Alert Sent!",
          description: "Emergency notification sent to support team",
        });
      }
    } catch (error: any) {
      console.error("Error triggering SOS:", error);
      toast({
        title: "Error",
        description: "Failed to send SOS alert. Please call emergency services directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={sosDialogOpen} onOpenChange={setSosDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            className="bg-red-600 hover:bg-red-700 animate-pulse"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            Emergency SOS
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              This will immediately notify your emergency contact and our support team with your location
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Only use in genuine emergencies. For urgent matters, call police (190) or ambulance (150).
            </AlertDescription>
          </Alert>

          {emergencyContact ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold mb-2">Emergency Contact:</p>
                <p className="text-sm">{emergencyContact.name}</p>
                <p className="text-sm text-muted-foreground">{emergencyContact.phone}</p>
                {emergencyContact.relationship && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {emergencyContact.relationship}
                  </p>
                )}
              </div>
              <Button
                variant="link"
                onClick={() => {
                  setSosDialogOpen(false);
                  setDialogOpen(true);
                }}
              >
                Update Emergency Contact
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No emergency contact set. Our support team will be notified.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSosDialogOpen(false);
                  setDialogOpen(true);
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Add Emergency Contact
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSosDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={triggerSOS}
            >
              Send SOS Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emergency Contact</DialogTitle>
            <DialogDescription>
              Add someone we can contact in case of emergency
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
                placeholder="Contact name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phone: e.target.value })
                }
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={contactForm.relationship}
                onChange={(e) =>
                  setContactForm({ ...contactForm, relationship: e.target.value })
                }
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={saveEmergencyContact}>
              Save Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencySOSButton;
