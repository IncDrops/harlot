
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Database, SlidersHorizontal, Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createAnalysis } from '@/lib/firebase';


const analysisFormSchema = z.object({
  decisionQuestion: z.string().min(10, "Please provide a clear question for the analysis."),
  decisionType: z.string().min(1, "Please select a decision type."),
  context: z.string().optional(),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

export default function NewDecisionAnalysisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      decisionQuestion: "",
      decisionType: "",
      context: "",
    },
  });


  async function onSubmit(data: AnalysisFormValues) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to start an analysis." });
        return;
    }

    setIsSubmitting(true);
    toast({
      title: "Generating Analysis...",
      description: "This may take a moment. Please wait.",
    });

    try {
      // The context now combines the decision type and any extra user context.
      const fullContext = `Decision Type: ${data.decisionType}. Additional Context: ${data.context || 'None provided.'}`;
      const analysisData = { ...data, context: fullContext };
      
      const analysisId = await createAnalysis(user.uid, analysisData);
      
      toast({
        title: "Analysis Generation Started!",
        description: "Redirecting you to the report page.",
      });

      router.push(`/analysis/${analysisId}`);
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate analysis. Please check the Genkit logs and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Create New Analysis</CardTitle>
          <CardDescription>Guide the AI by defining your strategic objective and parameters.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center mb-4"><BrainCircuit className="w-5 h-5 mr-2 text-primary" /> Define the Decision</h3>
                  <FormField
                    control={form.control}
                    name="decisionQuestion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decision Question / Objective</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Should we invest in expanding to Market X or Market Y?" {...field} />
                        </FormControl>
                        <FormDescription>This is the primary question the AI will analyze.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="decisionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decision Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a type..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="market-entry">Market Entry</SelectItem>
                            <SelectItem value="resource-allocation">Resource Allocation</SelectItem>
                            <SelectItem value="product-launch">Product Launch</SelectItem>
                            <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Categorizing the decision helps the AI provide a more focused analysis.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="context"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Context (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Provide any relevant background information, KPIs, constraints, or stakeholders..." {...field} />
                        </FormControl>
                         <FormDescription>The more context you provide, the more accurate the analysis will be.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                 <section>
                    <h3 className="text-lg font-semibold flex items-center mb-4"><Database className="w-5 h-5 mr-2 text-primary" /> Data Sources</h3>
                    <div className="p-4 bg-muted/50 rounded-lg border flex items-center gap-3">
                      <Info className="w-5 h-5 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Pollitago currently generates insights based on its internal knowledge base. Live data source integration can be configured on the <a href="/data-sources" className="underline font-semibold hover:text-primary">Data Sources</a> page.
                      </p>
                    </div>
                 </section>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  "Generate Analysis"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
