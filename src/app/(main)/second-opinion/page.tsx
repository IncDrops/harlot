"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Video, ShieldCheck, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const secondOpinionFormSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters.").max(140),
  image1: z.any().optional(),
  image2: z.any().optional(),
  video: z.any().optional(),
  timer: z.string().min(1, "Please select a timer duration."),
  pledged: z.boolean().default(false),
  pledgeAmount: z.number().optional(),
  isNSFW: z.boolean().default(false),
}).refine(data => data.pledged ? data.pledgeAmount && data.pledgeAmount > 0 : true, {
    message: "Pledge amount is required when pledging.",
    path: ["pledgeAmount"],
});

type SecondOpinionFormValues = z.infer<typeof secondOpinionFormSchema>;

export default function CreateSecondOpinionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SecondOpinionFormValues>({
    resolver: zodResolver(secondOpinionFormSchema),
    defaultValues: {
      question: '',
      timer: '1d',
      pledged: false,
      isNSFW: false,
    },
  });
  
  const isPledged = form.watch('pledged');

  async function onSubmit(data: SecondOpinionFormValues) {
    setIsSubmitting(true);
    toast({
      title: "Creating your 2nd Opinion poll...",
      description: "This might take a moment.",
    });

    try {
      console.log("Form Data:", data);

      toast({
        title: "Poll Created!",
        description: "Your 2nd opinion poll is now live.",
        variant: "default",
      });

      form.reset();

    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Could not create poll. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Get a 2nd Opinion</CardTitle>
          <CardDescription>Compare two images or get feedback on a video.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question (max 140 chars)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Which photo for my dating profile?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormItem>
                    <FormLabel>Option A</FormLabel>
                    <FormControl>
                        <Button type="button" variant="outline" className="w-full h-32 flex-col">
                            <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground"/>
                            <span>Upload Image</span>
                        </Button>
                    </FormControl>
                 </FormItem>
                 <FormItem>
                    <FormLabel>Option B</FormLabel>
                    <FormControl>
                        <Button type="button" variant="outline" className="w-full h-32 flex-col">
                            <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground"/>
                            <span>Upload Image</span>
                        </Button>
                    </FormControl>
                 </FormItem>
              </div>

               <FormItem>
                    <FormLabel>Or upload a video (max 60s)</FormLabel>
                    <FormControl>
                        <Button type="button" variant="outline" className="w-full h-24 flex-col">
                            <Video className="h-8 w-8 mb-2 text-muted-foreground"/>
                            <span>Upload Video</span>
                        </Button>
                    </FormControl>
                 </FormItem>
              
              <FormField
                control={form.control}
                name="timer"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Poll Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Set a timer" /></SelectTrigger>
                            </FormControl>
                             <SelectContent>
                                <SelectItem value="5m">5 minutes</SelectItem>
                                <SelectItem value="1h">1 hour</SelectItem>
                                <SelectItem value="1d">1 day</SelectItem>
                                <SelectItem value="7d">7 days</SelectItem>
                                <SelectItem value="30d">30 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
              />

              <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="pledged"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Pre-Commitment Pledge</FormLabel>
                           <FormDescription>
                            Pledge to honor the majority vote. This activates tipping.
                          </FormDescription>
                        </div>
                        <FormControl>
                           <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {isPledged && (
                    <FormField
                      control={form.control}
                      name="pledgeAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pledge Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 20" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="isNSFW"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> NSFW Content</FormLabel>
                          <FormDescription>
                            Mark this poll as not safe for work.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
               <motion.div whileTap={{ scale: 0.98 }}>
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Submitting...' : 'Poll it & Go'}
                    </Button>
               </motion.div>
              <p className="text-xs text-center text-muted-foreground">
                Poll responsibly, the ultimate choice still belongs to you.
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
