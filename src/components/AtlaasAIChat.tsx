import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Sparkles, RotateCcw, Utensils, MapPin, Clock, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  { icon: Star, text: "What are the best rated restaurants?", color: "text-yellow-500" },
  { icon: Utensils, text: "I want authentic Moroccan food", color: "text-orange-500" },
  { icon: Zap, text: "Which restaurant delivers fastest?", color: "text-blue-500" },
  { icon: MapPin, text: "Restaurants near me with good reviews", color: "text-green-500" },
];

const QUICK_ACTIONS = [
  { label: "🍕 Pizza", query: "Show me pizza restaurants" },
  { label: "🍔 Burgers", query: "Best burger places" },
  { label: "🍣 Sushi", query: "Japanese and sushi options" },
  { label: "🥗 Healthy", query: "Healthy food options" },
  { label: "☕ Cafe", query: "Coffee shops and cafes" },
  { label: "🍰 Desserts", query: "Dessert and pastry shops" },
];

export const AtlaasAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickActions(false);
    }
  }, [messages]);

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/atlaas-ai-chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (resp.status === 429) {
        throw new Error("Too many requests. Please wait a moment before trying again.");
      }
      
      if (resp.status === 402) {
        throw new Error("Service temporarily unavailable. Please try again later.");
      }

      if (!resp.ok || !resp.body) throw new Error("Failed to connect to ATLAAS AI");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);
  }, [input, isLoading, messages]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowQuickActions(true);
  };

  const handleRestaurantClick = (restaurantName: string) => {
    navigate(`/restaurants?search=${encodeURIComponent(restaurantName)}`);
    setIsOpen(false);
  };

  // Format message content with clickable restaurant names (basic markdown-like parsing)
  const formatMessage = (content: string) => {
    // Simple formatting for bold text
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const text = part.slice(2, -2);
        return (
          <strong key={idx} className="font-semibold text-primary">
            {text}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 relative overflow-hidden group"
          size="icon"
        >
          <Bot className="h-6 w-6 relative z-10" />
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="w-[400px] h-[650px] shadow-2xl flex flex-col bg-background border-primary/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/15 via-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-primary/10 rounded-xl">
                <Bot className="h-6 w-6 text-primary" />
                <Sparkles className="h-3 w-3 text-primary absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  ATLAAS AI
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                    BETA
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online • Powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Clear chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Bot className="h-16 w-16 mx-auto text-primary relative" />
                </div>
                <h4 className="font-bold text-lg mb-1">Hi! I'm ATLAAS AI 👋</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Your smart food discovery assistant. Ask me anything about restaurants, cuisines, or get personalized recommendations!
                </p>

                {/* Quick Actions */}
                {showQuickActions && (
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Quick search:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {QUICK_ACTIONS.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(action.query)}
                          className="text-xs h-7 px-2.5 hover:bg-primary/10 hover:border-primary/30"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className={`p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors`}>
                        <suggestion.icon className={`h-4 w-4 ${suggestion.color}`} />
                      </div>
                      <span className="text-sm text-foreground">{suggestion.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                  </p>
                </div>
              </motion.div>
            ))}

            {isLoading && messages[messages.length - 1]?.content === "" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <motion.span 
                      className="w-2 h-2 bg-primary/60 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span 
                      className="w-2 h-2 bg-primary/60 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.span 
                      className="w-2 h-2 bg-primary/60 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about restaurants, cuisines, deals..."
                disabled={isLoading}
                className="flex-1 bg-background border-border/50 focus:border-primary/50 rounded-xl"
              />
              <Button
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90 rounded-xl h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              ATLAAS AI may occasionally provide inaccurate info
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
