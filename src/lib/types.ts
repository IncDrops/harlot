export interface User {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  role: 'admin' | 'user';
  bio?: string;
  pollitPoints?: number;
  tipsReceived?: number;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  imageUrl?: string | null;
  affiliateLink?: string | null;
  'data-ai-hint'?: string;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  type: 'standard' | '2nd_opinion';
  creatorId: string;
  createdAt: string; // ISO String
  endsAt: string; // ISO String
  pledged: boolean;
  pledgeAmount?: number;
  tipCount: number;
  isNSFW: boolean;
  isProcessed: boolean;
  category?: string;
  likes: number;
  comments: number;
  videoUrl?: string | null;
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
    type: 'analysis_complete' | 'data_anomaly' | 'insight_available' | 'system_update';
    title: string;
    description: string;
    createdAt: string; // ISO string
    read: boolean;
}

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  recipientId: string;
  createdAt: Date;
  participants: string[];
  participantsId: string;
}

export interface Analysis {
    id: string;
    decisionQuestion: string;
    status: 'completed' | 'in_progress' | 'archived';
    completedAt: string; // ISO String
    primaryRecommendation: string;
    confidenceScore: number; // 0-100
}

export interface DataIntegration {
    id: string;
    name: string;
    type: 'CRM' | 'ERP' | 'Database' | 'API';
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string; // ISO String
}
