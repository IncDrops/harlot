"use client";

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentListItem } from './comment-list-item';
import { getCommentsForPoll, addCommentToPoll } from '@/lib/firebase';
import type { Comment } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface CommentSheetProps {
  pollId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentSheet({ pollId, isOpen, onOpenChange }: CommentSheetProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && pollId) {
      setIsLoading(true);
      getCommentsForPoll(pollId)
        .then(setComments)
        .catch(err => {
          console.error("Failed to fetch comments:", err);
          toast({ variant: 'destructive', title: 'Could not load comments.' });
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, pollId, toast]);

  const handleSubmitComment = async () => {
    if (!user || !profile) {
      toast({ variant: 'destructive', title: 'Please log in to comment.' });
      return;
    }
    if (newComment.trim().length < 3) {
      toast({ variant: 'destructive', title: 'Comment must be at least 3 characters long.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const commentData: Omit<Comment, 'id' | 'createdAt'> = {
        pollId: pollId,
        userId: user.uid,
        username: profile.username,
        avatar: profile.avatar,
        text: newComment,
      };

      await addCommentToPoll(pollId, commentData);
      
      const optimisticComment: Comment = {
        ...commentData,
        id: new Date().toISOString(), // temp id
        createdAt: new Date().toISOString(),
      };
      setComments([optimisticComment, ...comments]);
      setNewComment("");

      toast({ title: 'Comment posted!' });
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({ variant: 'destructive', title: 'Failed to post comment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-4/5 flex flex-col p-4">
        <SheetHeader className="p-2">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground p-8">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => <CommentListItem key={comment.id} comment={comment} />)}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
            )}
          </ScrollArea>
        </div>
        <div className="mt-auto border-t pt-4">
          <div className="flex gap-2">
            <Textarea 
              placeholder={user ? "Add a comment..." : "Log in to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user || isSubmitting}
            />
            <Button onClick={handleSubmitComment} disabled={!user || isSubmitting || newComment.trim().length === 0}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
