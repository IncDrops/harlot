"use client";

import type { Poll, User } from "@/lib/types";
import { dummyUsers } from "@/lib/dummy-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, PanInfo } from "framer-motion";
import { Timer, MessageSquare, GripVertical } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface PollCardProps {
  poll: Poll;
  onSwipe: (direction: "left" | "right") => void;
  isTwoOptionPoll: boolean;
  showResults?: boolean;
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

export function PollCard({ poll, onSwipe, isTwoOptionPoll, showResults = false, custom }: PollCardProps) {
  const creator = useMemo(() => dummyUsers.find(u => u.id === poll.creatorId) as User, [poll.creatorId]);
  const totalVotes = useMemo(() => poll.options.reduce((acc, opt) => acc + opt.votes, 0), [poll.options]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      onSwipe("right");
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe("left");
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  const getTimeLeft = () => {
    const now = new Date().getTime();
    const endTime = new Date(poll.createdAt).getTime() + poll.durationMs;
    const diff = endTime - now;

    if (diff <= 0) return "Poll ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return `${minutes}m left`;
  };

  const cardContent = (
    <Card className="w-full max-w-sm mx-auto shadow-lg rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={creator.avatar} alt={creator.name} data-ai-hint="anime avatar" />
            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{creator.name}</p>
            <p className="text-xs text-muted-foreground">@{creator.username}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardTitle className="text-lg font-headline font-bold mb-2">{poll.question}</CardTitle>
        {poll.description && <CardDescription className="text-sm font-body mb-4">{truncateText(poll.description, 125)}</CardDescription>}
        
        <div className="space-y-3">
            {poll.options.map(option => {
              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
              return (
                <div key={option.id}>
                  {showResults ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="font-medium truncate pr-2">{option.text}</span>
                        <span className="text-muted-foreground font-mono text-xs">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ) : (
                    <div className="border p-3 rounded-lg text-center font-medium bg-background hover:bg-muted transition-colors">
                        {option.text}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Timer className="h-4 w-4" />
          <span>{getTimeLeft()}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{totalVotes} votes</span>
        </div>
      </CardFooter>
      {isTwoOptionPoll && (
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center opacity-10">
              <GripVertical className="w-8 h-8"/>
          </div>
      )}
    </Card>
  );

  const dragProps = showResults ? {} : {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    onDragEnd: handleDragEnd
  };

  return isTwoOptionPoll ? (
    <motion.div
      {...dragProps}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={custom}
      className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4"
    >
      {cardContent}
    </motion.div>
  ) : (
    // Non-swipeable version for other pages
    <div className="w-full flex justify-center p-4">
        {cardContent}
    </div>
  );
}
