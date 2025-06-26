import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-muted/40">
        <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="anime avatar" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">yuki_motion</CardTitle>
                <CardDescription>Yuki Tanaka</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="username">Username (url-friendly, lowercase only)</Label>
                    <Input id="username" defaultValue="yuki_motion" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar Image</Label>
                    <Input id="avatar" type="file" />
                </div>
                 <div className="space-y-2">
                    <Label>My Polls</Label>
                    <p className="text-sm text-muted-foreground">A list of your created polls will appear here.</p>
                </div>
                 <div className="space-y-2">
                    <Label>Tip Jar</Label>
                    <p className="text-2xl font-bold">$42.00</p>
                    <p className="text-sm text-muted-foreground">Your total earnings from tips.</p>
                </div>
                <Button className="w-full">Save Changes</Button>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
