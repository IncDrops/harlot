import { Bell, MessageSquare, ThumbsUp, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const notifications = [
    { icon: ThumbsUp, text: "Yuki Tanaka and 28 others voted on your poll 'Should I get bangs?'.", time: "15m ago" },
    { icon: MessageSquare, text: "You received a $5 tip from akira_dev.", time: "1h ago" },
    { icon: UserPlus, text: "sakura_blossom started following you.", time: "3h ago" },
    { icon: Bell, text: "Your poll 'Pizza for lunch?' is ending in 1 hour.", time: "4h ago" },
];

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-8 w-8 border">
                   <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                       <notification.icon className="h-4 w-4 text-muted-foreground" />
                   </div>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">{notification.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
             <div className="flex items-center justify-center h-48 text-muted-foreground border-t mt-4 pt-4">
                <p>No older notifications.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
