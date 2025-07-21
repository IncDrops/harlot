
"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Share2, FileDown, Archive, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { getAnalysisById } from "@/lib/firebase";
import type { Analysis } from "@/lib/types";

const chartData = [
  { factor: "Market Y ROI", value: 4.5, fill: "hsl(var(--primary))" },
  { factor: "Market X ROI", value: 3.2, fill: "hsl(var(--muted))" },
  { factor: "Market Y TAM", value: 500, fill: "hsl(var(--primary))" },
  { factor: "Market X TAM", value: 250, fill: "hsl(var(--muted))" },
];

const chartConfig = {
  value: {
    label: "Value",
  },
} satisfies ChartConfig;


export default function AnalysisReportPage() {
    const params = useParams();
    const analysisId = params.analysisId as string;
    
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!analysisId) return;

        async function fetchAnalysis() {
            try {
                const fetchedAnalysis = await getAnalysisById(analysisId);
                if (fetchedAnalysis) {
                    setAnalysis(fetchedAnalysis);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch analysis", error);
                notFound();
            } finally {
                setLoading(false);
            }
        }

        fetchAnalysis();
    }, [analysisId]);

    if (loading) {
        return (
            <div className="container mx-auto py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading analysis report...</p>
            </div>
        );
    }
    
    if (!analysis) {
        return notFound();
    }

    const isCompleted = analysis.status === 'completed';

    // Use mock data for display if analysis is in progress, as fields won't exist yet
    const displayData = {
        primaryRecommendation: analysis.primaryRecommendation || "Analysis is still in progress...",
        executiveSummary: analysis.executiveSummary || "The AI is currently processing your data sources. An executive summary will be generated upon completion. Check back shortly.",
        confidenceScore: analysis.confidenceScore || 0,
        risks: analysis.risks || [],
    };

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <header>
                    <div className="flex justify-between items-center">
                        <div>
                             <p className="text-primary font-semibold mb-1">Analysis Report</p>
                             <h1 className="text-3xl font-bold font-heading">{analysis.decisionQuestion}</h1>
                        </div>
                        <Badge variant={isCompleted ? "secondary" : "default"} className={isCompleted ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"}>
                            {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                        </Badge>
                    </div>
                     <p className="text-muted-foreground mt-2">Analysis created on {new Date(analysis.createdAt).toLocaleDateString()}</p>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Primary Recommendation */}
                        <Card>
                             <CardHeader>
                                <CardTitle>Primary Recommendation</CardTitle>
                             </CardHeader>
                             <CardContent>
                                <p className="text-xl font-semibold text-primary">{displayData.primaryRecommendation}</p>
                             </CardContent>
                        </Card>

                        {/* Executive Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Executive Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p>{displayData.executiveSummary}</p>
                            </CardContent>
                        </Card>
                        
                        {isCompleted && (
                            <>
                            {/* Data Visualization */}
                            <Card>
                                 <CardHeader>
                                    <CardTitle>Key Metric Comparison</CardTitle>
                                    <CardDescription>ROI (in millions) and Total Addressable Market (in millions)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="w-full h-[250px]">
                                        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
                                            <CartesianGrid horizontal={false} />
                                            <YAxis dataKey="factor" type="category" tickLine={false} tickMargin={10} axisLine={false} hide/>
                                            <XAxis dataKey="value" type="number" hide />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Bar dataKey="value" radius={5}>
                                                <LabelList
                                                    position="right"
                                                    offset={8}
                                                    className="fill-foreground"
                                                    fontSize={12}
                                                />
                                                 <LabelList
                                                    dataKey="factor"
                                                    position="insideLeft"
                                                    offset={8}
                                                    className="fill-background"
                                                    fontSize={12}
                                                />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Risk Analysis */}
                            <Card>
                                 <CardHeader>
                                    <CardTitle>Risk Analysis & Mitigation</CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <ul className="space-y-4">
                                        {displayData.risks.map((r, i) => (
                                            <li key={i} className="p-3 bg-muted/50 rounded-lg">
                                                <p className="font-semibold">{r.risk}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="text-primary font-medium">Mitigation:</span> {r.mitigation}
                                                </p>
                                            </li>
                                        ))}
                                     </ul>
                                 </CardContent>
                            </Card>
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Confidence Score</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                 <p className="text-6xl font-bold text-primary">{displayData.confidenceScore}%</p>
                                 <p className="text-sm text-muted-foreground mt-2">Based on data integrity and model consensus</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                               <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                               <Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                               <Button variant="outline" size="sm"><Archive className="mr-2 h-4 w-4" /> Archive</Button>
                            </CardContent>
                        </Card>

                         <Card>
                            <CardHeader>
                                <CardTitle>Human Feedback & Refinement</CardTitle>
                                <CardDescription>Your feedback improves Pollitago's accuracy.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="space-y-4">
                                  <div>
                                     <p className="text-sm font-medium mb-2">Was this analysis helpful?</p>
                                     <div className="flex gap-2">
                                        <Button variant="outline" size="icon"><ThumbsUp/></Button>
                                        <Button variant="outline" size="icon"><ThumbsDown/></Button>
                                     </div>
                                  </div>
                                  <div>
                                     <Textarea placeholder="Provide additional context or feedback..." />
                                  </div>
                               </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">Submit Feedback</Button>
                            </CardFooter>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}
