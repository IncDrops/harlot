
"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import type { Notification } from "@/lib/types";
import { formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data has been removed. The component will now fetch real data.

const notificationDetails = {
    'analysis_complete': { icon: CheckCircle, color: 'text-green-500' },
    'data_anomaly': { icon: AlertTriangle, color: 'text-yellow-500' },
    'insight_available': { icon: Info, color: 'text-blue-500' },
    'system_update': { icon: Bell, color: 'text-muted-foreground' },
};

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
          router.push('/signin');
        } else if (user) {
            setLoading(true);
            // In a real app, this would be a fetch call to your backend.
            // For now, we simulate an empty state.
            setTimeout(() => {
                setNotifications([]); // Start with no notifications
                setLoading(false);
            }, 500);
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
          <div className="container mx-auto py-8 text-center">
            <p>Loading...</p>
          </div>
        );
    }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
       <h1 className="text-2xl font-heading font-bold mb-6">Notifications</h1>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {loading ? (
                <div className="p-6 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : notifications.length > 0 ? (
                notifications.map((notification) => {
                    const details = notificationDetails[notification.type as keyof typeof notificationDetails] || { icon: Bell, color: 'text-muted-foreground' };
                    return (
                        <div key={notification.id} className={cn("flex items-start gap-4 p-4 border-b transition-colors hover:bg-muted/50", !notification.read && "bg-primary/5 font-semibold")}>
                            <div className="flex h-full w-auto items-center justify-center rounded-full bg-background mt-1">
                               <details.icon className={cn("h-5 w-5", details.color)} />
                            </div>
                            <div className="flex-1">
                                <p className={cn("text-sm", !notification.read && "text-foreground")}>{notification.title}</p>
                                <p className="text-sm text-muted-foreground font-normal">{notification.description}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-normal">{formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true })}</p>
                            </div>
                            {!notification.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 self-center"></div>}
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground rounded-lg border-2 border-dashed border-muted m-6">
                    <Bell className="w-12 h-12 mb-4 text-muted-foreground/50"/>
                    <p className="font-semibold">No New Notifications</p>
                    <p className="text-sm text-center">You're all caught up. We'll let you know when there's something new.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
