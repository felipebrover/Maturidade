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
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  content: string;
}

export type KanbanCardStatus = 'todo' | 'doing' | 'done';

export interface KanbanCard {
  id: string;
  title: string;
  goal: string;
  description: string;
  assignee: string;
  dueDate: string; // ISO string
  status: KanbanCardStatus;
}

export interface WeeklyPlan {
    id:string;
    weekNumber: number;
    startDate: string; // ISO string
    endDate: string; // ISO string
    cards: KanbanCard[];
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
}

export type ClientInfoSectionId = 'summary' | 'basic' | 'metrics' | 'funnel' | 'competitors' | 'materials' | 'background' | 'goals' | 'contacts';

export interface ClientInfoSectionData {
    title: string;
    questions: ClientInfoQuestion[];
}

export type ClientInfoData = Record<ClientInfoSectionId, ClientInfoSectionData>;

export interface Client {
  id: string;
  name: string;
  onboardingDate: string;
  assessments: Assessment[];
  deliverables: Deliverable[];
  weeklyPlans: WeeklyPlan[];
  clientInfo: ClientInfoData;
}

export type View = 'dashboard' | 'evolution' | 'clientInfo' | 'timeline' | 'meeting' | 'library' | 'planning';