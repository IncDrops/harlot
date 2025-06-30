
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMessages } from "@/contexts/message-context";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { currentChatUser } = useMessages();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-144px)]">
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 h-full">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ConversationList />
          </CardContent>
        </Card>
        <Card className="flex flex-col h-full">
          <CardHeader>
             <CardTitle>{currentChatUser ? `Chat with @${currentChatUser.username}` : "Chat"}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {currentChatUser ? (
              <>
                <MessageList />
                <MessageInput />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm">Choose someone from the list to start chatting.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
