
"use client";

import { useState } from "react";
import { useMessages } from "@/contexts/message-context";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const MessageInput = () => {
  const [text, setText] = useState("");
  const { sendMessage, currentChatUser } = useMessages();
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentChatUser) return;
    
    setIsSending(true);
    await sendMessage(currentChatUser.id, text.trim());
    setText("");
    setIsSending(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(e);
    }
  }

  return (
    <form onSubmit={handleSend} className="flex items-start gap-2 pt-4 border-t">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none"
        placeholder="Type a message..."
        disabled={!currentChatUser || isSending}
        autoComplete="off"
        rows={1}
      />
      <Button type="submit" size="icon" disabled={!currentChatUser || !text.trim() || isSending}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
};
