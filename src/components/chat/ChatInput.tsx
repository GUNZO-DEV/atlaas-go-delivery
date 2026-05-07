import { RefObject, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Smile, MapPin, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJI_LIST = ["👍", "❤️", "😊", "🙏", "👋", "🔥", "✅", "⭐", "😂", "🎉", "👀", "💯"];

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  sendMessage: () => void;
  sending: boolean;
  showEmoji: boolean;
  setShowEmoji: (show: boolean) => void;
  inputRef: RefObject<HTMLInputElement>;
  onShareLocation?: () => void;
  userType?: 'customer' | 'merchant' | 'rider';
  onTyping?: () => void;
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  sendMessage,
  sending,
  showEmoji,
  setShowEmoji,
  inputRef,
  onShareLocation,
  userType,
  onTyping,
}: ChatInputProps) {
  const hasText = newMessage.trim().length > 0;

  return (
    <div className="border-t border-border bg-card">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-6 gap-1 px-3 py-2 bg-muted/30">
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-muted flex items-center justify-center"
                  onClick={() => {
                    setNewMessage(newMessage + emoji);
                    inputRef.current?.focus();
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5 p-2.5">
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 pb-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 rounded-full"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <Smile className={`h-5 w-5 ${showEmoji ? 'text-primary' : 'text-muted-foreground'}`} />
          </Button>
          {(userType === 'rider' || userType === 'customer') && onShareLocation && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0 rounded-full"
              onClick={onShareLocation}
              title="Share location"
            >
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              onTyping?.();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={sending}
            className="w-full rounded-full bg-muted/50 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 h-10 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Send button */}
        <motion.div animate={{ scale: hasText ? 1 : 0.9 }} className="pb-0.5">
          <Button
            onClick={sendMessage}
            disabled={sending || !hasText}
            size="icon"
            className={`h-10 w-10 rounded-full flex-shrink-0 shadow-md transition-all ${
              hasText ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
