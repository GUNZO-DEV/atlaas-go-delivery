import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatMessageSchema } from "@/lib/validation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'merchant' | 'rider';
  message: string;
  created_at: string;
}

interface OrderChatProps {
  orderId: string;
  userType: 'customer' | 'merchant' | 'rider';
  floating?: boolean;
  compact?: boolean;
}

export default function OrderChat({ orderId, userType, floating = false, compact = false }: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [orderId]);

  useEffect(() => {
    if (!user || !orderId) return;

    console.log(`[Chat] Setting up for order ${orderId}, user ${user.id}, type ${userType}`);
    fetchMessages();
    
    const channel = supabase
      .channel(`chat-${orderId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('[Chat] New message received:', payload);
          const newMsg = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      )
      .subscribe((status) => {
        console.log('[Chat] Subscription status:', status);
      });

    return () => {
      console.log('[Chat] Cleaning up chat subscription');
      supabase.removeChannel(channel);
    };
  }, [user, orderId, userType]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as Message[]) || []);
      scrollToBottom();
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Chat unavailable",
        description: "We couldn’t load chat messages for this order.",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    // Validate message
    const validation = chatMessageSchema.safeParse({ message: newMessage });
    if (!validation.success) {
      toast({
        title: "Invalid message",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      console.log('[Chat] Sending message:', { orderId, userType, message: validation.data.message });
      
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          order_id: orderId,
          sender_id: user.id,
          sender_type: userType,
          message: validation.data.message,
        });

      if (error) {
        console.error('[Chat] Error sending message:', error);
        throw error;
      }

      console.log('[Chat] Message sent successfully');
      setNewMessage("");
      
      toast({
        title: "Message sent",
        description: "Your message was delivered successfully",
      });
    } catch (error: any) {
      console.error('[Chat] Failed to send message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getSenderLabel = (senderType: string) => {
    switch (senderType) {
      case 'customer':
        return 'Customer';
      case 'merchant':
        return 'Restaurant';
      case 'rider':
        return 'Rider';
      default:
        return 'Unknown';
    }
  };

  if (floating) {
    return (
      <div className="absolute top-4 right-4 z-50 flex flex-col">
        {isMinimized ? (
          <Button
            onClick={() => setIsMinimized(false)}
            className="shadow-lg"
            size="sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat {messages.length > 0 && `(${messages.length})`}
          </Button>
        ) : (
          <Card className="w-[320px] shadow-2xl">
            <CardHeader className="pb-2 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Chat</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0"
                >
                  _
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[320px]">
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-2 py-2">
                    {messages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={`p-2 ${
                          msg.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        } max-w-[80%]`}
                      >
                        <div className="text-[10px] font-semibold mb-0.5">
                          {getSenderLabel(msg.sender_type)}
                        </div>
                        <p className="text-xs">{msg.message}</p>
                        <div className="text-[10px] opacity-70 mt-0.5">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                      </Card>
                    ))}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                <div className="flex gap-2 p-3 border-t">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={sending}
                  />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </SheetTrigger>
      <SheetContent className={`w-full ${compact ? "sm:max-w-sm" : "sm:max-w-lg"}`}>
        <SheetHeader>
          <SheetTitle>Order Chat</SheetTitle>
        </SheetHeader>
        <div className={`flex flex-col ${compact ? "h-[360px]" : "h-[calc(100vh-8rem)]"} mt-4`}>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card
                  key={msg.id}
                  className={`p-3 ${
                    msg.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  } max-w-[80%]`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {getSenderLabel(msg.sender_type)}
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </Card>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
