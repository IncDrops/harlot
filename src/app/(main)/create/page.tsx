
"use client";

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Link2, Trash2, Flame, ShieldCheck, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

const pollFormSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters.").max(500),
  description: z.string().max(500).optional(),
  options: z.array(z.object({
    text: z.string().min(1, "Option text cannot be empty.").max(220),
    affiliateLink: z.string().url().optional().or(z.literal('')),
    image: z.any().optional(),
  })).min(2, "You must have at least 2 options.").max(4),
  video: z.any().optional(),
  timer: z.string().min(1, "Please select a timer duration."),
  pledged: z.boolean().default(false),
  pledgeAmount: z.number().optional(),
  isNSFW: z.boolean().default(false).optional(),
}).refine(data => data.pledged ? data.pledgeAmount && data.pledgeAmount > 0 : true, {
    message: "Pledge amount is required when pledging.",
    path: ["pledgeAmount"],
});

type PollFormValues = z.infer<typeof pollFormSchema>;

export default function CreatePollPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [optionImagePreviews, setOptionImagePreviews] = useState<(string | null)[]>([]);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const optionImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: '',
      description: '',
      options: [{ text: '', affiliateLink: '' }, { text: '', affiliateLink: '' }],
      timer: '1d',
      pledged: false,
      isNSFW: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  const isPledged = form.watch('pledged');

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        form.setValue('video', file);
        setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleOptionImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = e.target.files?.[0];
      if (file) {
          form.setValue(`options.${index}.image`, file);
          const newPreviews = [...optionImagePreviews];
          newPreviews[index] = URL.createObjectURL(file);
          setOptionImagePreviews(newPreviews);
      }
  }

  async function onSubmit(data: PollFormValues) {
    setIsSubmitting(true);
    toast({
      title: "Creating your poll...",
      description: "Uploading media and setting things up.",
    });

    try {
      const uploadedImageUrls: (string | undefined)[] = await Promise.all(
          data.options.map(async (option) => {
              if (option.image && option.image instanceof File) {
                  const filePath = `polls/images/${uuidv4()}-${option.image.name}`;
                  return await uploadFile(option.image, filePath);
              }
              return undefined;
          })
      );

      let uploadedVideoUrl: string | undefined = undefined;
      if (data.video && data.video instanceof File) {
          const filePath = `polls/videos/${uuidv4()}-${data.video.name}`;
          uploadedVideoUrl = await uploadFile(data.video, filePath);
      }

      const finalPollData = {
          ...data,
          videoUrl: uploadedVideoUrl,
          options: data.options.map((opt, index) => ({
              text: opt.text,
              affiliateLink: opt.affiliateLink,
              imageUrl: uploadedImageUrls[index],
          })),
      };
      
      // In a real app, you'd save `finalPollData` to your database (e.g., Firestore) here.
      console.log("Final Poll Data with URLs:", finalPollData);

      toast({
        title: "Poll Created!",
        description: "Your poll is now live.",
        variant: "default",
      });

      form.reset();
      setVideoPreview(null);
      setOptionImagePreviews([]);

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
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`options.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                             <Input type="file" ref={(el) => (optionImageInputRefs.current[index] = el)} onChange={(e) => handleOptionImageChange(e, index)} accept="image/*" className="hidden" />
                             <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" title="Add Image to Option" onClick={() => optionImageInputRefs.current[index]?.click()}><ImageIcon className="h-5 w-5"/></Button>
                             {optionImagePreviews[index] ? <Image src={optionImagePreviews[index]} alt={`option ${index+1} preview`} width={32} height={32} className="rounded-md object-cover" /> : null}
                             <Input placeholder={`Option ${index + 1}`} {...field} />
                             <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" title="Add Affiliate Link"><Link2 className="h-5 w-5"/></Button>
                             {fields.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-5 w-5 text-destructive"/></Button>}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                 {fields.length < 4 && (
                    <Button type="button" variant="outline" onClick={() => append({ text: "", affiliateLink: "" })}>Add Option</Button>
                )}
              </div>

               <FormItem>
                    <FormLabel>Add a video to your poll (optional, max 60s)</FormLabel>
                    <FormControl>
                      <div>
                        <Input type="file" ref={videoInputRef} onChange={handleVideoChange} accept="video/*" className="hidden" />
                        <Button type="button" variant="outline" className="w-full h-24 flex-col" onClick={() => videoInputRef.current?.click()}>
                            <Video className="h-8 w-8 mb-2 text-muted-foreground"/>
                            <span>Upload Video</span>
                        </Button>
                      </div>
                    </FormControl>
                    {videoPreview && <video src={videoPreview} controls className="w-full rounded-md mt-2 aspect-video" />}
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
                                <SelectItem value="6h">6 hours</SelectItem>
                                <SelectItem value="1d">1 day</SelectItem>
                                <SelectItem value="3d">3 days</SelectItem>
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
                            <Input type="number" placeholder="e.g., 50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
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
