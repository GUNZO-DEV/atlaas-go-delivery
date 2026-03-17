import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile } from "lucide-react";

const EMOJI_LIST = ["👍", "❤️", "😊", "🙏", "👋", "🔥", "✅", "⭐"];

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  sendMessage: () => void;
  sending: boolean;
  showEmoji: boolean;
  setShowEmoji: (show: boolean) => void;
  inputRef: RefObject<HTMLInputElement>;
}

export default function ChatInput({ newMessage, setNewMessage, sendMessage, sending, showEmoji, setShowEmoji, inputRef }: ChatInputProps) {
  return (
    <div className="border-t border-border">
      {showEmoji && (
        <div className="flex gap-1 px-3 py-2 bg-muted/30">
          {EMOJI_LIST.map(emoji => (
            <button
              key={emoji}
              className="text-lg hover:scale-125 transition-transform p-1 rounded-lg hover:bg-muted"
              onClick={() => {
                setNewMessage(newMessage + emoji);
                inputRef.current?.focus();
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 p-3 bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 rounded-full"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          <Smile className={`h-5 w-5 ${showEmoji ? 'text-primary' : 'text-muted-foreground'}`} />
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
          className="rounded-full bg-muted/50 border-0 focus-visible:ring-1 h-10"
        />
        <Button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          size="icon"
          className="h-10 w-10 rounded-full flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
