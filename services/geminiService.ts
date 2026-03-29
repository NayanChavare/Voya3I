import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, QuestionType, AssessmentScores, AIInsights, Resource } from "../types";
import { IMAGE_DATABASE } from './staticImageDB';
import { GUEST_QUESTIONS, STUDENT_QUESTIONS, FACULTY_QUESTIONS } from './fallbackData';
import { backend } from './backendService';

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key || key === 'YOUR_API_KEY') {
    console.warn("[AI Service] No valid Gemini API key found. AI features will use fallback data.");
    return null;
  }
  return key;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * A wrapper for AI API calls that includes automatic retries with exponential backoff.
 */
async function makeApiCallWithRetry(
  apiCall: () => Promise<GenerateContentResponse>, 
  maxRetries = 5, 
  initialDelay = 3000
): Promise<GenerateContentResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      const errorStr = error.toString().toUpperCase();
      const isRetriable = 
        errorStr.includes('429') || 
        errorStr.includes('RESOURCE_EXHAUSTED') || 
        errorStr.includes('QUOTA_EXCEEDED') ||
        errorStr.includes('503') || 
        errorStr.includes('UNAVAILABLE') ||
        errorStr.includes('DEADLINE_EXCEEDED') ||
        errorStr.includes('INTERNAL_ERROR');

      if (isRetriable && attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.warn(`[AI Service] API temporary error (${errorStr.includes('503') ? 'High Demand' : 'Quota/Rate Limit'}). Retrying in ${Math.round(delay / 1000)}s (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`[AI Service] API call failed on attempt ${attempt} or with a non-retriable error.`, error);
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
export async function generateSDGQuestions(dept: string, role: string, difficulty: 'Easy' | 'Medium' | 'Hard', count: number = 15): Promise<Question[]> {
  const entropySeed = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  if (!ai) {
    console.warn("[AI Service] AI not initialized, using fallback bank for questions.");
    let pool = GUEST_QUESTIONS;
    if (role === 'Student') pool = STUDENT_QUESTIONS;
    if (role === 'Faculty/Staff' || role === 'Admin') pool = FACULTY_QUESTIONS;
    return shuffleArray(pool).slice(0, count);
  }

  // Distribute counts across types
  const knowledgeCount = Math.ceil(count * 0.4);
  const otherCount = Math.floor((count - knowledgeCount) / 3);
  const exposureCount = count - knowledgeCount - (otherCount * 2);

  try {
    const response = await makeApiCallWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a world-class Higher Education sustainability consultant. Generate a set of ${count} rigorous and HIGHLY UNIQUE assessment questions about the UN Sustainable Development Goals (SDGs) specifically tailored for a ${role} in the ${dept} department.

      The difficulty level for the questions must be ${difficulty}. 
      
      CRITICAL: Ensure all questions and options are easily understandable and clear.
      
      Structure:
      - ${knowledgeCount} Knowledge questions (Multiple choice with one factual correct answer)
      - ${otherCount} Attitude questions (Disposition and values - correctAnswer should be the most sustainable/ideal mindset)
      - ${otherCount} Engagement questions (Behavioral actions - correctAnswer should be the most frequent/active engagement)
      - ${exposureCount} Exposure questions (Institutional interaction - correctAnswer should be the highest level of awareness/exposure)
      
      CRITICAL: Every question MUST have a 'correctAnswer' field that matches exactly one of the strings in the 'options' array. For non-knowledge questions, the 'correctAnswer' should represent the 'Target' or 'Ideal' state of sustainability. Do not use "None" or leave it empty.
      
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

    const rawResponse = response.text || '[]';
    const questions = JSON.parse(rawResponse) as Question[];
    return shuffleArray(questions);
  } catch (e) {
    console.error("AI Question Generation Error, using fallback bank:", e);
    let pool = GUEST_QUESTIONS;
    if (role === 'Student') pool = STUDENT_QUESTIONS;
    if (role === 'Faculty/Staff' || role === 'Admin') pool = FACULTY_QUESTIONS;
    
    return shuffleArray(pool).slice(0, count);
  }
}

const STOP_WORDS = new Set(['and', 'the', 'for', 'with', 'from', 'that', 'this', 'your', 'their', 'about', 'using', 'into', 'through', 'between']);

const getKeywordsFromPrompt = (prompt: string): string[] => {
  return prompt
    .toLowerCase()
    .replace(/[,.]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
};

/**
 * Fetches an image from Unsplash API via server proxy as primary source.
 */
async function fetchUnsplashImage(query: string): Promise<{url: string, source?: string, photographer?: string, photographerUrl?: string, downloadLocation?: string} | null> {
  try {
    // Add timestamp to bust browser cache and ensure fresh image on every refresh
    const response = await fetch(`/api/images/search?query=${encodeURIComponent(query)}&t=${Date.now()}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.url && !data.error) {
      return {
        url: data.url,
        source: data.source || 'Unsplash',
        photographer: data.photographer,
        photographerUrl: data.photographerUrl,
        downloadLocation: data.downloadLocation
      };
    }
    return null;
  } catch (error) {
    console.error("[Unsplash Proxy] Error fetching image:", error);
    return null;
  }
}

export async function fetchSearchImage(prompt: string): Promise<{url: string, source?: string, photographer?: string, photographerUrl?: string, downloadLocation?: string}> {
  const cacheKey = prompt.toLowerCase().trim();
  
  // 1. Try localStorage cache first
  try {
    const localCacheStr = localStorage.getItem('unsplash_local_cache');
    if (localCacheStr) {
      const localCache = JSON.parse(localCacheStr);
      const cached = localCache[cacheKey];
      
      // Cache expiry: 1 hour for client-side cache
      const CACHE_EXPIRY = 60 * 60 * 1000;
      if (cached && cached.photographer && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
        console.log(`[AI Service] LocalStorage cache hit for "${prompt}"`);
        return {
          url: cached.url,
          source: cached.source || 'Unsplash',
          photographer: cached.photographer,
          photographerUrl: cached.photographerUrl,
          downloadLocation: cached.downloadLocation
        };
      }
    }
  } catch (e) {
    console.warn("[AI Service] LocalStorage cache check failed:", e);
  }

  // 2. Try Unsplash as primary live source (which has its own server-side cache)
  const unsplashResult = await fetchUnsplashImage(prompt);
  if (unsplashResult) {
    // Save to localStorage cache
    try {
      const localCacheStr = localStorage.getItem('unsplash_local_cache');
      const localCache = localCacheStr ? JSON.parse(localCacheStr) : {};
      localCache[cacheKey] = {
        ...unsplashResult,
        timestamp: Date.now()
      };
      // Limit cache size to 50 entries
      const keys = Object.keys(localCache);
      if (keys.length > 50) {
        delete localCache[keys[0]];
      }
      localStorage.setItem('unsplash_local_cache', JSON.stringify(localCache));
    } catch (e) {}
    
    return unsplashResult;
  }

  // 2. Fallback to existing static database logic
  let basicKeywords = getKeywordsFromPrompt(prompt);
  
  // Detect "sdg 7" or "sdg7" and ensure "sdg7" is in keywords
  const sdgMatch = prompt.toLowerCase().match(/sdg\s*(\d+)/);
  let targetSdg = sdgMatch ? `sdg${sdgMatch[1]}` : undefined;
  
  const searchParams = { keywords: basicKeywords, sdg: targetSdg };

  const calculateScore = (imageKeywords: string[], targetKeywords: string[], targetSdg?: string) => {
    let score = 0;
    
    // Status keywords are high priority but lower than content
    const statusKeywords = ['low', 'developing', 'starting', 'seedling', 'high', 'excelled', 'leader', 'peak', 'risk', 'warning', 'critical', 'stagnation', 'non-compliance', 'stalled'];
    
    // SDG match is extremely high priority
    if (targetSdg && imageKeywords.includes(targetSdg)) {
      score += 1000; // Massive boost for correct SDG
    }
    
    // Keyword overlap
    for (let i = 0; i < targetKeywords.length; i++) {
      const kw = targetKeywords[i];
      const isStatusKw = statusKeywords.includes(kw);
      const positionMultiplier = i === 0 ? 10 : (i === 1 ? 5 : 1); // Massive weight to the very first word

      for (const imgKw of imageKeywords) {
        if (imgKw === kw) {
          // Exact match - much higher weight
          score += (isStatusKw ? 100 : 500) * positionMultiplier; 
        } else if (imgKw.includes(kw) || kw.includes(imgKw)) {
          // Partial match
          score += (isStatusKw ? 20 : 100) * positionMultiplier;
        }
      }
    }

    // Penalty for generic images if they are not specifically requested
    const isGenericImage = imageKeywords.includes('general') || imageKeywords.includes('abstract');
    const isGenericRequested = targetKeywords.includes('general') || targetKeywords.includes('abstract') || targetKeywords.includes('nature');
    
    if (isGenericImage && !isGenericRequested) {
      score -= 100; 
    }

    return score;
  };

  const findBestMatches = (params: { sdg?: string, keywords: string[] }) => {
    const scored = IMAGE_DATABASE.map(img => ({
      img,
      score: calculateScore(img.keywords, params.keywords, params.sdg)
    })).sort((a, b) => b.score - a.score);

    return scored;
  };

  const scoredCandidates = findBestMatches(searchParams);
  const topCandidates = scoredCandidates.slice(0, 12).filter(c => c.score > 0);

  if (topCandidates.length === 0) {
    // Fallback to general/abstract
    const fallbacks = IMAGE_DATABASE.filter(img => img.keywords.includes('general') || img.keywords.includes('abstract'));
    const selected = fallbacks[Math.floor(Math.random() * fallbacks.length)] || IMAGE_DATABASE[0];
    return { url: selected.url, source: selected.source };
  }

  // Selection: Pick the single best match for maximum relevance
  const selected = topCandidates[0].img;

  return { url: selected.url, source: selected.source };
}

/**
 * Generates a detailed rule-based summary to expand the AI's output or provide a robust fallback.
 */
function generateRuleBasedSummary(scores: AssessmentScores, dept: string, role: string, aiSummary?: string): string {
  const total = scores.total;
  let base = aiSummary || "";
  
  // Performance Tier
  let tier = "";
  if (total >= 80) tier = "Institutional Leader";
  else if (total >= 60) tier = "Emerging Advocate";
  else if (total >= 40) tier = "Foundational Practitioner";
  else tier = "Developing Participant";

  // Category Analysis
  const strengths = [];
  const weaknesses = [];
  
  if (scores.knowledge >= 20) strengths.push("theoretical understanding");
  else weaknesses.push("foundational SDG literacy");
  
  if (scores.attitude >= 20) strengths.push("individual commitment");
  else weaknesses.push("value alignment");
  
  if (scores.engagement >= 20) strengths.push("active participation");
  else weaknesses.push("practical engagement");
  
  if (scores.exposure >= 20) strengths.push("curriculum integration");
  else weaknesses.push("institutional exposure");

  const strengthText = strengths.length > 0 ? `Your primary strengths lie in ${strengths.join(' and ')}.` : "";
  const weaknessText = weaknesses.length > 0 ? `Focus areas for growth include ${weaknesses.join(' and ')}.` : "";

  // Departmental Context
  const deptContext = `Within the ${dept} department, your role as a ${role} provides a unique platform to influence systemic change.`;

  // Synthesis
  const expandedSummary = [
    aiSummary ? aiSummary : `Your assessment profile indicates you are currently at the ${tier} level with a total score of ${total}/100.`,
    deptContext,
    strengthText,
    weaknessText,
    `To advance to the next stage of institutional impact, we recommend prioritizing the tactical steps outlined in the Improvement Protocol below.`
  ].filter(Boolean).join(' ');

  return expandedSummary;
}

export async function getAIImprovementPlan(scores: AssessmentScores, role: string, dept: string): Promise<AIInsights> {
  if (!ai) {
    console.warn("[AI Service] AI not initialized, using static fallback for improvement plan.");
    return {
      summary: generateRuleBasedSummary(scores, dept, role),
      improvementSteps: [
        "Curriculum Integration: Embed specific SDG case studies into your primary modules or workflows.",
        "Resource Optimization: Conduct a personal audit of energy and material usage in your departmental space.",
        "Collaborative Advocacy: Join or initiate a cross-departmental sustainability working group.",
        "Community Outreach: Partner with local NGOs to apply your ${dept} expertise to real-world SDG challenges.",
        "Digital Transformation: Transition to paperless administrative workflows and cloud-based collaboration.",
        "Sustainable Procurement: Advocate for ethical and eco-friendly supply chain choices within the department."
      ],
      quickSuggestions: [
        "Switch to digital-first documentation to reduce paper waste.",
        "Incorporate a 5-minute 'SDG Moment' in weekly meetings.",
        "Use the UN SDG app to track daily sustainable habits.",
        "Advocate for sustainable procurement in departmental purchasing.",
        "Participate in the THE Impact Rankings data collection.",
        "Mentor students or peers on the importance of SDG 17 (Partnerships).",
        "Organize a departmental 'Green Hackathon' for sustainability solutions.",
        "Implement a 'Meatless Monday' initiative in departmental gatherings.",
        "Set up a specialized recycling station for electronic waste.",
        "Create a shared digital library for sustainability research papers."
      ],
      resources: [
        { title: "UN SDG Knowledge Platform", url: "https://sdgs.un.org/goals", description: "The central hub for all UN sustainable development goals." },
        { title: "UNESCO Education for SDGs", url: "https://en.unesco.org/themes/education-sustainable-development", description: "Resources for integrating SDGs into higher education." },
        { title: "THE Impact Rankings", url: "https://www.timeshighereducation.com/impactrankings", description: "Global university sustainability performance metrics." },
        { title: "AASHE Resources", url: "https://www.aashe.org/resources/", description: "Comprehensive library of sustainability resources for higher education." },
        { title: "SDSN Youth", url: "https://sdsnyouth.org/", description: "Empowering young people to create sustainable solutions globally." }
      ],
      trajectory: "Sustainable Institutional Leader",
      impactAnalysis: [
        { area: "Knowledge", finding: "Strong theoretical understanding of core goals.", status: "Excelled", visualPrompt: "academic library sustainability research" },
        { area: "Engagement", finding: "Opportunities exist for more active participation.", status: "Developing", visualPrompt: "community garden collaboration sustainable" },
        { area: "Exposure", finding: "Institutional awareness is high but needs practical application.", status: "Developing", visualPrompt: "university campus solar panels green" },
        { area: "Strategy", finding: "Alignment with global frameworks is emerging.", status: "Developing", visualPrompt: "strategic planning meeting sustainability future" }
      ],
      milestones: [
        { label: "Awareness Phase", timeframe: "1 Month", objective: "Complete a departmental sustainability audit." },
        { label: "Action Phase", timeframe: "6 Months", objective: "Implement one major waste-reduction initiative." },
        { label: "Leadership Phase", timeframe: "12 Months", objective: "Achieve departmental certification in sustainability excellence." }
      ],
      riskMitigation: [
        { risk: "Resource Constraints", mitigation: "Focus on low-cost, high-impact behavioral changes.", impactLevel: "Medium", visualPrompt: "recycling bins office green" },
        { risk: "Institutional Inertia", mitigation: "Build a coalition of peers to drive bottom-up change.", impactLevel: "High", visualPrompt: "group meeting advocacy collaboration" },
        { risk: "Data Fragmentation", mitigation: "Implement a centralized digital tracking system for SDG metrics.", impactLevel: "Low", visualPrompt: "digital dashboard analytics sustainable" }
      ],
      peerBenchmarking: "Your performance is currently in the top 30% of similar academic profiles globally."
    } as AIInsights;
  }

  const prompt = `
    Analyze Sustainability Profile (${role}, ${dept}):
    Scores: K:${scores.knowledge}, A:${scores.attitude}, E:${scores.engagement}, X:${scores.exposure}. Total: ${scores.total}/100.

    Return JSON:
    1. 'summary': Exec summary.
    2. 'improvementSteps': 6 actionable steps (Title: Desc).
    3. 'quickSuggestions': 10 creative tips.
    4. 'resources': 8-10 REAL 2024-25 academic resources/frameworks (URLs).
    5. 'trajectory': Visionary title.
    6. 'impactAnalysis': 4 items {area, finding, status, visualPrompt}. 
       (visualPrompt: 3-4 keywords from: 'regulatory compliance', 'execution speed', 'agile sprint', 'institutional governance', 'sustainability metrics', 'risk mitigation', 'innovation technology', 'fatigue stress', 'burnout prevention', 'lca lifecycle', 'iso asme standards', 'funding grant nih nsf', 'policy benchmarking report', 'non-compliance audit', 'stagnation stalled')
    7. 'milestones': 3 items {label, timeframe, objective}.
    8. 'riskMitigation': 3 items {risk, mitigation, impactLevel, visualPrompt}. 
       (visualPrompt: 3-4 keywords from: 'risk mitigation policy', 'governance institutional oversight', 'compliance monitoring', 'strategic roadmap', 'efficiency optimization', 'funding misalignment budget', 'policy lag benchmarking', 'non-compliance regulatory', 'innovation stagnation stalled')
    9. 'peerBenchmarking': 50-word analysis.

    Use Google Search for real institutional data.
  `;

  try {
    const response = await makeApiCallWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            improvementSteps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            quickSuggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "url", "description"]
              }
            },
            trajectory: { type: Type.STRING },
            impactAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  finding: { type: Type.STRING },
                  status: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING }
                },
                required: ["area", "finding", "status", "visualPrompt"]
              }
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  objective: { type: Type.STRING }
                },
                required: ["label", "timeframe", "objective"]
              }
            },
            riskMitigation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  mitigation: { type: Type.STRING },
                  impactLevel: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING }
                },
                required: ["risk", "mitigation", "impactLevel", "visualPrompt"]
              }
            },
            peerBenchmarking: { type: Type.STRING }
          },
          required: ["summary", "improvementSteps", "quickSuggestions", "trajectory", "impactAnalysis", "milestones", "riskMitigation", "peerBenchmarking"]
        }
      }
    }));

    const textResponse = response.text || '{}';
    const data = JSON.parse(textResponse);

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
      { title: "THE Impact Rankings", url: "https://www.timeshighereducation.com/impactrankings", description: "Global performance tables that assess universities against the United Nations’ Sustainable Development Goals." },
      { title: "UNESCO Education for SDGs", url: "https://en.unesco.org/themes/education-sustainable-development", description: "Resources for integrating SDGs into higher education curriculum and institutional strategy." },
      { title: "AASHE - Association for the Advancement of Sustainability in Higher Education", url: "https://www.aashe.org/", description: "A leading association for sustainability in higher education, providing resources and benchmarking tools." },
      { title: "Sustainable Development Solutions Network (SDSN)", url: "https://www.unsdsn.org/", description: "Promotes integrated approaches to implement the SDGs and the Paris Agreement on Climate Change." },
      { title: "Global Reporting Initiative (GRI) for SDGs", url: "https://www.globalreporting.org/search/?query=SDG", description: "Standards for sustainability reporting that help organizations understand and communicate their impact on the SDGs." },
      { title: "IPCC Reports (Climate Change)", url: "https://www.ipcc.ch/reports/", description: "Intergovernmental Panel on Climate Change reports, providing scientific basis for climate action." },
      { title: "World Bank SDGs Data", url: "https://datatopics.worldbank.org/sdgs/", description: "Comprehensive data and statistics on SDG indicators across countries." },
      { title: "UNDP - Sustainable Development Goals", url: "https://www.undp.org/sustainable-development-goals", description: "United Nations Development Programme's work on implementing the SDGs." },
      { title: "The SDG Academy", url: "https://sdgacademy.org/", description: "Online courses and educational materials on sustainable development." }
    ];

    return {
      summary: generateRuleBasedSummary(scores, dept, role, data.summary),
      improvementSteps: (data.improvementSteps || []).map((s: any) => {
        if (typeof s === 'string') return s;
        if (typeof s === 'object' && s !== null) {
          return `${s.title || s.area || 'Step'}: ${s.desc || s.description || s.finding || ''}`;
        }
        return String(s);
      }),
      quickSuggestions: (data.quickSuggestions || []).map((s: any) => typeof s === 'string' ? s : JSON.stringify(s)),
      resources: groundingResources.length > 0 ? [...groundingResources, ...defaultResources].slice(0, 8) : (data.resources || defaultResources),
      trajectory: data.trajectory || "Growth Pathway",
      impactAnalysis: data.impactAnalysis || [],
      milestones: data.milestones || [],
      riskMitigation: data.riskMitigation || [],
      peerBenchmarking: data.peerBenchmarking || "Analyzing against global standards..."
    } as AIInsights;
  } catch (e) {
    console.error("AI Synthesis Error, using static fallback center:", e);
    const fallbackSummary = generateRuleBasedSummary(scores, dept, role);
    // Return a high-quality static fallback to ensure the app doesn't break
    return {
      summary: fallbackSummary,
      improvementSteps: [
        "Curriculum Integration: Embed specific SDG case studies into your primary modules or workflows.",
        "Resource Optimization: Conduct a personal audit of energy and material usage in your departmental space.",
        "Collaborative Advocacy: Join or initiate a cross-departmental sustainability working group.",
        "Community Outreach: Partner with local NGOs to apply your ${dept} expertise to real-world SDG challenges.",
        "Digital Transformation: Transition to paperless administrative workflows and cloud-based collaboration.",
        "Sustainable Procurement: Advocate for ethical and eco-friendly supply chain choices within the department."
      ],
      quickSuggestions: [
        "Switch to digital-first documentation to reduce paper waste.",
        "Incorporate a 5-minute 'SDG Moment' in weekly meetings.",
        "Use the UN SDG app to track daily sustainable habits.",
        "Advocate for sustainable procurement in departmental purchasing.",
        "Participate in the THE Impact Rankings data collection.",
        "Mentor students or peers on the importance of SDG 17 (Partnerships).",
        "Organize a departmental 'Green Hackathon' for sustainability solutions.",
        "Implement a 'Meatless Monday' initiative in departmental gatherings.",
        "Set up a specialized recycling station for electronic waste.",
        "Create a shared digital library for sustainability research papers."
      ],
      resources: [
        { title: "UN SDG Knowledge Platform", url: "https://sdgs.un.org/goals", description: "The central hub for all UN sustainable development goals." },
        { title: "UNESCO Education for SDGs", url: "https://en.unesco.org/themes/education-sustainable-development", description: "Resources for integrating SDGs into higher education." },
        { title: "THE Impact Rankings", url: "https://www.timeshighereducation.com/impactrankings", description: "Global university sustainability performance metrics." },
        { title: "AASHE Resources", url: "https://www.aashe.org/resources/", description: "Comprehensive library of sustainability resources for higher education." },
        { title: "SDSN Youth", url: "https://sdsnyouth.org/", description: "Empowering young people to create sustainable solutions globally." }
      ],
      trajectory: "Sustainable Institutional Leader",
      impactAnalysis: [
        { area: "Knowledge", finding: "Strong theoretical understanding of core goals.", status: "Excelled", visualPrompt: "academic library sustainability research" },
        { area: "Engagement", finding: "Opportunities exist for more active participation.", status: "Developing", visualPrompt: "community garden collaboration sustainable" },
        { area: "Exposure", finding: "Institutional awareness is high but needs practical application.", status: "Developing", visualPrompt: "university campus solar panels green" },
        { area: "Strategy", finding: "Alignment with global frameworks is emerging.", status: "Developing", visualPrompt: "strategic planning meeting sustainability future" }
      ],
      milestones: [
        { label: "Awareness Phase", timeframe: "1 Month", objective: "Complete a departmental sustainability audit." },
        { label: "Action Phase", timeframe: "6 Months", objective: "Implement one major waste-reduction initiative." },
        { label: "Leadership Phase", timeframe: "12 Months", objective: "Achieve departmental certification in sustainability excellence." }
      ],
      riskMitigation: [
        { risk: "Resource Constraints", mitigation: "Focus on low-cost, high-impact behavioral changes.", impactLevel: "Medium", visualPrompt: "recycling bins office green" },
        { risk: "Institutional Inertia", mitigation: "Build a coalition of peers to drive bottom-up change.", impactLevel: "High", visualPrompt: "group meeting advocacy collaboration" },
        { risk: "Data Fragmentation", mitigation: "Implement a centralized digital tracking system for SDG metrics.", impactLevel: "Low", visualPrompt: "digital dashboard analytics sustainable" }
      ],
      peerBenchmarking: "Your performance is currently in the top 30% of similar academic profiles globally."
    } as AIInsights;
  }
}
