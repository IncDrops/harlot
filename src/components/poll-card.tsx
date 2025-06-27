
"use client";

import type { Poll, User, Comment } from "@/lib/types";
import { dummyUsers } from "@/lib/dummy-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, PanInfo } from "framer-motion";
import { Timer, Users, GripVertical, Gift, ShieldCheck, Flame, Lock, Heart, MessageCircle, Share2, Send } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { useMemo, useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNowStrict } from 'date-fns';
import { Separator } from "./ui/separator";
import { TipDialog } from './tip-dialog';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "./ui/sheet";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/auth-context";
import { addCommentToPoll, getCommentsForPoll, toggleLikeOnPoll } from "@/lib/firebase";
import { CommentListItem } from "./comment-list-item";
import { ScrollArea } from "./ui/scroll-area";
import { useSettings } from "@/hooks/use-settings";

interface PollCardProps {
  poll: Poll;
  onSwipe: (direction: "left" | "right") => void;
  onVote: (pollId: number, optionId: number) => void;
  showResults?: boolean;
  isTwoOptionPoll: boolean;
  custom?: "left" | "right" | null;
}

const cardVariants = {
  hidden: (direction: "left" | "right") => ({
    x: direction === "left" ? "-150%" : "150%",
    opacity: 0,
    scale: 0.8,
    rotate: direction === 'left' ? -20 : 20,
  }),
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "left" ? "-150%" : "150%",
    opacity: 0,
    scale: 0.8,
    rotate: direction === 'left' ? -20 : 20,
    transition: { duration: 0.8, ease: "easeIn" }
  })
};

export function PollCard({ poll, onSwipe, onVote, showResults = false, isTwoOptionPoll, custom }: PollCardProps) {
  const creator = useMemo(() => dummyUsers.find(u => u.id === poll.creatorId) as User, [poll.creatorId]);
  const totalVotes = useMemo(() => poll.options.reduce((acc, opt) => acc + opt.votes, 0), [poll.options]);
  const [timeLeft, setTimeLeft] = useState("");
  const { toast } = useToast();
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [isLiked, setIsLiked] = useState(false); // Add local like state
  const [likeCount, setLikeCount] = useState(poll.likes);

  const { showNsfw } = useSettings();
  const shouldBlur = poll.isNSFW && !showNsfw;

  const majorityVotes = useMemo(() => Math.max(...poll.options.map(o => o.votes), 0), [poll.options]);
  const isMonetizationLocked = poll.pledged && poll.pledgeAmount && ((poll.pledgeAmount * 0.5) / (majorityVotes + 1)) < 0.10 && totalVotes > 0;

  const formattedDate = useMemo(() => {
    if (!poll.createdAt) return '';
    return formatDistanceToNowStrict(new Date(poll.createdAt), { addSuffix: true });
  }, [poll.createdAt]);

  const getTimeLeft = useCallback(() => {
      const now = new Date().getTime();
      const endTime = new Date(poll.createdAt).getTime() + poll.durationMs;
      const diff = endTime - now;

      if (diff <= 0) {
        return "Poll ended";
      };

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeString = "";
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m left`;
      
      if(timeString === "") {
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        timeString = `${seconds}s left`;
      }

      return timeString.trim();
  }, [poll.createdAt, poll.durationMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    setTimeLeft(getTimeLeft());
    return () => clearInterval(interval);
  }, [getTimeLeft]);

  useEffect(() => {
    if (isCommentSheetOpen) {
      const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
          const fetchedComments = await getCommentsForPoll(poll.id.toString());
          setComments(fetchedComments);
        } catch (error) {
          console.error("Failed to fetch comments:", error);
          toast({ variant: 'destructive', title: "Could not load comments." });
        } finally {
          setIsLoadingComments(false);
        }
      };
      fetchComments();
    }
  }, [isCommentSheetOpen, poll.id, toast]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isTwoOptionPoll) return;
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      onSwipe("right");
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe("left");
    }
  };
  
  const handleTipClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
          toast({ variant: 'destructive', title: 'Please sign in to tip.' });
          return;
      }
      setIsTipDialogOpen(true);
  }
  
  const handleCommentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsCommentSheetOpen(true);
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newComment.trim() === "") return;

    const dummyUserProfile = dummyUsers.find(u => u.username === user.email?.split('@')[0]);
    const username = dummyUserProfile?.name || user.email || 'Anonymous';
    const avatar = dummyUserProfile?.avatar || `https://i.pravatar.cc/150?u=${user.uid}`;

    const commentToPost = {
      userId: user.uid,
      username,
      avatar,
      text: newComment,
    };

    try {
      await addCommentToPoll(poll.id.toString(), commentToPost);
      setNewComment("");
      // Optimistically add the comment to the UI
      setComments(prev => [{...commentToPost, id: new Date().toISOString(), createdAt: new Date().toISOString()}, ...prev]);
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({ variant: 'destructive', title: "Could not post comment." });
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
        toast({ variant: 'destructive', title: 'Please sign in to like polls.' });
        return;
    }
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    try {
        await toggleLikeOnPoll(poll.id.toString(), user.uid);
    } catch (error) {
        console.error("Failed to update like:", error);
        // Revert optimistic update on error
        setIsLiked(!newLikedState);
        setLikeCount(prev => !newLikedState ? prev + 1 : prev - 1);
        toast({ variant: 'destructive', title: 'Could not save like.' });
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Check out this poll on PollitAGo',
                text: poll.question,
                url: window.location.href, // Or a direct link to the poll
            });
        } catch (error) {
            console.error('Error sharing:', error);
            toast({ variant: 'destructive', title: 'Could not share poll.' });
        }
    } else {
        toast({ title: 'Sharing not supported on this browser.' });
    }
  };


  const renderOption = (option: any) => {
    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
    const isWinner = showResults && option.votes > 0 && option.votes === Math.max(...poll.options.map(o => o.votes));
    
    return (
      <Button key={option.id}
           variant="outline"
           className={cn("h-auto whitespace-normal justify-start p-3 transition-colors relative text-left",
             !showResults && "cursor-pointer hover:bg-muted/50",
             showResults && isWinner && "border-primary/50"
           )}
           onClick={() => !showResults && !isTwoOptionPoll && onVote(poll.id, option.id)}
      >
        {showResults && (
           <motion.div
              className="absolute inset-0 bg-primary/20 rounded-lg -z-10"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
        )}
        <div className="relative z-10 flex justify-between items-center w-full">
            <span className="font-medium text-sm flex-1 pr-4">{option.text}</span>
            {showResults && <span className="font-semibold text-sm">{percentage}%</span>}
        </div>
      </Button>
    );
  }

  const render2ndOpinionOption = (option: any, position: 'left' | 'right') => {
    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
    return (
        <div key={option.id} 
             className="relative space-y-2 cursor-pointer"
             onClick={() => !showResults && onVote(poll.id, option.id)}
        >
            <div className="aspect-w-1 aspect-h-1">
                <Image src={option.imageUrl || 'https://placehold.co/400x400.png'} alt={option.text} width={400} height={400} className="rounded-lg object-cover" />
            </div>
            {showResults ? (
                <div className="relative h-8 w-full bg-muted rounded-lg overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-primary/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%`}}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <div className="absolute inset-0 flex justify-between items-center px-2 text-xs">
                        <span>{option.text}</span>
                        <span>{percentage}%</span>
                    </div>
                </div>
            ) : (
                <div className="text-center font-medium text-sm p-2 bg-muted rounded-lg">{option.text}</div>
            )}
        </div>
    )
  }
  
  const cardContent = (
    <Card className={cn("w-full mx-auto shadow-lg rounded-2xl overflow-hidden relative cursor-grab active:cursor-grabbing", shouldBlur && "backdrop-blur-xl")}>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${creator.username}`} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={creator.avatar} alt={creator.name} data-ai-hint="anime avatar" />
                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm hover:underline">{creator.name}</p>
                  <p className="text-xs text-muted-foreground">@{creator.username} · {formattedDate}</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2">
                {poll.isNSFW && <Flame className="h-5 w-5 text-orange-500" title="NSFW Content" />}
                {isMonetizationLocked && <Lock className="h-4 w-4 text-gray-400" title="Vote monetization is locked" />}
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="mb-3 font-body text-base">{poll.description || poll.question}</p>
        
         <div className={cn("relative", shouldBlur && "blur-lg")}>
            {poll.type !== '2nd_opinion' && (
            <div className="relative aspect-video rounded-lg my-4 flex items-center justify-center bg-muted">
                <Image src={`https://placehold.co/600x400.png`} alt={poll.category} layout="fill" className="object-cover rounded-lg opacity-20" data-ai-hint={poll.category} />
                <h2 className="text-4xl font-bold text-foreground/50 font-headline">{poll.category}</h2>
            </div>
            )}

            {poll.type === '2nd_opinion' ? (
                <div className="grid grid-cols-2 gap-3 my-4">
                    {poll.options.map((opt, index) => render2ndOpinionOption(opt, index === 0 ? 'left' : 'right'))}
                </div>
            ) : (
                <div className="space-y-2 my-4">
                    {poll.options.map(renderOption)}
                </div>
            )}
         </div>

         {shouldBlur && (
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center bg-background/80 p-4 rounded-lg">
                  <p className="font-bold">NSFW Content</p>
                  <Button size="sm" variant="link" onClick={() => (window.location.href = '/settings')}>Adjust Settings</Button>
               </div>
            </div>
         )}

      </CardContent>

      <div className="px-4 pb-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>{timeLeft}</span>
            </div>
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalVotes.toLocaleString()} votes</span>
            </div>
            {poll.pledged && (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>${poll.pledgeAmount} Pledged</span>
                </div>
            )}
        </div>
      </div>

      <Separator className="my-2" />

      <CardFooter className="p-2 flex justify-around">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleLikeClick}>
              <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
              <span className="ml-2 text-xs">{likeCount.toLocaleString()}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleCommentClick}>
              <MessageCircle className="h-5 w-5" />
              <span className="ml-2 text-xs">{poll.comments.toLocaleString()}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleTipClick}>
              <Gift className="h-5 w-5" />
              <span className="ml-2 text-xs">{poll.tipCount.toLocaleString()}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShareClick}>
              <Share2 className="h-5 w-5" />
          </Button>
      </CardFooter>

      {isTwoOptionPoll && !showResults && (
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center opacity-10 pointer-events-none">
              <GripVertical className="w-8 h-8"/>
          </div>
      )}
    </Card>
  );

  const dragProps = isTwoOptionPoll && !showResults ? {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    onDragEnd: handleDragEnd,
    dragSnapToOrigin: true,
  } : {};

  return (
    <>
      <motion.div
        {...dragProps}
        variants={cardVariants}
        initial={custom ? "visible" : "hidden"}
        animate="visible"
        exit="exit"
        custom={custom}
        className="relative"
      >
        {cardContent}
      </motion.div>
      <TipDialog poll={poll} creator={creator} isOpen={isTipDialogOpen} onOpenChange={setIsTipDialogOpen} />
      <Sheet open={isCommentSheetOpen} onOpenChange={setIsCommentSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl flex flex-col h-full md:h-4/5">
          <SheetHeader>
            <SheetTitle>Comments ({comments.length})</SheetTitle>
            <SheetDescription className="truncate">
              On: "{poll.question}"
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 -mx-6">
            <div className="px-6">
              {isLoadingComments ? (
                <div className="flex items-center justify-center h-48">
                  <p>Loading comments...</p>
                </div>
              ) : comments.length > 0 ? (
                comments.map(comment => <CommentListItem key={comment.id} comment={comment} />)
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground rounded-lg bg-muted/50">
                  <MessageCircle className="h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">No comments yet</p>
                  <p className="text-sm">Be the first to share your thoughts.</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
              <form onSubmit={handlePostComment} className="flex w-full gap-2">
                  <Input 
                    placeholder={user ? "Add a comment..." : "Sign in to comment"} 
                    disabled={!user} 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button type="submit" disabled={!user || newComment.trim() === ""}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Post Comment</span>
                  </Button>
              </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
