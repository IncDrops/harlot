

export interface User {
  id: string;
  numericId: number;
  displayName: string;
  username: string;
  avatar: string;
  bio?: string;
  pronouns?: string;
  birthDate: string; // ISO string
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  pollitPoints: number;
  tipsReceived?: number;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  imageUrl?: string | null;
  affiliateLink?: string | null;
  dataAiHint?: string;
}

export interface Comment {
  id: string;
  pollId: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string; // ISO String
}

export interface Notification {
    id: string;
    type: 'new_follower' | 'new_vote' | 'poll_ending' | 'tip_received' | 'new_comment';
    fromUsername: string;
    fromId: string;
    pollId?: string;
    amount?: number;
    createdAt: string; // ISO String
    read: boolean;
}

export interface Poll {
  id: string;
  creatorId: string;
  question: string;
  options: PollOption[];
  description?: string;
  videoUrl?: string;
  type: 'standard' | '2nd_opinion';
  createdAt: string;
  endsAt: string;
  isProcessed: boolean;
  durationMs: number;
  pledged: boolean;
  pledgeAmount?: number;
  tipCount: number;
  isNSFW: boolean;
  category: string;
  likes: number;
  comments: number;
}
