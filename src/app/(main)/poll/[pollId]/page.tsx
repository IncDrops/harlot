
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { Heart, MessageCircle, Gift, Share2, Link as LinkIcon } from 'lucide-react';
import { db, getPollById, toggleLikeOnPoll } from '@/lib/firebase';
import type { Poll, PollOption } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSheet } from '@/components/comment-sheet';
import { TipDialog } from '@/components/tip-dialog';
import { cn } from '@/lib/utils';

export default function PollDetailPage() {
  const params = useParams();
  const pollId = params.pollId as string;
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedOptionId, setVotedOptionId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  
  const { user: creator, loading: creatorLoading } = useUser(poll?.creatorId);
  
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (poll) setLikeCount(poll.likes);
  }, [poll]);

  useEffect(() => {
    if (!pollId) return;

    const fetchPoll = async () => {
      setLoading(true);
      const pollData = await getPollById(pollId);
      if (pollData) {
        setPoll(pollData);
      } else {
        // We call notFound here if the poll ID itself is invalid
        return notFound();
      }
      setLoading(false);
    };

    fetchPoll();
  }, [pollId]);
  
  useEffect(() => {
    if (user && poll) {
      const likeRef = doc(db, 'polls', poll.id, 'likes', user.uid);
      getDoc(likeRef).then(docSnap => {
        if (docSnap.exists()) setIsLiked(true);
      });
      // In a real app, you'd check a 'votes' subcollection to see if user voted.
      // For now, client-side state `votedOptionId` will suffice.
    }
  }, [user, poll]);

  const totalVotes = useMemo(() => {
    if (!poll) return 0;
    return poll.options.reduce((acc, option) => acc + option.votes, 0);
  }, [poll]);

  const handleVote = (optionId: number) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Please log in to vote.' });
        return;
    }
    if (votedOptionId || !poll) return;

    // This is where you would call a Firebase function to cast a vote securely
    // For now, we'll do an optimistic update on the client
    setPoll(currentPoll => {
      if (!currentPoll) return null;
      const newPoll = { ...currentPoll };
      const optionIndex = newPoll.options.findIndex(o => o.id === optionId);
      if (optionIndex > -1) {
        newPoll.options[optionIndex].votes++;
      }
      return newPoll;
    });
    setVotedOptionId(optionId);
  };
  
   const handleLike = async () => {
    if (!user || !poll) {
      toast({ variant: 'destructive', title: 'You must be logged in to like a poll.' });
      return;
    }
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;
    
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      await toggleLikeOnPoll(poll.id, user.uid);
    } catch (error) {
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
      toast({ variant: 'destructive', title: 'Something went wrong.' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Poll: ${poll?.question}`,
        text: `Vote on this poll on PollitAGo!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const isPollEnded = poll && new Date(poll.endsAt) < new Date();
  const showResults = votedOptionId !== null || isPollEnded;

  // Show skeleton if the poll or its creator are still loading.
  if (loading || creatorLoading) {
    return (
      <div className="container mx-auto py-8 px-2 sm:px-4">
        <Card className="max-w-2xl mx-auto">
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
            <Skeleton className="h-40 w-full" />
          </CardContent>
          <CardFooter className="flex justify-around items-center border-t pt-2 pb-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // After all loading is finished, if either the poll or creator
  // data is missing, it's a genuine "Not Found" situation.
  if (!poll || !creator) {
    return notFound();
  }
  
  const renderPollContent = () => {
    if (poll.type === '2nd_opinion' && poll.options[0]?.imageUrl && poll.options[1]?.imageUrl) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {poll.options.map((option) => (
            <div key={option.id} className="relative aspect-square cursor-pointer group" onClick={() => !showResults && handleVote(option.id)}>
              {option.imageUrl && (
                <Image src={option.imageUrl} alt={option.text} layout="fill" className="rounded-2xl object-cover" data-ai-hint={option['dataAiHint'] || 'comparison abstract'} />
              )}
              {!showResults && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-lg font-bold text-center p-2">{option.text}</span>
                </div>
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

    return (
      <div className="space-y-3 mt-4">
        {poll.options.map((option: PollOption) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <div key={option.id}>
              {showResults ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="font-semibold">{option.text}</span>
                    <span className="text-muted-foreground">{Math.round(percentage)}% ({option.votes.toLocaleString()})</span>
                  </div>
                  <Progress value={percentage} className="h-4 rounded-full" />
                  {option.affiliateLink && (
                    <div className="text-right mt-1">
                        <a href={option.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center justify-end gap-1">
                            View Product <LinkIcon className="h-3 w-3" />
                        </a>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start p-4 h-auto text-left rounded-xl"
                  onClick={() => handleVote(option.id)}
                >
                  {option.imageUrl && (
                    <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                      <Image src={option.imageUrl} alt={option.text} layout="fill" className="rounded-md object-cover" data-ai-hint="poll option" />
                    </div>
                  )}
                  <span className="flex-1 whitespace-normal">{option.text}</span>
                   {option.affiliateLink && (
                        <a href={option.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                           <LinkIcon className="h-4 w-4" />
                        </a>
                    )}
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
      <div className="container mx-auto py-8 px-2 sm:px-4">
        <Card className="max-w-2xl mx-auto">
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
                    {poll.pledged && poll.pledgeAmount && poll.pledgeAmount > 0 &&
                    <Badge variant="default" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80">
                        Pledged ${poll.pledgeAmount.toFixed(2)}
                    </Badge>
                    }
                    <div className="text-xs mt-1 text-muted-foreground">
                        {isPollEnded ? "Poll ended" : `${formatDistanceToNowStrict(new Date(poll.endsAt), { addSuffix: true })} left`}
                    </div>
                </div>
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
      </div>
      <CommentSheet pollId={poll.id} isOpen={isCommentSheetOpen} onOpenChange={setIsCommentSheetOpen} />
      {poll.pledged && creator && <TipDialog poll={poll} creator={creator} isOpen={isTipDialogOpen} onOpenChange={setIsTipDialogOpen} />}
    </>
  )
}
