export interface User {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  role: 'admin' | 'user' | 'moderator';
  bio?: string;
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
