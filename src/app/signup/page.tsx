"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo, Tagline } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInAnonymously, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Passwords do not match.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password);
      toast({
        title: "Account Created",
        description: "You have successfully signed up! Please sign in.",
      });
      router.push("/signin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo className="mx-auto" />
          <Tagline className="mt-2" />
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Get started with PollitAGo today.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
              <Button variant="outline" className="w-full" onClick={signInAnonymously}>
                Continue as Anonymous
              </Button>
              <Button variant="secondary" className="w-full" onClick={signInWithGoogle}>
                Sign Up with Google
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="underline hover:text-primary font-semibold">
            Sign In
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground mt-2">
          <Link href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link> ·{" "}
          <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}
