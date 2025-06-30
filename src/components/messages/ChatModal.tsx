// Optional full-screen modal version of chat UI
"use client";

import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export const ChatModal = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-md p-4 rounded shadow">
        <MessageList />
        <div className="mt-4">
          <MessageInput />
        </div>
      </div>
    </div>
  );
};
