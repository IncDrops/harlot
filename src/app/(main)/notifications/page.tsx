
"use client";

import { useEffect, useState } from "react";
import { Bell, Gift, ThumbsUp, UserPlus, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { getNotificationsForUser } from "@/lib/firebase";
import type { Notification } from "@/lib/types";
import { formatDistanceToNowStrict } from 'date-fns';

const notificationDetails = {
    'new_follower': { icon: UserPlus, text: (n: Notification) => `${n.fromUsername} started following you.` },
    'new_vote': { icon: ThumbsUp, text: (n: Notification) => `${n.fromUsername} and others voted on your poll.` },
    'poll_ending': { icon: Bell, text: (n: Notification) => `Your poll is ending soon.` },
    'tip_received': { icon: Gift, text: (n: Notification) => `You received a $${n.amount} tip from ${n.fromUsername}.`},
    'new_comment': { icon: MessageSquare, text: (n: Notification) => `${n.fromUsername} commented on your poll.`},
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getNotificationsForUser(user.uid)
                .then(setNotifications)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <p>Loading notifications...</p>
                </div>
            ) : notifications.length > 0 ? (
                notifications.map((notification) => {
                    const details = notificationDetails[notification.type as keyof typeof notificationDetails] || { icon: Bell, text: () => 'New notification' };
                    return (
                        <div key={notification.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                            <Avatar className="h-8 w-8 border">
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                                   <details.icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm">{details.text(notification)}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true })}</p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg">
                    <Bell className="h-12 w-12 mb-4" />
                    <p className="text-lg">You have no new notifications.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
