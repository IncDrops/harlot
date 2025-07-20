
"use client";

import { useEffect, useRef } from "react";
import { useMessages } from "@/contexts/message-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNowStrict } from 'date-fns';

export const MessageList = () => {
  const { messages, currentChatUser } = useMessages();
  const { user } = useAuth();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    const viewport = viewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 0);
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 mb-4" viewportRef={viewportRef}>
      <div className="space-y-6 p-4">
        {messages.map((msg, index) => {
           const isSender = msg.senderId === user?.uid;
           // Show avatar only for the first message in a sequence from the other user
           const showAvatar = !isSender && (index === 0 || messages[index-1]?.senderId !== msg.senderId);

          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-end gap-2",
                isSender ? "justify-end" : "justify-start"
              )}
            >
              <div className="w-8">
               {showAvatar && currentChatUser && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={currentChatUser.avatar} alt={currentChatUser.displayName} />
                        <AvatarFallback>{currentChatUser.displayName?.[0]}</AvatarFallback>
                    </Avatar>
               )}
              </div>

              <div className={cn(
                "p-3 rounded-2xl max-w-xs lg:max-w-md",
                 isSender
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted rounded-bl-none"
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                 {msg.createdAt && (
                    <p className={cn("text-xs mt-1 text-right", isSender ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {formatDistanceToNowStrict(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                 )}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  );
};
