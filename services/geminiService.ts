import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Employee, AnalysisResult } from '../types';
import { KFLA_SYSTEM_INSTRUCTION, COMPETENCY_DEFINITIONS_NORMAL, COMPETENCY_DEFINITIONS_CE_CO } from '../constants';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    archetype: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["title", "description"],
    },
    dominantInsights: {
      type: Type.OBJECT,
      properties: {
        strengths: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              competency: { type: Type.STRING },
              evidence: { type: Type.STRING },
            },
            required: ["competency", "evidence"],
          },
        },
        opportunities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              competency: { type: Type.STRING },
              evidence: { type: Type.STRING },
            },
            required: ["competency", "evidence"],
          },
        },
      },
      required: ["strengths", "opportunities"],
    },
    johariWindow: {
      type: Type.OBJECT,
      properties: {
        publicArena: { type: Type.STRING },
        blindSpots: { type: Type.STRING },
      },
      required: ["publicArena", "blindSpots"],
    },
    stallers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          staller: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["A Problem", "A Potential Problem", "Not a Problem"] },
          impact: { type: Type.STRING },
        },
        required: ["staller", "status", "impact"],
      },
    },
    actionPlan: {
      type: Type.OBJECT,
      properties: {
        experience: { type: Type.STRING },
        exposure: { type: Type.STRING },
        education: { type: Type.STRING },
      },
      required: ["experience", "exposure", "education"],
    },
  },
  required: ["archetype", "dominantInsights", "johariWindow", "stallers", "actionPlan"],
};

export const analyzeEmployeeFeedback = async (employee: Employee): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Select the correct competency context based on report type
  const isExecutive = employee.reportType === 'CE' || employee.reportType === 'CO';
  const competencyContext = isExecutive ? COMPETENCY_DEFINITIONS_CE_CO : COMPETENCY_DEFINITIONS_NORMAL;

  // Helper to format scores for AI prompt (0 -> N/A)
  const formatScore = (val: number) => val > 0 ? `${val.toFixed(1)}%` : 'N/A';

  // 2. Format Quantitative Scores for the prompt (Note: Scores are 0-100)
  const scoresSummary = employee.competencies.map(c => 
    `- ${c.name}: Avg ${formatScore(c.avg)} [Sup: ${formatScore(c.sup)}, Sub: ${formatScore(c.sub)}, Peer: ${formatScore(c.peer)}]`
  ).join('\n');

  // 3. Construct the comprehensive prompt
  const prompt = `
    Analyze the following 360-degree feedback data for:
    Name: ${employee.name}
    Role Category: ${employee.reportType}
    Job Title: ${employee.jobTitle}
    Department: ${employee.department}

    PART 1: COMPETENCY MODEL CONTEXT
    Use these definitions to interpret the data:
    ${competencyContext}

    PART 2: QUANTITATIVE DATA (Scale: 0-100%)
    (Format: Competency: Average [Superior, Subordinate, Peer])
    Note: "N/A" indicates data is missing for that rater group. Do NOT treat N/A as 0 or low performance.
    ${scoresSummary}

    PART 3: QUALITATIVE FEEDBACK
    Superior: "${employee.superiorFeedback}"
    Subordinate: "${employee.subordinateFeedback}"
    Peer: "${employee.peerFeedback}"
    
    INSTRUCTIONS:
    - Synthesize the quantitative scores (0-100%) with the qualitative comments to find the true story.
    - HIGH SCORES: > 90% (Strength).
    - LOW SCORES: < 70% (Potential Weakness).
    - If a score is high but feedback is missing, treat it as a silent strength.
    - If there is a large gap (> 15%) between rater groups (e.g. Self vs Peer), highlight this in Blind Spots.
    - Return the analysis strictly in JSON format as per the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: KFLA_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
