"use client";

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
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

export function TipDialog({ poll, creator, isOpen, onOpenChange }: TipDialogProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [tipAmount, setTipAmount] = useState(5); // Default tip $5
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTipAmount(isNaN(value) ? 0 : value);
  };

  const createPaymentIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

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
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Math.round(tipAmount * 100) }), // amount in cents
      });

      const data = await res.json();

      if (res.ok) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.error || 'Failed to create payment intent.');
      }
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/`,
      },
      // redirect: 'if_required' will prevent redirect and return the paymentIntent
      redirect: 'if_required', 
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
          toast({ variant: "destructive", title: "Payment Failed", description: error.message });
      } else {
          toast({ variant: "destructive", title: "An unexpected error occurred."});
      }
      setIsProcessing(false);
    } else {
      // Payment succeeded. You can update your DB here.
      // For now, we just show a success message.
      toast({
        title: "Success!",
        description: `You've successfully tipped @${creator.username} $${tipAmount.toFixed(2)}.`,
      });
      // Here you would call an action to increment the poll's tipCount
      // and maybe award the creator PollitPoints.
      setIsProcessing(false);
      onOpenChange(false);
      setClientSecret(null); // Reset for next time
    }
  };
  
  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          setClientSecret(null);
          setIsLoading(false);
          setIsProcessing(false);
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

        {!clientSecret ? (
          <form onSubmit={createPaymentIntent}>
            <div className="space-y-4 py-4">
                <label htmlFor="tip-amount" className="text-sm font-medium">Amount (USD)</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="tip-amount" type="number" value={tipAmount} onChange={handleAmountChange} min="1" step="1" className="pl-7" />
                </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading || tipAmount < 1} className="w-full">
                {isLoading ? 'Loading...' : `Continue to Pay $${tipAmount.toFixed(2)}`}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmitPayment}>
            <div className="py-4">
              <PaymentElement />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full">
                {isProcessing ? 'Processing...' : 'Confirm Tip'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
