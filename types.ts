export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  superiorFeedback: string;
  subordinateFeedback: string;
  peerFeedback: string;
  // Optional quantitative scores could be added here if needed for deeper analysis
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

export interface ReportData {
  employee: Employee;
  analysis: AnalysisResult;
  timestamp: string;
}
