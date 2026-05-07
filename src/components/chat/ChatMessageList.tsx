import { RefObject, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, Bike, Store, Check, CheckCheck, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'merchant' | 'rider';
  message: string;
  created_at: string;
  read_at?: string | null;
}

interface ChatMessageListProps {
  messages: Message[];
  userId: string | undefined;
  userType: 'customer' | 'merchant' | 'rider';
  scrollRef: RefObject<HTMLDivElement>;
  typingUser?: string | null;
}

const SENDER_CONFIG = {
  customer: {
    label: 'Customer',
    icon: User,
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    bgOther: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40',
    textColor: 'text-blue-600 dark:text-blue-400',
    avatarBg: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800/40',
  },
  rider: {
    label: 'Rider',
    icon: Bike,
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    bgOther: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    avatarBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/60 dark:to-emerald-800/40',
  },
  merchant: {
    label: 'Restaurant',
    icon: Store,
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
    bgOther: 'bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40',
    textColor: 'text-orange-600 dark:text-orange-400',
    avatarBg: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/60 dark:to-orange-800/40',
  },
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

function TypingIndicator({ senderType }: { senderType: string }) {
  const config = SENDER_CONFIG[senderType as keyof typeof SENDER_CONFIG] || SENDER_CONFIG.customer;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-center gap-2 mt-2"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.avatarBg}`}>
        <config.icon className={`h-4 w-4 ${config.textColor}`} />
      </div>
      <div className={`${config.bgOther} rounded-2xl rounded-bl-md px-4 py-2.5`}>
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/50"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatMessageList({ messages, userId, userType, scrollRef, typingUser }: ChatMessageListProps) {
  const groups = groupByDate(messages);

  // Determine who is typing based on the other party's type
  const typingSenderType = typingUser
    ? (userType === 'customer' ? 'rider' : userType === 'rider' ? 'customer' : 'customer')
    : null;

  return (
    <ScrollArea className="flex-1 px-3">
      <div className="space-y-1 py-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">Start a conversation</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
              {userType === 'rider'
                ? "Let the customer know you're on your way"
                : "Ask your rider about the delivery"}
            </p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center my-4">
              <Badge variant="secondary" className="text-[10px] font-normal px-3 py-0.5 rounded-full bg-muted/80 text-muted-foreground shadow-sm">
                {getDateLabel(group.date)}
              </Badge>
            </div>
            <div className="space-y-0.5">
              {group.messages.map((msg, i) => {
                const isOwn = msg.sender_id === userId;
                const config = SENDER_CONFIG[msg.sender_type] || SENDER_CONFIG.customer;
                const Icon = config.icon;
                const isTemp = msg.id.startsWith('temp-');
                const showAvatar = i === 0 || group.messages[i - 1].sender_type !== msg.sender_type;
                const isLastInGroup = i === group.messages.length - 1 || group.messages[i + 1]?.sender_type !== msg.sender_type;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                  >
                    {/* Avatar */}
                    {!isOwn ? (
                      showAvatar ? (
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${config.avatarBg}`}>
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
                      <div className={`relative px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                        isOwn
                          ? `${config.gradient} text-white ${isLastInGroup ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'}`
                          : `${config.bgOther} text-foreground ${isLastInGroup ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'}`
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>
                            {formatTime(msg.created_at)}
                          </span>
                          {isOwn && (
                            isTemp
                              ? <Check className="h-3 w-3 text-white/40" />
                              : msg.read_at
                                ? <Eye className="h-3 w-3 text-white/80" />
                                : <CheckCheck className="h-3 w-3 text-white/60" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingSenderType && <TypingIndicator senderType={typingSenderType} />}
        </AnimatePresence>

        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
