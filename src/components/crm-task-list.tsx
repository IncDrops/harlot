
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Info, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function UpgradePrompt() {
    return (
        <div className="text-center p-6 bg-muted/50 rounded-lg">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Unlock CRM Integration</h3>
            <p className="text-sm text-muted-foreground mb-4">Upgrade to a Pro plan to connect HubSpot and sync your tasks automatically.</p>
            <Button asChild variant="secondary">
                <Link href="/pricing">View Plans</Link>
            </Button>
        </div>
    )
}


export function CrmTaskList() {
    const { profile } = useAuth();
    const { toast } = useToast();
    const [isConnected, setIsConnected] = useState(false); // This would come from backend state

    const handleConnect = () => {
        toast({
            title: "Feature Coming Soon",
            description: "The full HubSpot integration is currently in development."
        });
    }
    
    // Admins are considered Pro/Enterprise for this check
    const canAccessFeature = profile?.role === 'admin';

    if (!canAccessFeature) {
        return <UpgradePrompt />;
    }

    if (!isConnected) {
        return (
             <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Info className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Connect to HubSpot</h3>
                <p className="text-sm text-muted-foreground mb-4">Bring your CRM tasks into Pollitago to streamline your strategic planning.</p>
                <Button onClick={handleConnect}>Connect HubSpot</Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
           {/* This is where the list of synced tasks would go. */}
           <div className="text-center text-muted-foreground py-8">
                <p>No tasks found in HubSpot.</p>
           </div>
        </div>
    );
}

