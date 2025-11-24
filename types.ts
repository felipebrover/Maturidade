
export enum Pillar {
    STRATEGY = 'strategy',
    GOALS = 'goals',
    CHANNELS = 'channels',
    PROCESS = 'process',
    METRICS = 'metrics',
    COMPENSATION = 'compensation',
    SYSTEMS = 'systems'
}

export interface PillarScore {
  responses: number[]; // Array of 10 numbers (0, 25, 50, 75, 100)
  goal: number;
  notes: string;
}

export type PillarScores = Record<Pillar, PillarScore>;

export interface Assessment {
  id: string;
  date: string; // ISO string
  scores: PillarScores;
  overallMaturity: number; // This will be calculated
  generalNote?: string; // New field for general observation
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64 encoded file content
}

export interface ClientInfoQuestion {
    id: string;
    question: string;
    answer: string;
    isDefault?: boolean;
    attachments?: Attachment[];
    level?: 'Essencial' | 'Profissional' | 'Elite';
}

export type ClientInfoSectionId = 'summary' | 'metrics' | 'funnel' | 'competitors' | 'materials' | 'background' | 'goals' | 'contacts';

export interface ClientInfoSectionData {
    title: string;
    questions: ClientInfoQuestion[];
}

export type ClientInfoData = Record<ClientInfoSectionId, ClientInfoSectionData>;

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  tone: string;
  size: string;
  orientation: string;
  sourceIds: string[];
}

export interface Action {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface Initiative {
  id: string;
  name: string;
  progress: number; // 0-100
  actions: Action[];
}

export interface KeyResult {
  id: string;
  name: string;
  progress: number; // 0-100
  initiatives: Initiative[];
}

export interface Objective {
  id: string;
  name: string;
  progress: number; // 0-100
  keyResults: KeyResult[];
}

export interface Journey {
  id: string;
  name: string;
  color: string;
  progress: number; // 0-100
  objectives: Objective[];
}

export interface Client {
  id: string;
  name: string;
  logoUrl?: string;
  onboardingDate: string;
  assessments: Assessment[];
  deliverables: Deliverable[];
  clientInfo: ClientInfoData;
  chatSessions: ChatSession[];
  diagnosticSummary?: string;
  journeys: Journey[];
}

export type View = 'dashboard' | 'evolution' | 'clientInfo' | 'timeline' | 'meeting' | 'library' | 'planning' | 'chatbot' | 'settings';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be a hash
  role: 'admin' | 'client';
  clientId?: string; // Only if role is 'client'
  accessibleViews?: View[];
}

// New Interface for Detailed Questions
export interface MaturityQuestion {
    id: string;
    question: string;
    options: {
        0: string;
        25: string;
        50: string;
        75: string;
        100: string;
    };
}