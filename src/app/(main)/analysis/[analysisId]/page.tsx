
"use client";

import { useEffect, useState, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Share2, FileDown, Archive, Loader2, Info } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { getAnalysisById } from "@/lib/firebase";
import type { Analysis } from "@/lib/types";

const chartConfig = {
  value: {
    label: "Value",
  },
  factor: {
    label: "Factor"
  }
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
    
    const chartData = useMemo(() => {
        if (!analysis?.keyFactors) return [];
        return analysis.keyFactors.map((factor, index) => ({
          ...factor,
          fill: `hsl(var(--chart-${(index % 5) + 1}))`
        }))
    }, [analysis]);

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

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <header>
                    <div className="flex justify-between items-start">
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
                                <p className="text-xl font-semibold text-primary">{analysis.primaryRecommendation}</p>
                             </CardContent>
                        </Card>

                        {/* Executive Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Executive Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground">
                                <p>{analysis.executiveSummary}</p>
                            </CardContent>
                        </Card>
                        
                        {/* Data Visualization */}
                        <Card>
                             <CardHeader>
                                <CardTitle>Key Factor Analysis</CardTitle>
                                <CardDescription>Impact assessment of key factors (1=low, 5=high)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="w-full h-[250px]">
                                    <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 50 }}>
                                        <CartesianGrid horizontal={false} />
                                        <YAxis dataKey="factor" type="category" tickLine={false} tickMargin={10} axisLine={false} width={150} className="truncate"/>
                                        <XAxis dataKey="impact" type="number" hide />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Bar dataKey="impact" layout="vertical" radius={5}>
                                            <LabelList
                                                dataKey="factor"
                                                position="insideLeft"
                                                offset={8}
                                                className="fill-background font-semibold"
                                                fontSize={12}
                                            />
                                             <LabelList
                                                dataKey="impact"
                                                position="right"
                                                offset={8}
                                                className="fill-foreground font-bold"
                                                fontSize={14}
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
                                    {analysis.risks && analysis.risks.length > 0 ? (
                                        analysis.risks.map((r, i) => (
                                            <li key={i} className="p-4 bg-muted/50 rounded-lg border border-border/50">
                                                <p className="font-semibold text-foreground">{r.risk}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    <span className="text-primary font-medium">Mitigation:</span> {r.mitigation}
                                                </p>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground bg-muted/50 rounded-lg">
                                            <Info className="w-8 h-8 mb-2" />
                                            <p className="font-semibold">No significant risks identified.</p>
                                        </div>
                                    )}
                                 </ul>
                             </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <Card className="text-center bg-gradient-to-br from-primary/10 to-background">
                            <CardHeader>
                                <CardTitle>Confidence Score</CardTitle>
                                 <CardDescription>Based on data integrity and model consensus</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <div className="text-6xl font-bold text-primary relative">
                                    {analysis.confidenceScore}
                                    <span className="text-4xl opacity-80">%</span>
                                 </div>
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

