
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface ConnectGaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectGaDialog({ open, onOpenChange }: ConnectGaDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleConnect = () => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID) {
            toast({
                variant: 'destructive',
                title: 'Configuration Error',
                description: 'Google Client ID is not configured in the environment.'
            });
            return;
        }

        if(!user) {
             toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to connect a data source.'
            });
            return;
        }

        const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
        
        const params = {
            client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI,
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            access_type: 'offline', // Important to get a refresh token
            prompt: 'consent', // Force consent screen to ensure refresh token is sent
            state: user.uid // Pass the user's UID to identify them in the callback
        };

        const url = `${oauth2Endpoint}?${new URLSearchParams(params)}`;
        
        window.location.href = url;
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
             <Image src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google Logo" width={60} height={20} data-ai-hint="google logo" />
             <DialogTitle className="text-2xl font-heading">Connect to Google Analytics</DialogTitle>
          </div>
          <DialogDescription>
            You will be redirected to Google to securely authenticate and grant Pollitago permission to access your Google Analytics data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                <li>Pollitago will only request read-only access to your data.</li>
                <li>Your credentials are never stored on our servers.</li>
                <li>You can revoke access at any time from your Google Account settings.</li>
            </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleConnect}>
            Continue to Google
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
