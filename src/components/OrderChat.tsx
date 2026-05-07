import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageCircle, X, Smile, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatMessageSchema } from "@/lib/validation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'merchant' | 'rider';
  message: string;
  created_at: string;
  read_at?: string | null;
}

interface OrderChatProps {
  orderId: string;
  userType: 'customer' | 'merchant' | 'rider';
  floating?: boolean;
  compact?: boolean;
  fullPage?: boolean;
  onClose?: () => void;
}

const QUICK_REPLIES: Record<string, string[]> = {
  customer: ["Where is my order?", "Thank you!", "I'm outside waiting", "Please call me", "How long left?"],
  rider: ["On my way! 🏍️", "Arrived at restaurant", "Almost there!", "Can't find the address", "I'm at your door"],
  merchant: ["Order is being prepared", "Order is ready! 🎉", "We're running late", "Sorry for the delay"],
};

export default function OrderChat({ orderId, userType, floating = false, compact = false, fullPage = false, onClose }: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastTypingBroadcastRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [orderId]);

  useEffect(() => {
    if (!user || !orderId) return;
    fetchMessages();

    // Realtime messages
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
          const newMsg = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id !== user.id) {
            if (isMinimized || floating) {
              setUnreadCount(prev => prev + 1);
            }
            playMessageSound();
            // Mark as read if chat is open
            if (!isMinimized) {
              markAsRead(newMsg.id);
            }
          }
          scrollToBottom();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, read_at: updated.read_at } : m));
        }
      )
      .subscribe();

    // Typing presence channel
    const presenceChannel = supabase.channel(`typing-${orderId}`);
    presenceChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.user_id !== user.id) {
          setTypingUser(payload.payload?.user_id);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [user, orderId, userType, isMinimized]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser(user);
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
      if (data && data.length > 0) setShowQuickReplies(data.length < 3);
      scrollToBottom();

      // Mark unread messages as read
      if (data && user) {
        const unread = data.filter((m: any) => m.sender_id !== user.id && !m.read_at);
        for (const msg of unread) {
          markAsRead(msg.id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from("chat_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId)
        .is("read_at", null);
    } catch {}
  };

  const broadcastTyping = useCallback(() => {
    if (!user || !orderId) return;
    const now = Date.now();
    if (now - lastTypingBroadcastRef.current < 2000) return;
    lastTypingBroadcastRef.current = now;
    supabase.channel(`typing-${orderId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id },
    });
  }, [user, orderId]);

  const playMessageSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const shareLocation = async () => {
    if (!('geolocation' in navigator)) {
      toast({ title: "Location unavailable", description: "Your device doesn't support location sharing.", variant: "destructive" });
      return;
    }
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      const locationMsg = `📍 Shared location: https://maps.google.com/?q=${latitude},${longitude}`;
      await sendMessage(locationMsg);
    } catch {
      toast({ title: "Location error", description: "Could not get your location. Please enable GPS.", variant: "destructive" });
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || newMessage;
    if (!messageText.trim() || !user) return;

    const validation = chatMessageSchema.safeParse({ message: messageText });
    if (!validation.success) {
      toast({ title: "Invalid message", description: validation.error.issues[0].message, variant: "destructive" });
      return;
    }

    const validatedText = validation.data.message;
    setNewMessage("");
    setShowQuickReplies(false);
    setShowEmoji(false);
    setSending(true);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      sender_type: userType,
      message: validatedText,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({ order_id: orderId, sender_id: user.id, sender_type: userType, message: validatedText })
        .select()
        .single();

      if (error) {
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        throw error;
      }

      setMessages(prev => prev.map(m =>
        m.id === optimisticMessage.id ? {
          id: data.id, sender_id: data.sender_id,
          sender_type: data.sender_type as 'customer' | 'merchant' | 'rider',
          message: data.message, created_at: data.created_at,
          read_at: data.read_at,
        } : m
      ));
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send message", variant: "destructive" });
      setNewMessage(validatedText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const chatHeight = fullPage ? 'h-[calc(100vh-8rem)]' : compact ? 'h-[340px]' : 'h-[calc(100vh-8rem)]';

  const renderChatContent = () => (
    <div className={`flex flex-col ${chatHeight}`}>
      <ChatMessageList
        messages={messages}
        userId={user?.id}
        userType={userType}
        scrollRef={scrollRef}
        typingUser={typingUser}
      />

      {/* Quick replies */}
      {showQuickReplies && messages.length <= 5 && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-border/50 bg-muted/20">
          {(QUICK_REPLIES[userType] || []).map((reply) => (
            <Button
              key={reply}
              variant="outline"
              size="sm"
              className={`${compact ? 'text-[10px] h-6 px-2' : 'text-xs h-7 px-3'} rounded-full border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors`}
              onClick={() => sendMessage(reply)}
              disabled={sending}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={() => sendMessage()}
        sending={sending}
        showEmoji={showEmoji}
        setShowEmoji={setShowEmoji}
        inputRef={inputRef}
        onShareLocation={shareLocation}
        userType={userType}
        onTyping={broadcastTyping}
      />
    </div>
  );

  // Full page mode
  if (fullPage) return renderChatContent();

  // Floating chat mode
  if (floating) {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
        {isMinimized ? (
          <Button
            onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
            className="shadow-xl rounded-full h-14 w-14 p-0 relative bg-primary hover:bg-primary/90"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </Button>
        ) : (
          <Card className="w-[380px] shadow-2xl rounded-2xl overflow-hidden border-primary/20">
            <CardHeader className="pb-0 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Order Chat</CardTitle>
                    {typingUser && (
                      <p className="text-[10px] text-primary-foreground/70 animate-pulse">typing…</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-full">
                    <span className="text-xs font-bold">—</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onClose?.()}
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {renderChatContent()}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Sheet chat mode
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className={`w-full ${compact ? "sm:max-w-sm" : "sm:max-w-md"} p-0`}>
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Order Chat
            {typingUser && (
              <span className="text-xs font-normal text-muted-foreground animate-pulse ml-1">typing…</span>
            )}
          </SheetTitle>
        </SheetHeader>
        {renderChatContent()}
      </SheetContent>
    </Sheet>
  );
}
