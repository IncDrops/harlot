
"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DollarSign, Coins, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dummyUsers } from "@/lib/dummy-data";
import type { User } from "@/lib/types";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [displayUser, setDisplayUser] = useState<User | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin');
        } else if (user) {
            // In a real app, you'd fetch this from your database.
            // For now, we find a matching dummy user or use a default.
            const matchedUser = dummyUsers.find(u => u.username === user.email?.split('@')[0]) || dummyUsers[0];
            setDisplayUser({
                ...matchedUser,
                // @ts-ignore
                email: user.email,
            });
        }
    }, [user, loading, router]);

    const handleStripeConnect = () => {
        toast({
            title: "Stripe Connect",
            description: "To connect your account, you need to complete the Stripe onboarding process from your main account dashboard.",
        });
    };
    
    if (loading || !displayUser) {
        return (
             <div className="min-h-screen bg-muted/40 flex items-center justify-center">
                <p>Loading profile...</p>
             </div>
        )
    }

    const canRedeem = (displayUser.pollitPoints || 0) >= 500;
    const redeemAmountUSD = ((displayUser.pollitPoints || 0) / 100).toFixed(2);


  return (
    <div className="min-h-screen bg-muted/40">
        <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                    <AvatarImage src={displayUser.avatar} alt="User Avatar" data-ai-hint="anime avatar" />
                    <AvatarFallback>{displayUser.name?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{displayUser.name}</CardTitle>
                <CardDescription>@{displayUser.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/50 p-4 text-center">
                         <CardTitle className="flex items-center justify-center gap-2"><Coins className="w-5 h-5 text-yellow-500" /> PollitPoints</CardTitle>
                         <p className="text-3xl font-bold mt-2">{displayUser.pollitPoints?.toLocaleString()}</p>
                    </Card>
                     <Card className="bg-muted/50 p-4 text-center">
                         <CardTitle className="flex items-center justify-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /> Tips Earned</CardTitle>
                         <p className="text-3xl font-bold mt-2">$0.00</p>
                    </Card>
                </div>
                 <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Redeem PollitPoints</CardTitle>
                        <CardDescription>You can redeem your points for cash via Stripe once you reach 500 points. (100 points = $1.00)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button className="w-full" disabled={!canRedeem}>
                                {canRedeem ? `Redeem ${displayUser.pollitPoints?.toLocaleString()} Points for $${redeemAmountUSD}` : 'Reach 500 Points to Redeem'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will start the process to redeem {displayUser.pollitPoints?.toLocaleString()} points for ${redeemAmountUSD}. This requires a connected Stripe account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => toast({ title: "Redemption processing!", description: "Check your Stripe account in 2-3 business days." })}>
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                 </Card>

                 <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Connect Tip Jar</CardTitle>
                        <CardDescription>Connect with Stripe to receive tips from your followers and monetize your polls.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={handleStripeConnect}>Connect with Stripe</Button>
                    </CardContent>
                 </Card>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
