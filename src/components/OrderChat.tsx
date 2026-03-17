import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Check, CheckCheck, User, Bike, Store, X, Smile } from "lucide-react";
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
  onClose?: () => void;
}

const QUICK_REPLIES: Record<string, string[]> = {
  customer: ["Where is my order?", "Thank you!", "I'm outside", "Please call me"],
  rider: ["On my way!", "Arrived at restaurant", "Almost there!", "Can't find the address"],
  merchant: ["Order is being prepared", "Order is ready!", "We're running late", "Sorry for the delay"],
};

const EMOJI_LIST = ["👍", "❤️", "😊", "🙏", "👋", "🔥", "✅", "⭐"];

export default function OrderChat({ orderId, userType, floating = false, compact = false, onClose }: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastReadRef = useRef<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [orderId]);

  useEffect(() => {
    if (!user || !orderId) return;

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
          const newMsg = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // Count unread if chat is minimized or from other user
          if (newMsg.sender_id !== user.id) {
            if (isMinimized || floating) {
              setUnreadCount(prev => prev + 1);
            }
            // Play notification sound
            playMessageSound();
          }
          
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      if (data && data.length > 0) {
        setShowQuickReplies(data.length < 3);
      }
      scrollToBottom();
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const playMessageSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {}
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || newMessage;
    if (!messageText.trim() || !user) return;

    const validation = chatMessageSchema.safeParse({ message: messageText });
    if (!validation.success) {
      toast({
        title: "Invalid message",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
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
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          order_id: orderId,
          sender_id: user.id,
          sender_type: userType,
          message: validatedText,
        })
        .select()
        .single();

      if (error) {
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        throw error;
      }

      setMessages(prev => prev.map(m => 
        m.id === optimisticMessage.id ? {
          id: data.id,
          sender_id: data.sender_id,
          sender_type: data.sender_type as 'customer' | 'merchant' | 'rider',
          message: data.message,
          created_at: data.created_at,
        } : m
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setNewMessage(validatedText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const getSenderInfo = (senderType: string) => {
    switch (senderType) {
      case 'customer':
        return { label: 'You', otherLabel: 'Customer', icon: User, color: 'text-blue-500' };
      case 'rider':
        return { label: 'You', otherLabel: 'Rider', icon: Bike, color: 'text-emerald-500' };
      case 'merchant':
        return { label: 'You', otherLabel: 'Restaurant', icon: Store, color: 'text-orange-500' };
      default:
        return { label: 'Unknown', otherLabel: 'Unknown', icon: User, color: 'text-muted-foreground' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    
    msgs.forEach(msg => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
  };

  const renderMessageBubble = (msg: Message, isCompact = false) => {
    const isOwn = msg.sender_id === user?.id;
    const senderInfo = getSenderInfo(msg.sender_type);
    const Icon = senderInfo.icon;
    const isTemp = msg.id.startsWith('temp-');
    
    return (
      <div
        key={msg.id}
        className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end group`}
      >
        {!isOwn && (
          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-muted ${senderInfo.color}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
        <div
          className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isCompact ? 'text-xs' : 'text-sm'} ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          } transition-all`}
        >
          {!isOwn && (
            <div className={`text-[10px] font-semibold mb-0.5 ${senderInfo.color}`}>
              {senderInfo.otherLabel}
            </div>
          )}
          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
              {formatTime(msg.created_at)}
            </span>
            {isOwn && (
              isTemp ? (
                <Check className="h-3 w-3 opacity-40" />
              ) : (
                <CheckCheck className="h-3 w-3 opacity-70" />
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQuickReplies = (isCompact = false) => {
    if (!showQuickReplies || messages.length > 5) return null;
    const replies = QUICK_REPLIES[userType] || [];
    
    return (
      <div className="flex flex-wrap gap-1.5 px-1 py-2">
        {replies.map((reply) => (
          <Button
            key={reply}
            variant="outline"
            size="sm"
            className={`${isCompact ? 'text-[10px] h-6 px-2' : 'text-xs h-7 px-3'} rounded-full border-primary/30 hover:bg-primary/10 hover:text-primary`}
            onClick={() => sendMessage(reply)}
            disabled={sending}
          >
            {reply}
          </Button>
        ))}
      </div>
    );
  };

  const renderEmojiPicker = () => {
    if (!showEmoji) return null;
    return (
      <div className="flex gap-1 px-2 py-1.5 bg-muted/50 rounded-lg mx-1 mb-1">
        {EMOJI_LIST.map(emoji => (
          <button
            key={emoji}
            className="text-lg hover:scale-125 transition-transform p-0.5"
            onClick={() => {
              setNewMessage(prev => prev + emoji);
              inputRef.current?.focus();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  const renderChatContent = (isCompact = false) => {
    const messageGroups = groupMessagesByDate(messages);
    
    return (
      <div className={`flex flex-col ${isCompact ? 'h-[340px]' : 'h-[calc(100vh-8rem)]'}`}>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-3 py-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Send a message to start the conversation
                </p>
              </div>
            )}
            {messageGroups.map((group) => (
              <div key={group.date}>
                <div className="flex justify-center my-3">
                  <Badge variant="secondary" className="text-[10px] font-normal px-2.5 py-0.5 rounded-full">
                    {getDateLabel(group.date)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {group.messages.map((msg) => renderMessageBubble(msg, isCompact))}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {renderQuickReplies(isCompact)}
        {renderEmojiPicker()}

        <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <Smile className={`h-4 w-4 ${showEmoji ? 'text-primary' : 'text-muted-foreground'}`} />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={sending}
            className="rounded-full bg-muted/50 border-0 focus-visible:ring-1"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={sending || !newMessage.trim()}
            size="icon"
            className="h-8 w-8 rounded-full flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Floating chat mode
  if (floating) {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
        {isMinimized ? (
          <Button
            onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
            className="shadow-lg rounded-full h-12 w-12 p-0 relative"
            size="icon"
          >
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </Button>
        ) : (
          <Card className="w-[340px] shadow-2xl rounded-2xl overflow-hidden border-primary/10">
            <CardHeader className="pb-0 py-3 bg-primary text-primary-foreground rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <CardTitle className="text-sm font-semibold">Order Chat</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setIsMinimized(true); }}
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {renderChatContent(true)}
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
          </SheetTitle>
        </SheetHeader>
        {renderChatContent(compact)}
      </SheetContent>
    </Sheet>
  );
}
