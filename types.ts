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

export interface Client {
  id: string;
  name: string;
  onboardingDate: string;
  assessments: Assessment[];
}

export type View = 'dashboard' | 'evolution' | 'timeline' | 'meeting' | 'library';