"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Link2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { monetizeAffiliateLinks } from '@/ai/flows/monetize-affiliate-links';

const pollFormSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters.").max(500),
  description: z.string().max(500).optional(),
  options: z.array(z.object({
    text: z.string().min(1, "Option text cannot be empty.").max(220),
    affiliateLink: z.string().url().optional().or(z.literal('')),
  })).min(2, "You must have at least 2 options.").max(4),
  timer: z.string().min(1, "Please select a timer duration."),
  pledge: z.coerce.number().min(0).optional(),
});

type PollFormValues = z.infer<typeof pollFormSchema>;

export default function CreatePollPage() {
  const [optionCount, setOptionCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: '',
      description: '',
      options: [{ text: '', affiliateLink: '' }, { text: '', affiliateLink: '' }],
      timer: '1d',
    },
  });

  const addOption = () => {
    if (optionCount < 4) {
      const newCount = optionCount + 1;
      setOptionCount(newCount);
      form.setValue('options', [...form.getValues('options'), { text: '', affiliateLink: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (optionCount > 2) {
      setOptionCount(optionCount - 1);
      const options = form.getValues('options');
      options.splice(index, 1);
      form.setValue('options', options);
    }
  };

  async function onSubmit(data: PollFormValues) {
    setIsSubmitting(true);
    toast({
      title: "Creating your poll...",
      description: "Running analysis for affiliate links.",
    });

    try {
        const optionsWithoutLinks = data.options.filter(opt => !opt.affiliateLink);
        const optionTexts = optionsWithoutLinks.map(opt => opt.text);

        let monetizedOptions: string[] = [];
        if (optionTexts.length > 0) {
            const result = await monetizeAffiliateLinks({
                pollQuestion: data.question,
                options: optionTexts,
            });
            monetizedOptions = result.monetizedOptions;
        }

        let monetizedIndex = 0;
        const finalOptions = data.options.map(opt => {
            if (!opt.affiliateLink && monetizedIndex < monetizedOptions.length) {
                // This is a simplified example. A real implementation would parse the monetized string to extract the link.
                // Assuming the AI returns the original text with a link appended like "text [link]".
                const monetizedText = monetizedOptions[monetizedIndex++];
                const linkMatch = monetizedText.match(/\[(https?:\/\/[^\]]+)\]/);
                if (linkMatch) {
                    return { ...opt, text: monetizedText.replace(linkMatch[0], '').trim(), affiliateLink: linkMatch[1] };
                }
                return { ...opt, text: monetizedText };
            }
            return opt;
        });

      const finalPollData = { ...data, options: finalOptions };

      console.log("Final Poll Data:", finalPollData);

      toast({
        title: "Poll Created!",
        description: "Your poll is now live. We've added some affiliate links to help you monetize.",
        variant: "default",
      });

      form.reset();
      setOptionCount(2);

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
          <CardTitle className="font-headline text-2xl">Create a New Poll</CardTitle>
          <CardDescription>Ask a question and get the world's 2nd opinion.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poll Question (max 500 chars)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Which sneaker should I buy?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <FormLabel>Options (2-4 options, max 220 chars each)</FormLabel>
                {Array.from({ length: optionCount }).map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`options.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                           <Button type="button" variant="ghost" size="icon" className="text-muted-foreground"><ImageIcon className="h-5 w-5"/></Button>
                           <Input placeholder={`Option ${index + 1}`} {...field} />
                           <Button type="button" variant="ghost" size="icon" className="text-muted-foreground"><Link2 className="h-5 w-5"/></Button>
                           {optionCount > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}><Trash2 className="h-5 w-5 text-destructive"/></Button>}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                 {optionCount < 4 && (
                    <Button type="button" variant="outline" onClick={addOption}>Add Option</Button>
                )}
              </div>
              
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
                                <SelectItem value="3d">3 days</SelectItem>
                                <SelectItem value="7d">7 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
              />

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
