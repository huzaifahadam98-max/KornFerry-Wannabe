import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Employee, AnalysisResult } from '../types';
import { KFLA_SYSTEM_INSTRUCTION } from '../constants';

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

  const prompt = `
    Analyze the following feedback for:
    Name: ${employee.name}
    Job Title: ${employee.jobTitle}
    
    Superior Feedback: "${employee.superiorFeedback}"
    Subordinate Feedback: "${employee.subordinateFeedback}"
    Peer Feedback: "${employee.peerFeedback}"
    
    Return the analysis strictly in JSON format as per the schema.
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
    // Fallback or rethrow
    throw error;
  }
};