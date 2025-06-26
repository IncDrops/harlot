export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  birthDate: string; // ISO string
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
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
  tipCount: number;
  isNSFW: boolean;
}
