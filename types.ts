export type Role = 'Guest' | 'Student' | 'Faculty/Staff' | 'Admin';

export enum QuestionType {
  KNOWLEDGE = 'knowledge',
  ATTITUDE = 'attitude',
  ENGAGEMENT = 'engagement',
  EXPOSURE = 'exposure'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  institution?: string;
  role: Role;
  password?: string;
  createdAt: string;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer?: string;
}

export interface AssessmentScores {
  knowledge: number;
  attitude: number;
  engagement: number;
  exposure: number;
  total: number;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  scores: AssessmentScores;
  dept: string;
  timestamp: string;
}

export interface Resource {
  title: string;
  url: string;
  description: string;
}

export interface ImpactFinding {
  area: string;
  finding: string;
  status: 'Critical' | 'Developing' | 'Excelled';
  visualPrompt: string;
}

export interface Milestone {
  label: string;
  timeframe: string;
  objective: string;
}

export interface RiskFactor {
  risk: string;
  mitigation: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  visualPrompt: string;
}

export interface AIInsights {
  summary: string;
  improvementSteps: string[];
  quickSuggestions: string[];
  resources: Resource[];
  trajectory: string;
  impactAnalysis: ImpactFinding[];
  milestones: Milestone[];
  riskMitigation: RiskFactor[];
  peerBenchmarking: string;
}

export interface CloudSyncStatus {
  lastSync: string | null;
  provider: 'Google Drive' | 'Dropbox' | 'Manual' | null;
  isSyncing: boolean;
}