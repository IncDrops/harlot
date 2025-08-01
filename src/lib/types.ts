

export interface User {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  role: 'admin' | 'user';
  bio?: string;
  todos?: Todo[];
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
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
  createdAt: string; // ISO String
  participants: string[];
  participantsId: string;
}

export interface Analysis {
    id:string;
    userId?: string; 
    decisionQuestion: string;
    tone: 'Firm' | 'Friendly' | 'Professional';
    variants: number;
    status: 'completed' | 'in_progress' | 'archived' | 'scheduled' | 'failed';
    createdAt: string; // ISO String
    completedAt?: string; // ISO String
    scheduledTimestamp?: number;
    responses?: { title: string; text: string }[];
}


export interface DataIntegration {
    id: string;
    name: string;
    type: 'CRM' | 'ERP' | 'Database' | 'API';
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string | null; // ISO String or null if never synced
    // Optional fields for token storage, not always directly used in frontend
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: number;
}

export interface Feedback {
    id: string;
    userId: string;
    analysisId: string;
    rating: 'helpful' | 'unhelpful';
    text?: string;
    createdAt: string; // ISO string
}

// Schema for an individual stock quote
export interface StockQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changesPercentage: number;
}
