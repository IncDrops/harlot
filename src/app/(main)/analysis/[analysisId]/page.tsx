
"use client";

import { useEffect, useState, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Share2, FileDown, Archive, Loader2, Info, BrainCircuit } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { addFeedbackToAnalysis, getAnalysisById, updateAnalysisStatus } from "@/lib/firebase";
import type { Analysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

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
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Feedback state
    const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'unhelpful' | null>(null);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Action state
    const [isArchiving, setIsArchiving] = useState(false);


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
    
    const handleFeedbackSubmit = async () => {
        if (!user || !analysisId || !feedbackRating) {
            toast({ variant: "destructive", title: "Error", description: "You must select a rating to submit feedback." });
            return;
        }

        setIsSubmittingFeedback(true);
        try {
            await addFeedbackToAnalysis(analysisId, {
                userId: user.uid,
                analysisId: analysisId,
                rating: feedbackRating,
                text: feedbackText,
            });
            setFeedbackSubmitted(true);
            toast({ title: "Feedback Submitted", description: "Thank you for helping improve Pollitago." });
        } catch (error) {
            console.error("Failed to submit feedback", error);
            toast({ variant: "destructive", title: "Error", description: "Could not submit feedback. Please try again." });
        } finally {
            setIsSubmittingFeedback(false);
        }
    };
    
    const handleArchive = async () => {
        if (!analysis) return;
        setIsArchiving(true);
        try {
            await updateAnalysisStatus(analysis.id, 'archived');
            setAnalysis({ ...analysis, status: 'archived' });
            toast({ title: "Analysis Archived", description: "This analysis has been moved to your archive." });
        } catch (error) {
            console.error("Failed to archive analysis", error);
            toast({ variant: "destructive", title: "Error", description: "Could not archive the analysis." });
        } finally {
            setIsArchiving(false);
        }
    }

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast({ title: "Link Copied!", description: "The report URL has been copied to your clipboard." });
        }, (err) => {
            console.error('Could not copy text: ', err);
            toast({ variant: "destructive", title: "Error", description: "Could not copy the link." });
        });
    }


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
    const isInProgress = analysis.status === 'in_progress';
    const isArchived = analysis.status === 'archived';

    const getBadgeVariant = () => {
        switch(analysis.status) {
            case 'completed': return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
            case 'in_progress': return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
            case 'archived': return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30";
            default: return "secondary";
        }
    }

    if (isInProgress) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-3xl mx-auto">
                    <Card className="text-center p-8">
                        <CardHeader>
                            <BrainCircuit className="h-12 w-12 mx-auto text-primary animate-pulse" />
                            <CardTitle className="mt-4">Analysis in Progress</CardTitle>
                            <CardDescription>
                                Pollitago is analyzing your request: "{analysis.decisionQuestion}"
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">This may take a moment. The report will appear here once it's complete. You can safely leave this page and come back later.</p>
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mt-6" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

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
                        <Badge variant={"secondary"} className={cn(getBadgeVariant())}>
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
                               <Button variant="outline" size="sm" onClick={handleShare} disabled={isArchived}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                               <Button variant="outline" size="sm" disabled={true}><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                               <Button variant="outline" size="sm" onClick={handleArchive} disabled={isArchived || isArchiving}>
                                    {isArchiving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
                                    {isArchived ? 'Archived' : 'Archive'}
                               </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Human Feedback & Refinement</CardTitle>
                                <CardDescription>Your feedback improves Pollitago's accuracy.</CardDescription>
                            </CardHeader>
                           {!feedbackSubmitted ? (
                                <>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium mb-2">Was this analysis helpful?</p>
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant={feedbackRating === 'helpful' ? 'default' : 'outline'} 
                                                    size="icon"
                                                    onClick={() => setFeedbackRating('helpful')}
                                                    disabled={isArchived}
                                                >
                                                    <ThumbsUp/>
                                                </Button>
                                                <Button 
                                                    variant={feedbackRating === 'unhelpful' ? 'destructive' : 'outline'} 
                                                    size="icon"
                                                    onClick={() => setFeedbackRating('unhelpful')}
                                                    disabled={isArchived}
                                                >
                                                    <ThumbsDown/>
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Textarea 
                                                placeholder="Provide additional context or feedback..."
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                disabled={isArchived}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full" 
                                        onClick={handleFeedbackSubmit} 
                                        disabled={!feedbackRating || isSubmittingFeedback || isArchived}
                                    >
                                        {isSubmittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Feedback
                                    </Button>
                                </CardFooter>
                                </>
                           ) : (
                                <CardContent>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="font-semibold text-primary">Thank you for your feedback!</p>
                                    </div>
                                </CardContent>
                           )}
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}

    