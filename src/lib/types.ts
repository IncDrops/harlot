
export interface User {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  role: 'admin' | 'user';
  bio?: string;
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
    id: string;
    userId: string;
    decisionQuestion: string;
    decisionType: string;
    dataSources: string[];
    status: 'completed' | 'in_progress' | 'archived';
    createdAt: string; // ISO String
    completedAt: string; // ISO String - Changed from optional
    primaryRecommendation: string; // Changed from optional
    executiveSummary: string; // Changed from optional
    keyFactors: { factor: string; impact: number; value: string }[]; // Changed from optional
    risks: { risk: string; mitigation: string }[]; // Changed from optional
    confidenceScore: number; // Changed from optional
}


export interface DataIntegration {
    id: string;
    name: string;
    type: 'CRM' | 'ERP' | 'Database' | 'API';
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string; // ISO String
}
