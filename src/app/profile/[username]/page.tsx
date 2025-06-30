
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Coins, MessageSquare, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, Poll } from "@/lib/types";
import { getUserByUsername, getPollsByUser } from "@/lib/firebase";
import { PollCard } from "@/components/poll-card";

export default function UserProfilePage({ params }: { params: { username: string } }) {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const fetchedUser = await getUserByUsername(params.username);
                if (fetchedUser) {
                    setUser(fetchedUser);
                    const userPolls = await getPollsByUser(fetchedUser.id);
                    setPolls(userPolls);
                } else {
                    toast({
                        variant: 'destructive',
                        title: "User not found",
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast({
                    variant: 'destructive',
                    title: "Could not load profile.",
                });
            } finally {
                setLoading(false);
            }
        };

        if (params.username) {
            fetchUserData();
        }
    }, [params.username, toast]);

    if (loading) {
        return (
             <div className="min-h-screen bg-muted/40 flex items-center justify-center">
                <p>Loading profile...</p>
             </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-muted/40 flex items-center justify-center">
               <p>This user does not exist.</p>
            </div>
       )
    }

  return (
    <div className="min-h-screen bg-muted/40">
        <div className="container mx-auto py-8">
            <Card className="max-w-2xl mx-auto mb-8">
                <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                        <AvatarImage src={user.avatar} alt="User Avatar" data-ai-hint="anime avatar"/>
                        <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                     <div className="flex justify-center gap-6 pt-4 text-sm text-muted-foreground">
                        <div className="text-center">
                            <span className="font-bold text-foreground">{polls.length}</span> Posts
                        </div>
                        <div className="text-center">
                            <span className="font-bold text-foreground">1.2k</span> Followers
                        </div>
                        <div className="text-center">
                            <span className="font-bold text-foreground">340</span> Following
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow
                        </Button>
                        <Button variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-muted/50 p-4 text-center">
                             <CardTitle className="flex items-center justify-center gap-2 text-base font-semibold"><Coins className="w-5 h-5 text-yellow-500" /> PollitPoints</CardTitle>
                             <p className="text-2xl font-bold mt-2">{user.pollitPoints?.toLocaleString()}</p>
                        </Card>
                         <Card className="bg-muted/50 p-4 text-center">
                             <CardTitle className="flex items-center justify-center gap-2 text-base font-semibold"><DollarSign className="w-5 h-5 text-green-500" /> Tips Earned</CardTitle>
                             <p className="text-2xl font-bold mt-2">$0.00</p>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <h2 className="text-xl font-bold mb-4 max-w-2xl mx-auto">Polls by {user.name}</h2>
            <div className="max-w-2xl mx-auto space-y-6">
            {polls.length > 0 ? (
                polls.map(poll => {
                    const isTwoOptionPoll = poll.options.length === 2 && poll.type === 'standard';
                    return (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            onSwipe={() => {}} 
                            onVote={() => {}}
                            isTwoOptionPoll={isTwoOptionPoll} 
                            showResults={true} 
                        />
                    )
                })
            ) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>{user.name} hasn't posted any polls yet.</p>
                    </CardContent>
                </Card>
            )}
            </div>
        </div>
    </div>
  );
}
