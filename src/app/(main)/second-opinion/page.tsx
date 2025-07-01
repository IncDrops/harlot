
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Video, ShieldCheck, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { uploadFile, createPoll } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import type { Poll } from '@/lib/types';

const secondOpinionFormSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters.").max(140),
  image1: z.any().refine(file => file, "Image A is required."),
  image2: z.any().refine(file => file, "Image B is required."),
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

const getTimerDetails = (timerString: string) => {
    const value = parseInt(timerString.slice(0, -1));
    const unit = timerString.slice(-1);
    let durationMs = 0;
    if (unit === 'm') durationMs = value * 60 * 1000;
    if (unit === 'h') durationMs = value * 60 * 60 * 1000;
    if (unit === 'd') durationMs = value * 24 * 60 * 60 * 1000;
    
    const endsAt = new Date(Date.now() + durationMs).toISOString();
    return { durationMs, endsAt };
};

export default function CreateSecondOpinionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  const image1InputRef = useRef<HTMLInputElement>(null);
  const image2InputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image1' | 'image2' | 'video') => {
      const file = e.target.files?.[0];
      if (file) {
          form.setValue(fieldName, file);
          const previewUrl = URL.createObjectURL(file);
          if (fieldName === 'image1') setImage1Preview(previewUrl);
          if (fieldName === 'image2') setImage2Preview(previewUrl);
          if (fieldName === 'video') setVideoPreview(previewUrl);
      }
  };

  async function onSubmit(data: SecondOpinionFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to create a poll.' });
        return;
    }
    setIsSubmitting(true);
    toast({
      title: "Creating your 2nd Opinion poll...",
      description: "Uploading media and setting things up.",
    });

    try {
      const uploadPromises = [];
      
      let image1Url, image2Url, videoUrl;

      if (data.image1 instanceof File) {
          const filePath = `polls/images/${uuidv4()}-${data.image1.name}`;
          uploadPromises.push(uploadFile(data.image1, filePath).then(url => image1Url = url));
      }
      if (data.image2 instanceof File) {
          const filePath = `polls/images/${uuidv4()}-${data.image2.name}`;
          uploadPromises.push(uploadFile(data.image2, filePath).then(url => image2Url = url));
      }
      if (data.video instanceof File) {
          const filePath = `polls/videos/${uuidv4()}-${data.video.name}`;
          uploadPromises.push(uploadFile(data.video, filePath).then(url => videoUrl = url));
      }

      await Promise.all(uploadPromises);

      const { durationMs, endsAt } = getTimerDetails(data.timer);

      const finalPollData: Omit<Poll, 'id'> = {
        creatorId: user.uid,
        question: data.question,
        description: '',
        options: [
            { id: 1, text: 'Option A', imageUrl: image1Url || null, votes: 0 },
            { id: 2, text: 'Option B', imageUrl: image2Url || null, votes: 0 },
        ],
        videoUrl: videoUrl,
        type: '2nd_opinion',
        createdAt: new Date().toISOString(),
        endsAt: endsAt,
        durationMs: durationMs,
        pledged: data.pledged,
        pledgeAmount: data.pledged ? data.pledgeAmount : 0,
        tipCount: 0,
        isNSFW: data.isNSFW || false,
        isProcessed: false,
        category: 'Comparison',
        likes: 0,
        comments: 0,
      };
      
      await createPoll(finalPollData);

      toast({
        title: "Poll Created!",
        description: "Your 2nd opinion poll is now live.",
        variant: "default",
      });

      router.push('/');

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

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading...</p>
      </div>
    );
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
                 <FormField control={form.control} name="image1" render={() => (
                    <FormItem>
                        <FormLabel>Option A</FormLabel>
                        <FormControl>
                             <div>
                                 <Input type="file" ref={image1InputRef} onChange={(e) => handleFileChange(e, 'image1')} accept="image/*" className="hidden" />
                                 <Button type="button" variant="outline" className="w-full h-32 border-2 border-dashed flex-col relative" onClick={() => image1InputRef.current?.click()}>
                                    {image1Preview ? <Image src={image1Preview} alt="Option A preview" fill className="object-cover rounded-lg" /> : <><ImageIcon className="h-8 w-8 mb-2"/><span>Upload Image</span></>}
                                 </Button>
                             </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                 )} />
                  <FormField control={form.control} name="image2" render={() => (
                    <FormItem>
                        <FormLabel>Option B</FormLabel>
                        <FormControl>
                           <div>
                               <Input type="file" ref={image2InputRef} onChange={(e) => handleFileChange(e, 'image2')} accept="image/*" className="hidden" />
                               <Button type="button" variant="outline" className="w-full h-32 border-2 border-dashed flex-col relative" onClick={() => image2InputRef.current?.click()}>
                                    {image2Preview ? <Image src={image2Preview} alt="Option B preview" fill className="object-cover rounded-lg" /> : <><ImageIcon className="h-8 w-8 mb-2"/><span>Upload Image</span></>}
                                </Button>
                           </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                 )} />
              </div>

               <FormItem>
                    <FormLabel>Or upload a video (optional, max 60s)</FormLabel>
                    <FormControl>
                        <div>
                            <Input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/*" className="hidden" />
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
