
"use client";

import type { Analysis } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from 'date-fns';
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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
            <CardTitle className="text-base font-semibold line-clamp-2">{analysis.decisionQuestion}</CardTitle>
            <Badge variant={isCompleted ? "secondary" : "default"} className={cn("flex-shrink-0", isCompleted ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30")}>
                {analysis.status === 'in_progress' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
            </Badge>
            </div>
            <CardDescription className="text-xs">
             Created {formatDistanceToNowStrict(new Date(analysis.createdAt), { addSuffix: true })}
            </CardDescription>
        </CardHeader>
        {isCompleted && analysis.primaryRecommendation && (
            <CardContent>
            <p className="text-sm mb-2 line-clamp-2">{analysis.primaryRecommendation}</p>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-28">Confidence</span>
                <Progress value={analysis.confidenceScore || 0} className="w-full h-2" />
                <span className="text-sm font-bold">{analysis.confidenceScore || 0}%</span>
            </div>
            </CardContent>
        )}
        </Card>
    </Link>
  );
}
