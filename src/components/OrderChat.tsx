import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
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
}

export default function OrderChat({ orderId, userType }: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [orderId]);

  useEffect(() => {
    if (!user || !orderId) return;

    fetchMessages();
    
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up chat subscription');
      supabase.removeChannel(channel);
    };
  }, [user, orderId]);

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
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          order_id: orderId,
          sender_id: user.id,
          sender_type: userType,
          message: validation.data.message,
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Order Chat</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-8rem)] mt-4">
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
