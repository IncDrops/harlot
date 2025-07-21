
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle, AlertTriangle, Link2Off, RefreshCw, Server } from "lucide-react";
import type { DataIntegration } from "@/lib/types";
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockIntegrations: DataIntegration[] = [
    {
        id: "1",
        name: "Salesforce CRM",
        type: "CRM",
        status: "connected",
        lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    },
    {
        id: "2",
        name: "SAP ERP",
        type: "ERP",
        status: "connected",
        lastSync: new Date(Date.now() - 1000 * 60 * 62).toISOString(), // 1 hour ago
    },
    {
        id: "3",
        name: "Internal PostgreSQL DB",
        type: "Database",
        status: "error",
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: "4",
        name: "Google Analytics API",
        type: "API",
        status: "disconnected",
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    }
];

const statusDetails = {
    connected: { icon: CheckCircle, color: "text-green-500", label: "Connected" },
    disconnected: { icon: Link2Off, color: "text-muted-foreground", label: "Disconnected" },
    error: { icon: AlertTriangle, color: "text-yellow-500", label: "Error" },
}

export default function DataSourcesPage() {
    const [integrations, setIntegrations] = useState<DataIntegration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            setIntegrations(mockIntegrations);
            setLoading(false);
        }, 1000);
    }, []);


    return (
        <div className="container mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Manage Data Sources</h1>
                <p className="text-muted-foreground">Connect and manage the data Pollitago uses for analysis.</p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-10 bg-muted rounded w-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration) => {
                        const details = statusDetails[integration.status];
                        return (
                            <Card key={integration.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Server className="h-6 w-6 text-primary" />
                                        <div>
                                            <CardTitle>{integration.name}</CardTitle>
                                            <CardDescription>Type: {integration.type}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <Badge variant="outline" className={cn("mb-4", details.color)}>
                                            <details.icon className="h-4 w-4 mr-2" />
                                            {details.label}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            Last sync: {formatDistanceToNowStrict(new Date(integration.lastSync), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="mt-6">
                                        {integration.status === "disconnected" ? (
                                            <Button className="w-full">
                                                <Plug className="mr-2 h-4 w-4" /> Connect
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" className="w-full">
                                                <RefreshCw className="mr-2 h-4 w-4" /> Manage
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
