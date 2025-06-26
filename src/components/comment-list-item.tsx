"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Comment } from "@/lib/types";
import { formatDistanceToNowStrict } from 'date-fns';

interface CommentListItemProps {
  comment: Comment;
}

export function CommentListItem({ comment }: CommentListItemProps) {
  const formattedDate = formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true });
  
  return (
    <div className="flex items-start gap-3 py-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.avatar} alt={comment.username} />
        <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{comment.username}</p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{comment.text}</p>
      </div>
    </div>
  )
}
