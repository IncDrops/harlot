
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db, getUserById } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import type { User, Message } from "@/lib/types";


type MessageContextType = {
  messages: Message[];
  sendMessage: (recipientId: string, text: string) => Promise<void>;
  selectConversation: (userId: string) => void;
  currentChatUser: User | null;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatUser, setCurrentChatUser] = useState<User | null>(null);

  const selectConversation = useCallback(async (userId: string) => {
    if(userId === currentChatUser?.id) return;
    const userProfile = await getUserById(userId);
    setCurrentChatUser(userProfile);
  }, [currentChatUser?.id]);

  useEffect(() => {
    if (!user || !currentChatUser) {
      setMessages([]);
      return;
    }

    const participantsQueryValue = [user.uid, currentChatUser.id].sort().join('_');

    const q = query(
      collection(db, "messages"),
      where("participantsId", "==", participantsQueryValue),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString(),
        } as Message;
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, currentChatUser]);

  const sendMessage = async (recipientId: string, text: string) => {
    if (!user) return;
    await addDoc(collection(db, "messages"), {
      text,
      senderId: user.uid,
      recipientId,
      participants: [user.uid, recipientId],
      participantsId: [user.uid, recipientId].sort().join('_'), // For easier querying
      createdAt: serverTimestamp(),
    });
  };

  return (
    <MessageContext.Provider
      value={{ messages, sendMessage, selectConversation, currentChatUser }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
