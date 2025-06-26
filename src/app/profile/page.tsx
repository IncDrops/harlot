"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DollarSign, Coins, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dummyUsers } from "@/lib/dummy-data";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // Find a dummy user to display for demo purposes if not logged in
    const displayUser = user 
      ? { email: user.email, ...dummyUsers.find(u => u.username === user.email?.split('@')[0]) }
      : dummyUsers[0];


    useEffect(() => {
        if (!loading && !user) {
            // For demo, we don't push to signin.
            // In a real app, you would uncomment this:
            // router.push('/signin');
        }
    }, [user, loading, router]);

    const handleStripeConnect = () => {
        toast({
            title: "Coming Soon!",
            description: "Stripe integration for tips is not yet implemented.",
        });
    };
    
    const canRedeem = (displayUser.pollitPoints || 0) >= 500;

    if (loading) {
        return (
             <div className="min-h-screen bg-muted/40 flex items-center justify-center">
                <p>Loading profile...</p>
             </div>
        )
    }

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
                        <CardDescription>You can redeem your points for cash or gift cards once you reach 500 points. (10 points = $0.10)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" disabled={!canRedeem}>
                            {canRedeem ? `Redeem ${displayUser.pollitPoints?.toLocaleString()} Points` : 'Reach 500 Points to Redeem'}
                        </Button>
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
                <Button className="w-full">Save Changes</Button>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
