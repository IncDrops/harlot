
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle, AlertTriangle, Link2Off, RefreshCw, Server, Settings, PlusCircle, Database, GitBranch, Zap } from "lucide-react";
import type { DataIntegration } from "@/lib/types";
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ConnectGaDialog } from "@/components/data-sources/connect-ga-dialog";
import { ConnectHubspotDialog } from "@/components/data-sources/connect-hubspot-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { getUserIntegrations } from "@/lib/firebase";


const statusDetails = {
    connected: { icon: CheckCircle, color: "text-green-500", label: "Connected" },
    disconnected: { icon: Link2Off, color: "text-muted-foreground", label: "Disconnected" },
    error: { icon: AlertTriangle, color: "text-yellow-500", label: "Error" },
}

function UpgradePrompt() {
    return (
        <Card className="bg-secondary/20 border-secondary/30 text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2"><Zap className="text-secondary" /> Unlock Premium Data Sources</CardTitle>
                <CardDescription>Upgrade your plan to connect to live analytics platforms like Google Analytics and CRMs like HubSpot.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/pricing">
                        View Pricing Plans
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export default function DataSourcesPage() {
    const { user, profile } = useAuth();
    const [integrations, setIntegrations] = useState<DataIntegration[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGaDialogOpen, setIsGaDialogOpen] = useState(false);
    const [isHubspotDialogOpen, setIsHubspotDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !profile || profile.role !== 'admin') {
            setLoading(false);
            return;
        }

        async function fetchIntegrations() {
            setLoading(true);
            const userIntegrations = await getUserIntegrations(user.uid);
            
            const allPossibleIntegrations: DataIntegration[] = [
                { id: "google_analytics", name: "Google Analytics", type: "API", status: "disconnected", lastSync: null },
                { id: "hubspot", name: "HubSpot", type: "CRM", status: "disconnected", lastSync: null }
            ];

            const updatedIntegrations = allPossibleIntegrations.map(possible => {
                const existing = userIntegrations.find(i => i.id === possible.id);
                return existing ? { ...possible, ...existing, status: 'connected' } : possible;
            });
            
            setIntegrations(updatedIntegrations);
            setLoading(false);
        }

        fetchIntegrations();
    }, [user, profile]);

    const handleButtonClick = (integration: DataIntegration) => {
        if (integration.status !== 'disconnected') {
            toast({ title: "Already Connected", description: "Management for this integration is coming soon."});
            return;
        }

        switch (integration.id) {
            case 'google_analytics':
                setIsGaDialogOpen(true);
                break;
            case 'hubspot':
                setIsHubspotDialogOpen(true);
                break;
            default:
                toast({ title: "Feature Coming Soon", description: "This integration is not yet available." });
        }
    }

    const canAccessFeature = profile?.role === 'admin';

    return (
        <div className="container mx-auto py-8">
             <ConnectGaDialog open={isGaDialogOpen} onOpenChange={setIsGaDialogOpen} />
             <ConnectHubspotDialog open={isHubspotDialogOpen} onOpenChange={setIsHubspotDialogOpen} />
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Manage Data Sources</h1>
                    <p className="text-muted-foreground">Connect and manage the data Pollitago uses for analysis.</p>
                </div>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={() => {}} disabled={!canAccessFeature}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Source
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>More data sources coming soon.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardHeader>
                            <CardContent><div className="h-4 bg-muted rounded w-1/3 mb-2"></div></CardContent>
                            <CardFooter><div className="h-10 bg-muted rounded w-full"></div></CardFooter>
                        </Card>
                    ))}
                </div>
            ) : !canAccessFeature ? (
                <UpgradePrompt />
            ) : integrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration) => {
                        const details = statusDetails[integration.status];
                        return (
                            <Card key={integration.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                          <GitBranch className="h-6 w-6 text-primary" />
                                          <div>
                                              <CardTitle>{integration.name}</CardTitle>
                                              <CardDescription>Type: {integration.type}</CardDescription>
                                          </div>
                                        </div>
                                         <Badge variant="outline" className={cn("shrink-0", details.color)}>
                                            <details.icon className="h-4 w-4 mr-2" />
                                            {details.label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        {integration.lastSync 
                                            ? `Last sync: ${formatDistanceToNowStrict(new Date(integration.lastSync), { addSuffix: true })}`
                                            : "This source has not been synced yet."}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    {integration.status === "disconnected" ? (
                                        <Button className="w-full" onClick={() => handleButtonClick(integration)}>
                                            <Plug className="mr-2 h-4 w-4" /> Connect
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" className="w-full" onClick={() => handleButtonClick(integration)}>
                                            <Settings className="mr-2 h-4 w-4" /> Manage
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-64 text-muted-foreground rounded-lg border-2 border-dashed border-muted">
                    <Database className="w-12 h-12 mb-4 text-muted-foreground/50"/>
                    <p className="font-semibold">No Data Sources Configured</p>
                    <p className="text-sm text-center">Click "Add New Source" to connect your first data integration.</p>
                </div>
            )}
        </div>
    );
}
