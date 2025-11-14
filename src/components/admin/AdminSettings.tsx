import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, DollarSign, Clock, Percent, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface PlatformSettings {
  delivery_fee: number;
  commission_rate: number;
  operating_hours_start: string;
  operating_hours_end: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    delivery_fee: 15,
    commission_rate: 10,
    operating_hours_start: "08:00",
    operating_hours_end: "23:00",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*");

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsMap: Record<string, any> = {};
        data.forEach((item) => {
          settingsMap[item.setting_key] = item.setting_value;
        });

        setSettings({
          delivery_fee: settingsMap.delivery_fee?.default || 15,
          commission_rate: settingsMap.commission_rate?.default || 10,
          operating_hours_start: settingsMap.operating_hours?.start || "08:00",
          operating_hours_end: settingsMap.operating_hours?.end || "23:00",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updates = [
        {
          setting_key: "delivery_fee",
          setting_value: { default: settings.delivery_fee, currency: "MAD" },
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          setting_key: "commission_rate",
          setting_value: { default: settings.commission_rate, unit: "percentage" },
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          setting_key: "operating_hours",
          setting_value: {
            start: settings.operating_hours_start,
            end: settings.operating_hours_end,
          },
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("platform_settings")
          .upsert(update, { onConflict: "setting_key" });

        if (error) throw error;
      }

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-8 w-8" />
        <h2 className="text-3xl font-bold">Platform Settings</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Delivery Fee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-fee">Default Delivery Fee (MAD)</Label>
              <Input
                id="delivery-fee"
                type="number"
                value={settings.delivery_fee}
                onChange={(e) =>
                  setSettings({ ...settings, delivery_fee: Number(e.target.value) })
                }
                min="0"
                step="1"
              />
              <p className="text-sm text-muted-foreground">
                Standard delivery fee applied to orders
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Commission Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commission-rate">Commission Rate (%)</Label>
              <Input
                id="commission-rate"
                type="number"
                value={settings.commission_rate}
                onChange={(e) =>
                  setSettings({ ...settings, commission_rate: Number(e.target.value) })
                }
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-sm text-muted-foreground">
                Platform commission on restaurant orders (hidden from public)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Opening Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={settings.operating_hours_start}
                  onChange={(e) =>
                    setSettings({ ...settings, operating_hours_start: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Closing Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={settings.operating_hours_end}
                  onChange={(e) =>
                    setSettings({ ...settings, operating_hours_end: e.target.value })
                  }
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform-wide operating hours for orders
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Push notification settings will be available soon. Configure notification templates, timing, and user preferences.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;