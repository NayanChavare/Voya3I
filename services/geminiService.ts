import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, QuestionType, AssessmentScores, AIInsights, Resource } from "../types";
import { IMAGE_DATABASE } from './staticImageDB';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

/**
 * A wrapper for AI API calls that includes automatic retries with exponential backoff.
 */
async function makeApiCallWithRetry(
  apiCall: () => Promise<GenerateContentResponse>, 
  maxRetries = 3, 
  initialDelay = 1000
): Promise<GenerateContentResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      const errorStr = error.toString();
      const isRetriable = 
        errorStr.includes('429') || 
        errorStr.includes('RESOURCE_EXHAUSTED') || 
        errorStr.includes('503') || 
        errorStr.includes('UNAVAILABLE');

      if (isRetriable && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.warn(`API temporary error (${errorStr.includes('503') ? 'High Demand' : 'Rate Limit'}). Retrying in ${Math.round(delay / 1000)}s (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`API call failed on attempt ${attempt} or with a non-retriable error.`, error);
        throw error; 
      }
    }
  }
  throw new Error("API call failed after all retries.");
}


/**
 * Utility to shuffle an array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * Generates tailor-made assessment questions using AI.
 * Now shuffles questions to ensure a unique experience every session.
 */
export async function generateSDGQuestions(dept: string, role: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Question[]> {
  const entropySeed = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  const response = await makeApiCallWithRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a world-class Higher Education sustainability consultant. Generate a set of 25 rigorous and HIGHLY UNIQUE assessment questions about the UN Sustainable Development Goals (SDGs) specifically tailored for a ${role} in the ${dept} department.

    The difficulty level for the questions must be ${difficulty}. 
    
    CRITICAL: Ensure all questions and options are easily understandable and clear, avoiding overly obscure jargon, while still maintaining the specified ${difficulty} difficulty level. Use professional, engaging, and accessible language.
    
    VARIETY INSTRUCTION: To ensure high uniqueness and engagement, use a mix of question formats:
    - Scenario-based questions (e.g., "Given a situation where...")
    - Problem-solving tasks (e.g., "How would you address...")
    - Fact-based knowledge checks
    - Critical thinking prompts regarding institutional impact
    
    Contextual Entropy Key: ${entropySeed}.
    
    CRITICAL INSTRUCTION: Questions must be FRESH and vary significantly between sessions. 
    For KNOWLEDGE questions, provide 4 options and specify the EXACT 'correctAnswer' string matching one of the options.
    For ATTITUDE, ENGAGEMENT, and EXPOSURE questions, provide 4 options ordered from MOST sustainable/positive (index 0) to LEAST sustainable/positive (index 3).
    
    Structure:
    - 10 Knowledge questions (Multiple choice)
    - 5 Attitude questions (Disposition and values)
    - 5 Engagement questions (Behavioral actions)
    - 5 Exposure questions (Institutional interaction)
    
    Format response as a valid JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            type: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }
          },
          required: ["id", "text", "type", "options"]
        }
      }
    }
  }));

  try {
    const rawResponse = response.text || '[]';
    const questions = JSON.parse(rawResponse) as Question[];
    
    // SHUFFLE the questions for the user, but NOT the options within them
    // to preserve the scoring order for the backend.
    return shuffleArray(questions);
  } catch (e) {
    console.error("AI Question Generation Error:", e);
    return [];
  }
}

export async function getSetupSuggestions(dept: string): Promise<string> {
  const response = await makeApiCallWithRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give a single, powerful 15-word strategic statement about how the ${dept} department can specifically drive the SDGs in a revolutionary way.`,
  }));
  return response.text?.trim() || "Empowering academic excellence through localized sustainability and institutional responsibility.";
}

const imageCache = new Map<string, {url: string, source?: string}>();

const getKeywordsFromPrompt = (prompt: string): string[] => {
  return prompt
    .toLowerCase()
    .replace(/[,.]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
};

export async function fetchSearchImage(prompt: string): Promise<{url: string, source?: string}> {
  if (imageCache.has(prompt)) {
    return imageCache.get(prompt)!;
  }
  
  const promptKeywords = getKeywordsFromPrompt(prompt);
  let bestMatch = { score: 0, image: IMAGE_DATABASE[0] };

  if (promptKeywords.length === 0) {
      const fallbacks = IMAGE_DATABASE.filter(img => img.keywords.includes('abstract'));
      const image = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      const result = { url: image.url, source: image.source };
      imageCache.set(prompt, result);
      return result;
  }

  for (const image of IMAGE_DATABASE) {
    let currentScore = 0;
    for (const keyword of promptKeywords) {
      if (image.keywords.some(imgKeyword => imgKeyword.includes(keyword) || keyword.includes(imgKeyword))) {
        currentScore++;
      }
    }
    if (bestMatch.score < currentScore) {
      bestMatch = { score: currentScore, image };
    }
  }

  if (bestMatch.score === 0) {
    const fallbacks = IMAGE_DATABASE.filter(img => img.keywords.includes('general') || img.keywords.includes('abstract'));
    bestMatch.image = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  const result = { url: bestMatch.image.url, source: bestMatch.image.source };
  imageCache.set(prompt, result);
  await new Promise(resolve => setTimeout(resolve, 50));
  return result;
}

export async function getAIImprovementPlan(scores: AssessmentScores, role: string, dept: string): Promise<AIInsights> {
  const prompt = `
    Sustainability Profile Analysis for a ${role} in ${dept}:
    Scores: Knowledge ${scores.knowledge}, Attitude ${scores.attitude}, Engagement ${scores.engagement}, Exposure ${scores.exposure}. Total: ${scores.total}/100.

    Generate a comprehensive JSON object. The response must contain:
    1. 'summary': Executive summary of performance.
    2. 'improvementSteps': 6 high-impact actionable steps. IMPORTANT: Each step must strictly follow the format "Title: Actionable description" (e.g., "Curriculum Integration: Embed SDG case studies into core modules"). 
    3. 'quickSuggestions': 8 creative 'AI tactical recommendations' for immediate impact.
    4. 'resources': 4 REAL academic resources with titles and detailed descriptions.
    5. 'trajectory': A visionary title for the user's progress.
    6. 'impactAnalysis': 3 items {area, finding, status: 'Critical' | 'Developing' | 'Excelled', visualPrompt: string}.
    7. 'milestones': 3 items {label, timeframe, objective}.
    8. 'riskMitigation': 3 items {risk, mitigation, impactLevel: 'Low' | 'Medium' | 'High', visualPrompt: string}.
    9. 'peerBenchmarking': 50-word analysis.

    Search Instruction: Use Google Search to find real, verifiable academic papers or institutional frameworks from 2024-2025 regarding SDGs in the field of ${dept}. Provide real URLs for learning.
  `;

  const response = await makeApiCallWithRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  }));

  try {
    const textResponse = response.text || '';
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON structure in AI response.");
    const data = JSON.parse(jsonMatch[0]);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingResources: Resource[] = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Verified Institutional Resource',
        url: chunk.web.uri,
        description: 'Strategic citation discovered via real-time search grounding.'
      }));

    // Fallback links if search fails to find enough
    const defaultResources: Resource[] = [
      { title: "UN SDG Knowledge Platform", url: "https://sdgs.un.org/goals", description: "The central hub for all UN sustainable development goals and progress tracking." },
      { title: "THE Impact Rankings", url: "https://www.timeshighereducation.com/impactrankings", description: "Global performance tables that assess universities against the United Nations’ Sustainable Development Goals." }
    ];

    return {
      summary: data.summary || "Synthesis complete.",
      improvementSteps: data.improvementSteps || [],
      quickSuggestions: data.quickSuggestions || [],
      resources: groundingResources.length > 0 ? [...groundingResources, ...defaultResources].slice(0, 5) : (data.resources || defaultResources),
      trajectory: data.trajectory || "Growth Pathway",
      impactAnalysis: data.impactAnalysis || [],
      milestones: data.milestones || [],
      riskMitigation: data.riskMitigation || [],
      peerBenchmarking: data.peerBenchmarking || "Analyzing against global standards..."
    } as AIInsights;
  } catch (e) {
    console.error("AI Synthesis Error:", e);
    throw new Error("AI Synthesis Failed");
  }
}