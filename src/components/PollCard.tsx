
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, PanInfo } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { Heart, MessageCircle, Gift, Share2, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

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
import { toggleLikeOnPoll, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: number) => void;
  onSwipe: (direction: 'left' | 'right') => void;
  showResults: boolean;
  isTwoOptionPoll: boolean;
  votedOptionId?: number | null;
}

const MotionCard = motion(Card);

export function PollCard({ poll, onVote, onSwipe, showResults, isTwoOptionPoll, votedOptionId }: PollCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(poll.likes);

  const { user: creator, loading: creatorLoading } = useUser(poll.creatorId);

  useEffect(() => {
    // Check if the current user has liked this poll
    if (user) {
      const likeRef = doc(db, 'polls', poll.id, 'likes', user.uid);
      getDoc(likeRef).then(docSnap => {
        if (docSnap.exists()) {
          setIsLiked(true);
        }
      });
    }
  }, [user, poll.id]);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!poll.endsAt) return;

    const end = new Date(poll.endsAt);
    
    const calculateTimeLeft = () => {
        const difference = end.getTime() - new Date().getTime();
        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            });
        } else {
            setTimeLeft(null);
            if(interval) clearInterval(interval);
        }
    }

    const interval = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial calculation

    return () => clearInterval(interval);
  }, [poll.endsAt]);


  const renderTimer = () => {
    if (!timeLeft) {
      return <span className="text-muted-foreground">Poll ended</span>;
    }

    const { days, hours, minutes, seconds } = timeLeft;
    const totalSecondsRemaining = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    const isEndingSoon = totalSecondsRemaining > 0 && totalSecondsRemaining < 60;

    let displayString = "";
    if (days > 0) {
      displayString = `${days}d ${hours}h left`;
    } else if (hours > 0) {
      displayString = `${hours}h ${minutes}m left`;
    } else if (minutes > 0) {
      displayString = `${minutes}m ${seconds}s left`;
    } else {
      displayString = `${seconds}s left`;
    }

    return (
      <span className={cn(isEndingSoon ? 'text-destructive font-bold' : 'text-muted-foreground')}>
        {displayString}
      </span>
    );
  };

  const totalVotes = useMemo(() => {
    return poll.options.reduce((acc, option) => acc + option.votes, 0);
  }, [poll.options]);

  const handleLike = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to like a poll.' });
      return;
    }
    // Optimistic update
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;
    
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      await toggleLikeOnPoll(poll.id, user.uid);
    } catch (error) {
      // Revert on error
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
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
          {poll.options.map((option, index) => (
            <div key={`${poll.id}-option-${option.id || index}`} className="relative aspect-square cursor-pointer group" onClick={() => !showResults && onVote(poll.id, option.id)}>
              {option.imageUrl && (
                <Image src={option.imageUrl} alt={option.text} layout="fill" className="rounded-2xl object-cover" data-ai-hint={option['dataAiHint'] || 'comparison abstract'} />
              )}
              {!showResults && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-lg font-bold text-center p-2">{option.text}</span>
                </div>
              )}
              {showResults && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl flex-col p-2">
                  <span className="text-white text-3xl font-bold font-headline">
                    {totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0}%
                  </span>
                  <span className="text-white/80 text-sm mb-2">{option.votes} votes</span>
                   {showResults && votedOptionId === option.id && (
                    <Badge variant="outline" className="bg-white/20 text-white backdrop-blur-sm border-white/50 text-xs">
                        <Check className="h-3 w-3 mr-1" /> Voted
                    </Badge>
                  )}
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
            {poll.options.map((option: PollOption, index) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div key={`${poll.id}-option-${option.id || index}`}>
                  {showResults ? (
                     <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="font-semibold flex items-center gap-2">
                           {option.text}
                           {showResults && votedOptionId === option.id && (
                                <Badge variant="secondary" className="text-xs">
                                    <Check className="h-3 w-3 mr-1" /> You voted
                                </Badge>
                            )}
                        </span>
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
      <MotionCard
        className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full max-w-2xl mx-auto bg-card"
        drag={isTwoOptionPoll && !showResults ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <Link href={`/profile/${creator.username}`} passHref>
                    <Avatar className="h-12 w-12 border-2 border-primary/50 cursor-pointer">
                        {creator.avatar && <AvatarImage src={creator.avatar} alt={creator.username} data-ai-hint="anime avatar" />}
                        <AvatarFallback>{creator.displayName[0]}</AvatarFallback>
                    </Avatar>
                    </Link>
                    <div>
                    <Link href={`/profile/${creator.username}`} passHref>
                        <CardTitle className="text-base font-bold font-headline hover:underline cursor-pointer">{creator.displayName}</CardTitle>
                    </Link>
                    <CardDescription className="text-xs">
                        @{creator.username} · {formatDistanceToNowStrict(new Date(poll.createdAt), { addSuffix: true })}
                    </CardDescription>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    {poll.pledged && poll.pledgeAmount && poll.pledgeAmount > 0 ? (
                    <Badge variant="default" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80">
                        Pledged ${poll.pledgeAmount.toFixed(2)}
                    </Badge>
                    ) : poll.pledged ? (
                        <Badge variant="default" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80">Pledged</Badge>
                    ) : null}
                    <div className="text-xs mt-1">
                    {renderTimer()}
                    </div>
                </div>
            </div>
             <Link href={`/poll/${poll.id}`} className="block cursor-pointer pt-4">
                <p className="font-body text-lg leading-relaxed hover:underline">{poll.question}</p>
                {poll.description && <p className="text-sm text-muted-foreground pt-1">{poll.description}</p>}
             </Link>
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
      </MotionCard>
      <CommentSheet pollId={poll.id} isOpen={isCommentSheetOpen} onOpenChange={setIsCommentSheetOpen} />
      {poll.pledged && creator && <TipDialog poll={poll} creator={creator} isOpen={isTipDialogOpen} onOpenChange={setIsTipDialogOpen} />}
    </>
  );
}
