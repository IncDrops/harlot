
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
import { ArrowRight, BrainCircuit, Database, SlidersHorizontal, Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createAnalysis } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';


const analysisFormSchema = z.object({
  decisionQuestion: z.string().min(10, "Please provide a clear question for the analysis."),
  decisionType: z.string().min(1, "Please select a decision type."),
  dataSources: z.array(z.string()).min(1, "Please select at least one data source."),
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
      dataSources: [],
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
      // The createAnalysis function now calls the AI and saves to Firestore
      const analysisId = await createAnalysis(user.uid, data);
      
      toast({
        title: "Analysis Complete!",
        description: "Your new analysis is ready for review.",
      });

      // Navigate to the newly created analysis page
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
          <CardTitle className="font-heading text-2xl">New Decision Analysis</CardTitle>
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
                </section>

                 <section>
                    <h3 className="text-lg font-semibold flex items-center mb-4"><Database className="w-5 h-5 mr-2 text-primary" /> Select Data Sources</h3>
                    <FormField
                        control={form.control}
                        name="dataSources"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base">Integrated Sources</FormLabel>
                                    <FormDescription>Select the datasets for the AI to analyze.</FormDescription>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                              <Checkbox
                                                  checked={field.value?.includes(item)}
                                                  onCheckedChange={(checked) => {
                                                      return checked
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
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
