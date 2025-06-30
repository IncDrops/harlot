
"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, PanInfo } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { Heart, MessageCircle, Gift, Share2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CommentSheet } from '@/components/comment-sheet';
import { TipDialog } from '@/components/tip-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Poll, PollOption, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/use-user';
import { toggleLikeOnPoll } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: number) => void;
  onSwipe: (direction: 'left' | 'right') => void;
  showResults: boolean;
  isTwoOptionPoll: boolean;
  custom?: 'left' | 'right' | null;
}

export function PollCard({ poll, onVote, onSwipe, showResults, isTwoOptionPoll, custom }: PollCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(poll.likes);

  const { user: creator, loading: creatorLoading } = useUser(poll.creatorId);

  const totalVotes = useMemo(() => {
    return poll.options.reduce((acc, option) => acc + option.votes, 0);
  }, [poll.options]);

  const handleLike = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to like a poll.' });
      return;
    }
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    try {
      await toggleLikeOnPoll(String(poll.id), user.uid);
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      toast({ variant: 'destructive', title: 'Something went wrong.' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Poll: ${poll.question}`,
        text: `Vote on this poll on PollitAGo!`,
        url: `${window.location.origin}/poll/${poll.id}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.id}`);
      toast({ title: 'Link copied to clipboard!' });
    }
  };
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left');
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotate: 3 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotate: 0,
      transition: { duration: 0.5, ease: "easeOut" } 
    },
    exitLeft: { x: "-120%", opacity: 0, rotate: -15, transition: { duration: 0.8 } },
    exitRight: { x: "120%", opacity: 0, rotate: 15, transition: { duration: 0.8 } },
  };

  if (creatorLoading) {
    return (
        <Card className="rounded-2xl overflow-hidden shadow-lg w-full max-w-2xl mx-auto bg-card">
            <CardHeader>
                <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>
                <Skeleton className="h-5 w-full mt-4" />
                <Skeleton className="h-5 w-3/4 mt-1" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
             <CardFooter className="flex justify-around items-center border-t pt-2 pb-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
            </CardFooter>
        </Card>
    );
  }

  if (!creator) return null;

  const renderPollContent = () => {
    // 2nd opinion polls with images
    if (poll.type === '2nd_opinion' && poll.options[0]?.imageUrl && poll.options[1]?.imageUrl) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {poll.options.map((option) => (
            <div key={option.id} className="relative aspect-square cursor-pointer" onClick={() => !showResults && onVote(poll.id, option.id)}>
              {option.imageUrl && (
                <Image src={option.imageUrl} alt={option.text} layout="fill" className="rounded-2xl object-cover" data-ai-hint="comparison abstract" />
              )}
              {showResults && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl flex-col">
                  <span className="text-white text-3xl font-bold font-headline">
                    {totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0}%
                  </span>
                  <span className="text-white/80 text-sm">{option.votes} votes</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    // Standard polls
    return (
        <div className="space-y-2 mt-4">
            {poll.options.map((option: PollOption) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div key={option.id}>
                  {showResults ? (
                     <div className="space-y-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="font-semibold">{option.text}</span>
                        <span className="text-muted-foreground">{Math.round(percentage)}% ({option.votes})</span>
                      </div>
                      <Progress value={percentage} className="h-4 rounded-full" />
                     </div>
                  ) : (
                     <Button
                        variant="outline"
                        className="w-full justify-start p-4 h-auto text-left rounded-xl"
                        onClick={() => onVote(poll.id, option.id)}
                      >
                       {option.imageUrl && (
                          <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                            <Image src={option.imageUrl} alt={option.text} layout="fill" className="rounded-md object-cover" />
                          </div>
                        )}
                        {option.text}
                      </Button>
                  )}
                </div>
              )
            })}
          </div>
    );
  };

  return (
    <>
      <motion.div
        className="shadow-lg rounded-2xl"
        variants={cardVariants}
        initial="hidden"
        animate={custom ? (custom === 'left' ? 'exitLeft' : 'exitRight') : 'visible'}
        drag={isTwoOptionPoll && !showResults ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <Card className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full max-w-2xl mx-auto bg-card">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Link href={`/profile/${creator.username}`} passHref>
                <Avatar className="h-12 w-12 border-2 border-primary/50 cursor-pointer">
                  <AvatarImage src={creator.avatar} alt={creator.username} data-ai-hint="anime avatar" />
                  <AvatarFallback>{creator.name[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link href={`/profile/${creator.username}`} passHref>
                    <CardTitle className="text-base font-bold font-headline hover:underline cursor-pointer">{creator.name}</CardTitle>
                </Link>
                <CardDescription className="text-xs">
                  @{creator.username} · {formatDistanceToNowStrict(new Date(poll.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
              {poll.pledged && <Badge variant="default" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80">Pledged</Badge>}
            </div>
             <p className="font-body text-lg pt-4 leading-relaxed">{poll.question}</p>
             {poll.description && <p className="text-sm text-muted-foreground pt-1">{poll.description}</p>}
          </CardHeader>
          <CardContent>
            {poll.videoUrl && <video src={poll.videoUrl} controls className="w-full rounded-lg aspect-video mb-4" />}
            {renderPollContent()}
          </CardContent>
          <CardFooter className="flex justify-around items-center border-t pt-2 pb-2">
            <Button variant="ghost" size="sm" onClick={handleLike} className={cn('rounded-full', isLiked && 'text-red-500')}>
              <Heart className={cn("h-5 w-5", isLiked ? 'fill-current' : '')}/>
              <span className="ml-2 text-xs tabular-nums">{likeCount.toLocaleString()}</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setIsCommentSheetOpen(true)}>
              <MessageCircle className="h-5 w-5"/>
              <span className="ml-2 text-xs tabular-nums">{poll.comments.toLocaleString()}</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setIsTipDialogOpen(true)} disabled={!poll.pledged}>
              <Gift className="h-5 w-5"/>
              <span className="ml-2 text-xs tabular-nums">{poll.tipCount.toLocaleString()}</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={handleShare}>
              <Share2 className="h-5 w-5"/>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      <CommentSheet pollId={String(poll.id)} isOpen={isCommentSheetOpen} onOpenChange={setIsCommentSheetOpen} />
      {poll.pledged && creator && <TipDialog poll={poll} creator={creator} isOpen={isTipDialogOpen} onOpenChange={setIsTipDialogOpen} />}
    </>
  );
}
