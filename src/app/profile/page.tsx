"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin');
        }
    }, [user, loading, router]);

    const handleStripeConnect = () => {
        toast({
            title: "Coming Soon!",
            description: "Stripe integration for tips is not yet implemented.",
        });
    };

    if (loading || !user) {
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
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt="User Avatar" data-ai-hint="anime avatar" />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{user.email?.split('@')[0]}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="username">Username (url-friendly, lowercase only)</Label>
                    <Input id="username" defaultValue={user.email?.split('@')[0]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar Image</Label>
                    <Input id="avatar" type="file" />
                </div>
                 <div className="space-y-2">
                    <Label>My Polls</Label>
                    <p className="text-sm text-muted-foreground">A list of your created polls will appear here.</p>
                </div>
                 <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /> Tip Jar</CardTitle>
                        <CardDescription>Connect with Stripe to receive tips from your followers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-3xl font-bold mb-2">$0.00</p>
                         <p className="text-sm text-muted-foreground mb-4">Your total earnings from tips.</p>
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
