
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMessages } from "@/contexts/message-context";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "../ui/skeleton";


export const ConversationList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectConversation, currentChatUser } = useMessages();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const usersRef = collection(db, "users");
      // Query for all users except the current one
      const q = query(usersRef, where("id", "!=", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data() as User);
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, [user]);

  if(loading) {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                    </div>
                </div>
            ))}
        </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-1">
        {users.map((otherUser) => (
          <button
            key={otherUser.id}
            onClick={() => selectConversation(otherUser.id)}
            className={cn(
              "w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors",
              currentChatUser?.id === otherUser.id
                ? "bg-muted"
                : "hover:bg-muted/50"
            )}
          >
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={otherUser.avatar} alt={otherUser.displayName} />
              <AvatarFallback>{otherUser.displayName?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{otherUser.displayName}</p>
              <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
