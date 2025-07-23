
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Info, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getUserIntegrations } from '@/lib/firebase';
import type { DataIntegration } from '@/lib/types';
import { useRouter } from 'next/navigation';

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
    const { user, profile } = useAuth();
    const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        async function checkConnection() {
            setLoading(true);
            const integrations = await getUserIntegrations(user.uid);
            const hubspot = integrations.find(i => i.id === 'hubspot');
            setIsConnected(!!hubspot);
            setLoading(false);
        }
        checkConnection();
    }, [user]);
    
    const canAccessFeature = profile?.role === 'admin';

    if (!canAccessFeature) {
        return <UpgradePrompt />;
    }

    if (loading) {
        return <div className="h-24 w-full bg-muted/50 rounded-lg animate-pulse" />;
    }

    if (!isConnected) {
        return (
             <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Info className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Connect to HubSpot</h3>
                <p className="text-sm text-muted-foreground mb-4">Bring your CRM tasks into Pollitago to streamline your strategic planning.</p>
                <Button onClick={() => router.push('/data-sources')}>Connect HubSpot</Button>
                 <p className="text-xs text-muted-foreground mt-2">
                    You will be redirected to the Data Sources page.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
           <div className="text-center text-muted-foreground py-8 bg-green-500/10 rounded-lg">
                <p className="font-semibold text-green-700">HubSpot Connected</p>
                <p className="text-sm">Synced tasks will appear here.</p>
           </div>
        </div>
    );
}
