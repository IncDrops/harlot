
"use client";

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Poll, User } from '@/lib/types';
import { Gift } from 'lucide-react';

interface TipDialogProps {
  poll: Poll;
  creator: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const createTipSession = httpsCallable(functions, 'createTipSession');

export function TipDialog({ poll, creator, isOpen, onOpenChange }: TipDialogProps) {
  const { toast } = useToast();
  
  const [tipAmount, setTipAmount] = useState(5); // Default tip $5
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTipAmount(isNaN(value) ? 0 : value);
  };

  const handleTipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if(tipAmount < 1) {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Tip amount must be at least $1.00.",
        });
        return;
    }

    setIsLoading(true);

    try {
      const result: any = await createTipSession({
          amount: tipAmount,
          userId: creator.id,
          pollId: poll.id
      });
      
      const sessionUrl = result.data.sessionUrl;
      if (sessionUrl) {
          window.location.href = sessionUrl; // Redirect to Stripe Checkout
      } else {
          throw new Error("Could not retrieve Stripe session.");
      }
    } catch (error: any) {
        console.error("Stripe Tip Error:", error);
        toast({
            variant: "destructive",
            title: "Tipping Error",
            description: error.message || "Could not connect to the payment processor. Please try again later.",
        });
        setIsLoading(false);
    }
    // No need to set isLoading to false on success, as the page will redirect.
  };
  
  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          setIsLoading(false);
      }
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Send a Tip to @{creator.username}
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for this poll! Tips go directly to the creator.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTipping}>
          <div className="space-y-4 py-4">
              <label htmlFor="tip-amount" className="text-sm font-medium">Amount (USD)</label>
              <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="tip-amount" type="number" value={tipAmount} onChange={handleAmountChange} min="1" step="1" className="pl-7" />
              </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || tipAmount < 1} className="w-full">
              {isLoading ? 'Connecting to Stripe...' : `Tip $${tipAmount.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
