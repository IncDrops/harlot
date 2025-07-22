
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

interface ConnectGaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectGaDialog({ open, onOpenChange }: ConnectGaDialogProps) {
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
          <Button type="button" disabled>
            Continue to Google
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
