import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p className="text-lg">No messages yet.</p>
            <p className="text-sm">Start a conversation from a user's profile.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
