import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Users, ArrowLeft, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupOrder {
  id: string;
  session_code: string;
  restaurant_id: string;
  delivery_address: string;
  scheduled_for: string | null;
  status: string;
  expires_at: string;
  restaurants: {
    name: string;
    image_url: string;
  };
}

interface Participant {
  id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    full_name: string;
  };
}

export default function GroupOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [joinCode, setJoinCode] = useState("");
  
  const restaurantId = searchParams.get("restaurant");
  const mode = searchParams.get("mode") || "create";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createGroupOrder = async () => {
    if (!user || !restaurantId) return;
    
    if (!deliveryAddress.trim()) {
      toast({
        title: "Address required",
        description: "Please enter a delivery address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const sessionCode = generateSessionCode();
      
      const { data, error } = await supabase
        .from("group_orders")
        .insert({
          host_user_id: user.id,
          restaurant_id: restaurantId,
          session_code: sessionCode,
          delivery_address: deliveryAddress,
          status: "active",
        })
        .select(`
          *,
          restaurants (
            name,
            image_url
          )
        `)
        .single();

      if (error) throw error;

      // Auto-join the host
      await supabase
        .from("group_order_participants")
        .insert({
          group_order_id: data.id,
          user_id: user.id,
        });

      setGroupOrder(data);
      toast({
        title: "Group order created!",
        description: "Share the code with your friends",
      });
      
      fetchParticipants(data.id);
    } catch (error: any) {
      console.error("Error creating group order:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroupOrder = async () => {
    if (!user || !joinCode.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_orders")
        .select(`
          *,
          restaurants (
            name,
            image_url
          )
        `)
        .eq("session_code", joinCode.toUpperCase())
        .eq("status", "active")
        .single();

      if (error) throw error;

      // Check if already joined
      const { data: existing } = await supabase
        .from("group_order_participants")
        .select("*")
        .eq("group_order_id", data.id)
        .eq("user_id", user.id)
        .single();

      if (!existing) {
        await supabase
          .from("group_order_participants")
          .insert({
            group_order_id: data.id,
            user_id: user.id,
          });
      }

      setGroupOrder(data);
      toast({
        title: "Joined group order!",
        description: "You can now add your items",
      });
      
      fetchParticipants(data.id);
    } catch (error: any) {
      console.error("Error joining group order:", error);
      toast({
        title: "Error",
        description: "Invalid or expired group order code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (groupOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from("group_order_participants")
        .select("*")
        .eq("group_order_id", groupOrderId);

      if (error) throw error;
      
      // Fetch profiles separately
      const participantsWithProfiles = await Promise.all(
        (data || []).map(async (participant) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", participant.user_id)
            .single();
          
          return {
            ...participant,
            profiles: profile || { full_name: "Anonymous" }
          };
        })
      );
      
      setParticipants(participantsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching participants:", error);
    }
  };

  const copyToClipboard = () => {
    if (groupOrder) {
      navigator.clipboard.writeText(groupOrder.session_code);
      toast({
        title: "Copied!",
        description: "Session code copied to clipboard",
      });
    }
  };

  const goToMenu = () => {
    if (groupOrder) {
      navigate(`/restaurant/${groupOrder.restaurant_id}?groupOrder=${groupOrder.id}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Group Order</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!groupOrder ? (
          <div className="space-y-6">
            {mode === "create" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Create Group Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Input
                      id="address"
                      placeholder="Where should we deliver?"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={createGroupOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Group Order"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Join Group Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="code">Session Code</Label>
                    <Input
                      id="code"
                      placeholder="Enter 6-digit code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={joinGroupOrder}
                    disabled={loading || joinCode.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Group Order"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={groupOrder.restaurants.image_url}
                    alt={groupOrder.restaurants.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{groupOrder.restaurants.name}</h2>
                    <p className="text-sm text-muted-foreground">{groupOrder.delivery_address}</p>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Session Code</p>
                      <p className="text-2xl font-bold font-mono">{groupOrder.session_code}</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants ({participants.length})
                  </h3>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{participant.profiles.full_name}</span>
                        <Badge variant="secondary">Joined</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={goToMenu}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Go to Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
