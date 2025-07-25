
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
import Image from "next/legacy/image";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface ConnectHubspotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectHubspotDialog({ open, onOpenChange }: ConnectHubspotDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleConnect = () => {
        const clientId = "1b386f43-ffec-455b-97b8-4ebe5f2e51e3";
        const redirectUri = "https://pollitago.com"; // This MUST match the redirect URI in your HubSpot app settings & Cloud Function
        const scopes = [
            "crm.objects.contacts.write",
            "timeline",
            "oauth",
            "crm.objects.companies.write",
            "crm.objects.companies.read",
            "crm.objects.deals.read",
            "crm.objects.deals.write",
            "crm.objects.contacts.read",
        ].join(" ");

        if (!user) {
             toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
             return;
        }

        const origin = window.location.origin;
        const state = JSON.stringify({ userId: user.uid, origin });

        const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;
        
        window.location.href = authUrl;
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
             <Image src="https://logos-world.net/wp-content/uploads/2021/04/HubSpot-Logo.png" alt="HubSpot Logo" width={80} height={23} data-ai-hint="hubspot logo" />
             <DialogTitle className="text-2xl font-heading">Connect to HubSpot</DialogTitle>
          </div>
          <DialogDescription>
            You will be redirected to HubSpot to securely authenticate and grant Pollitago permission to access your CRM data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                <li>Pollitago will request read and write access to manage contacts, deals, and tasks.</li>
                <li>Your credentials are never stored on our servers.</li>
                <li>You can revoke access at any time from your HubSpot account settings.</li>
            </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleConnect}>
            Continue to HubSpot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
