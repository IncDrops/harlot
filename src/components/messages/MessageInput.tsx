
"use client";

import { useState } from "react";
import { useMessages } from "@/contexts/message-context";
import { Input } from "@/components/ui/input";
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

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 pt-4 border-t">
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1"
        placeholder="Type a message..."
        disabled={!currentChatUser || isSending}
        autoComplete="off"
      />
      <Button type="submit" size="icon" disabled={!currentChatUser || !text.trim() || isSending}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
};
