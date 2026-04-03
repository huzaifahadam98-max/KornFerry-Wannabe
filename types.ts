export interface CompetencyScore {
  name: string;
  sup: number;
  sub: number;
  peer: number;
  avg: number;
  gap: number;
}

export type ReportCategory = 'Normal' | 'CE' | 'CO';

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  reportType: ReportCategory;
  overallLES: number;
  overallPMS: string;
  questions: number[];
  feedback: string;
  competencies: CompetencyScore[];
}

export interface AnalysisResult {
  archetype: {
    title: string;
    description: string;
  };
  dominantInsights: {
    strengths: Array<{ competency: string; evidence: string }>;
    opportunities: Array<{ competency: string; evidence: string }>;
  };
  johariWindow: {
    publicArena: string;
    blindSpots: string;
  };
  stallers: Array<{
    staller: string;
    status: "A Problem" | "A Potential Problem" | "Not a Problem";
    impact: string;
  }>;
  actionPlan: {
    experience: string;
    exposure: string;
    education: string;
  };
}