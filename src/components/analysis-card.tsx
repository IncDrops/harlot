
"use client";

import type { Analysis } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from 'date-fns';
import { Badge } from "./ui/badge";
import Link from "next/link";

interface AnalysisCardProps {
  analysis: Analysis;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const isCompleted = analysis.status === 'completed';
  
  return (
    <Link href={`/analysis/${analysis.id}`} passHref>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader>
            <div className="flex justify-between items-start">
            <CardTitle className="text-base font-semibold">{analysis.decisionQuestion}</CardTitle>
            <Badge variant={isCompleted ? "secondary" : "default"} className={cn(isCompleted ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30")}>
                {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
            </Badge>
            </div>
            <CardDescription className="text-xs">
            {isCompleted ? `Completed ${formatDistanceToNowStrict(new Date(analysis.completedAt), { addSuffix: true })}` : `Initiated recently`}
            </CardDescription>
        </CardHeader>
        {isCompleted && (
            <CardContent>
            <p className="text-sm mb-2 line-clamp-2">{analysis.primaryRecommendation}</p>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-28">Confidence</span>
                <Progress value={analysis.confidenceScore} className="w-full h-2" />
                <span className="text-sm font-bold">{analysis.confidenceScore}%</span>
            </div>
            </CardContent>
        )}
        </Card>
    </Link>
  );
}
