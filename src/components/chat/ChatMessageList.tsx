import { RefObject } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, Bike, Store, Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'merchant' | 'rider';
  message: string;
  created_at: string;
}

interface ChatMessageListProps {
  messages: Message[];
  userId: string | undefined;
  userType: 'customer' | 'merchant' | 'rider';
  scrollRef: RefObject<HTMLDivElement>;
}

const SENDER_CONFIG = {
  customer: { label: 'Customer', icon: User, bgOwn: 'bg-blue-500', bgOther: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-600 dark:text-blue-400', avatarBg: 'bg-blue-100 dark:bg-blue-900/50' },
  rider: { label: 'Rider', icon: Bike, bgOwn: 'bg-emerald-500', bgOther: 'bg-emerald-100 dark:bg-emerald-900/40', textColor: 'text-emerald-600 dark:text-emerald-400', avatarBg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  merchant: { label: 'Restaurant', icon: Store, bgOwn: 'bg-orange-500', bgOther: 'bg-orange-100 dark:bg-orange-900/40', textColor: 'text-orange-600 dark:text-orange-400', avatarBg: 'bg-orange-100 dark:bg-orange-900/50' },
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
}

function groupByDate(msgs: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  msgs.forEach(msg => {
    const d = new Date(msg.created_at).toDateString();
    if (d !== currentDate) {
      currentDate = d;
      groups.push({ date: d, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });
  return groups;
}

export default function ChatMessageList({ messages, userId, userType, scrollRef }: ChatMessageListProps) {
  const groups = groupByDate(messages);

  return (
    <ScrollArea className="flex-1 px-3">
      <div className="space-y-1 py-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start the conversation</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center my-4">
              <Badge variant="secondary" className="text-[10px] font-normal px-3 py-0.5 rounded-full bg-muted/80 text-muted-foreground">
                {getDateLabel(group.date)}
              </Badge>
            </div>
            <div className="space-y-1">
              {group.messages.map((msg, i) => {
                const isOwn = msg.sender_id === userId;
                const config = SENDER_CONFIG[msg.sender_type] || SENDER_CONFIG.customer;
                const Icon = config.icon;
                const isTemp = msg.id.startsWith('temp-');
                const showAvatar = i === 0 || group.messages[i - 1].sender_type !== msg.sender_type;

                return (
                  <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}>
                    {/* Avatar */}
                    {!isOwn ? (
                      showAvatar ? (
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.avatarBg}`}>
                          <Icon className={`h-4 w-4 ${config.textColor}`} />
                        </div>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )
                    ) : null}

                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Sender label */}
                      {!isOwn && showAvatar && (
                        <span className={`text-[11px] font-semibold mb-0.5 ml-1 ${config.textColor}`}>
                          {config.label}
                        </span>
                      )}

                      {/* Message bubble */}
                      <div className={`relative px-3.5 py-2 text-sm leading-relaxed ${
                        isOwn
                          ? `${config.bgOwn} text-white rounded-2xl rounded-br-md`
                          : `${config.bgOther} text-foreground rounded-2xl rounded-bl-md`
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>
                            {formatTime(msg.created_at)}
                          </span>
                          {isOwn && (
                            isTemp
                              ? <Check className="h-3 w-3 text-white/40" />
                              : <CheckCheck className="h-3 w-3 text-white/70" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
