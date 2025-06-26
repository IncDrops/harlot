export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  birthDate: string; // ISO string
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  pollitPoints: number;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  imageUrl?: string;
  affiliateLink?: string;
}

export interface Poll {
  id: number;
  creatorId: number;
  question: string;
  options: PollOption[];
  description?: string;
  videoUrl?: string;
  type: 'standard' | '2nd_opinion';
  createdAt: string;
  durationMs: number;
  pledged: boolean;
  pledgeAmount?: number;
  tipCount: number;
  isNSFW: boolean;
  category: string;
  likes: number;
  comments: number;
}
