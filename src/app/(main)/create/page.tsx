
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
import { ArrowRight, BrainCircuit, Database, SlidersHorizontal, Info } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createAnalysis } from '@/lib/firebase';

const analysisFormSchema = z.object({
  decisionQuestion: z.string().min(10, "Please provide a clear question for the analysis."),
  decisionType: z.string().min(1, "Please select a decision type."),
  stakeholders: z.string().optional(),
  kpis: z.string().optional(),
  budget: z.number().optional(),
  timeline: z.string().optional(),
  riskAppetite: z.string().optional(),
  dataSources: z.array(z.string()).min(1, "Please select at least one data source."),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

export default function NewDecisionAnalysisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      decisionQuestion: "",
      dataSources: [],
    },
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  async function onSubmit(data: AnalysisFormValues) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to start an analysis." });
        return;
    }

    setIsSubmitting(true);
    toast({
      title: "Initiating Analysis...",
      description: "Your request is being sent to the Pollitago AI engine.",
    });

    try {
      const analysisId = await createAnalysis(user.uid, data);
      
      toast({
        title: "Analysis Started!",
        description: "You will be notified upon completion. Estimated time: 5 minutes.",
      });

      // Navigate to the newly created analysis page
      router.push(`/analysis/${analysisId}`);
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start analysis. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">New Decision Analysis</CardTitle>
          <CardDescription>Guide the AI by defining your strategic objective and parameters.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              {step === 1 && (
                <section>
                  <h3 className="text-lg font-semibold flex items-center mb-4"><BrainCircuit className="w-5 h-5 mr-2 text-primary" /> Step 1: Define the Decision</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="decisionQuestion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decision Question / Objective</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Should we invest in expanding to Market X or Market Y?" {...field} />
                          </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <h3 className="text-lg font-semibold flex items-center mb-4"><SlidersHorizontal className="w-5 h-5 mr-2 text-primary" /> Step 2: Input Key Parameters</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Budget ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g. 500000" {...field} onChange={e => field.onChange(parseInt(e.target.value))}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="riskAppetite"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Risk Appetite</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select risk level..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                   </div>
                </section>
              )}

              {step === 3 && (
                 <section>
                    <h3 className="text-lg font-semibold flex items-center mb-4"><Database className="w-5 h-5 mr-2 text-primary" /> Step 3: Select Data Sources</h3>
                    <FormField
                        control={form.control}
                        name="dataSources"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base">Integrated Sources</FormLabel>
                                    <FormDescription>Select the datasets for the AI to analyze.</FormDescription>
                                </div>
                                {['CRM Data', 'ERP System', 'Financial Reports', 'Market Research DB'].map((item) => (
                                    <FormField
                                    key={item}
                                    control={form.control}
                                    name="dataSources"
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={item}
                                            className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md"
                                        >
                                            <FormControl>
                                            <input
                                                type="checkbox"
                                                className="mt-1 h-4 w-4"
                                                checked={field.value?.includes(item)}
                                                onChange={(e) => {
                                                    return e.target.checked
                                                    ? field.onChange([...(field.value || []), item])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>{item}</FormLabel>
                                                <FormDescription className="flex items-center text-xs">
                                                   <Info className="w-3 h-3 mr-1" /> Last sync: 2 hours ago
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </section>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {step > 1 && <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>}
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-muted-foreground">Step {step} of 3</span>
                {step < 3 && <Button type="button" onClick={nextStep}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>}
                {step === 3 && <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Initiating..." : "Confirm & Initiate Analysis"}</Button>}
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
