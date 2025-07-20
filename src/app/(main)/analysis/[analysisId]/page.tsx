
"use client";

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Share2, FileDown, Archive } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";

// Mock data - in a real app, you'd fetch this based on params.analysisId
const mockAnalysis = {
    id: "1",
    decisionQuestion: "Should we invest in expanding to Market X or Market Y?",
    status: "completed",
    completedAt: "2024-07-28T10:00:00Z",
    primaryRecommendation: "Proceed with Market Y based on projected growth, higher TAM, and manageable risk factors.",
    confidenceScore: 88,
    executiveSummary: "After analyzing financial projections, market research data, and CRM trends, Pollitago recommends prioritizing entry into Market Y. While Market X offers lower initial costs, Market Y presents a significantly larger Total Addressable Market (TAM) and a 25% higher projected 5-year ROI. Key success factors include aggressive digital marketing and securing a local distribution partner.",
    keyFactors: [
        { factor: "Projected 5-Year ROI", impact: 95, value: "+25% vs Market X" },
        { factor: "Total Addressable Market", impact: 92, value: "$500M" },
        { factor: "Competitive Saturation", impact: 75, value: "Moderate" },
        { factor: "Regulatory Risk", impact: 60, value: "Low" },
    ],
    risks: [
        { risk: "Higher initial marketing spend", mitigation: "Phase campaign rollout over 6 months." },
        { risk: "Potential supply chain disruption", mitigation: "Vet and onboard two local distribution partners." },
    ]
};

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


export default function AnalysisReportPage({ params }: { params: { analysisId: string } }) {
    
    // In a real app, you would use params.analysisId to fetch the specific analysis.
    // If not found, you'd call notFound().
    const analysis = mockAnalysis;
    if (!analysis) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <header>
                    <p className="text-primary font-semibold mb-1">Analysis Report</p>
                    <h1 className="text-3xl font-bold font-heading">{analysis.decisionQuestion}</h1>
                    <p className="text-muted-foreground mt-2">Analysis completed on {new Date(analysis.completedAt).toLocaleDateString()}</p>
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
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p>{analysis.executiveSummary}</p>
                            </CardContent>
                        </Card>
                        
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
                                    {analysis.risks.map((r, i) => (
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
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Confidence Score</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                 <p className="text-6xl font-bold text-primary">{analysis.confidenceScore}%</p>
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
