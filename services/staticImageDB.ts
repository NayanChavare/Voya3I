interface StaticImage {
  url: string;
  source: string;
  keywords: string[];
}

export const IMAGE_DATABASE: StaticImage[] = [
  // --- General & Fallback (Picsum) ---
  { url: "https://picsum.photos/seed/earth/1200/800", source: "Picsum", keywords: ["general", "nature", "landscape", "earth", "environment", "global"] },
  { url: "https://picsum.photos/seed/forest/1200/800", source: "Picsum", keywords: ["general", "forest", "trees", "nature", "green"] },
  { url: "https://picsum.photos/seed/mountains/1200/800", source: "Picsum", keywords: ["general", "mountains", "landscape", "adventure", "nature"] },
  { url: "https://picsum.photos/seed/lake/1200/800", source: "Picsum", keywords: ["general", "lake", "reflection", "calm", "nature"] },
  { url: "https://picsum.photos/seed/mist/1200/800", source: "Picsum", keywords: ["general", "fog", "mist", "forest", "nature"] },
  { url: "https://picsum.photos/seed/canyon/1200/800", source: "Picsum", keywords: ["general", "canyon", "desert", "nature"] },
  { url: "https://picsum.photos/seed/ocean-view/1200/800", source: "Picsum", keywords: ["general", "ocean", "coast", "nature"] },
  { url: "https://picsum.photos/seed/desert-dunes/1200/800", source: "Picsum", keywords: ["general", "desert", "sand", "nature"] },
  { url: "https://picsum.photos/seed/waterfall/1200/800", source: "Picsum", keywords: ["general", "waterfall", "river", "nature"] },
  { url: "https://picsum.photos/seed/island/1200/800", source: "Picsum", keywords: ["general", "island", "tropical", "nature"] },
  { url: "https://picsum.photos/seed/abstract1/1200/800", source: "Picsum", keywords: ["general", "abstract", "colors", "creative"] },
  { url: "https://picsum.photos/seed/abstract2/1200/800", source: "Picsum", keywords: ["general", "abstract", "gradient", "smooth"] },
  { url: "https://picsum.photos/seed/geometry/1200/800", source: "Picsum", keywords: ["general", "abstract", "lines", "geometry"] },
  { url: "https://picsum.photos/seed/art/1200/800", source: "Picsum", keywords: ["general", "abstract", "paint", "art"] },
  { url: "https://picsum.photos/seed/minimal/1200/800", source: "Picsum", keywords: ["general", "abstract", "minimal", "clean"] },

  // --- SDG 1: No Poverty ---
  { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["poverty", "support", "community", "sdg1", "charity", "help", "no poverty", "social support", "outreach", "humanitarian", "aid"] },
  { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["poverty", "donation", "sdg1", "social", "support", "no poverty", "humanitarian", "aid", "foundation"] },

  // --- SDG 2: Zero Hunger ---
  { url: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["food", "hunger", "sdg2", "nutrition", "meal", "zero hunger", "security", "supply", "agriculture", "farming", "harvest"] },
  { url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["food", "agriculture", "sdg2", "farming", "harvest", "zero hunger", "rural", "production", "vegetables", "market"] },

  // --- SDG 3: Good Health and Well-being ---
  { url: "https://images.unsplash.com/photo-1505751172107-573967a4f22a?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["health", "wellbeing", "medical", "sdg3", "healthcare", "well-being", "care", "hospital", "doctor", "medicine"] },
  { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["health", "yoga", "sdg3", "meditation", "wellness", "well-being", "mental", "peace", "fitness", "active"] },

  // --- SDG 4: Quality Education ---
  { url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["education", "learning", "university", "sdg4", "students", "quality education", "academic", "knowledge", "classroom", "teaching"] },
  { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["education", "books", "sdg4", "library", "study", "quality education", "knowledge", "research", "academic"] },

  // --- SDG 5: Gender Equality ---
  { url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["equality", "gender", "inclusion", "sdg5", "leadership", "gender equality", "diversity", "empowerment", "women", "rights"] },

  // --- SDG 6: Clean Water and Sanitation ---
  { url: "https://images.unsplash.com/photo-1548932813-71000a65af23?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["water", "clean water", "sanitation", "sdg6", "resource", "efficiency", "clean water and sanitation", "supply", "hygiene", "tap", "filtration"] },

  // --- SDG 7: Affordable and Clean Energy ---
  { url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["energy", "renewable", "solar", "sdg7", "clean energy", "efficiency", "affordable and clean energy", "electricity", "power", "panels"] },
  { url: "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["energy", "wind", "turbine", "sdg7", "renewable", "affordable and clean energy", "clean energy", "technology", "power"] },

  // --- SDG 8: Decent Work and Economic Growth ---
  { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["economy", "work", "growth", "sdg8", "business", "decent work and economic growth", "professional", "office", "career", "teamwork", "collaboration"] },

  // --- SDG 9: Industry, Innovation and Infrastructure ---
  { url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["innovation", "industry", "infrastructure", "sdg9", "technology", "industry innovation and infrastructure", "engineering", "tech", "automation", "robot"] },

  // --- SDG 11: Sustainable Cities and Communities ---
  { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["urban", "city", "sustainable cities", "sdg11", "architecture", "sustainable cities and communities", "smart city", "planning", "transport"] },

  // --- SDG 12: Responsible Consumption and Production ---
  { url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["consumption", "production", "recycling", "sdg12", "waste", "responsible consumption and production", "sustainability", "eco", "circular"] },

  // --- SDG 13: Climate Action ---
  { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["climate", "environment", "action", "sdg13", "planet", "climate action", "glacier", "ice", "arctic", "emissions", "carbon"] },

  // --- SDG 14: Life Below Water ---
  { url: "https://images.unsplash.com/photo-1544551763-47a0159f963f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["ocean", "marine", "water", "sdg14", "sea", "life below water", "underwater", "fish", "coral", "reef"] },

  // --- SDG 15: Life on Land ---
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["land", "forest", "biodiversity", "sdg15", "nature", "life on land", "wildlife", "ecology", "trees"] },

  // --- SDG 16: Peace, Justice and Strong Institutions ---
  { url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["peace", "justice", "institutions", "sdg16", "law", "peace justice and strong institutions", "court", "diplomacy", "symbol"] },

  // --- SDG 17: Partnerships for the Goals ---
  { url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["partnership", "global", "collaboration", "sdg17", "team", "partnerships for the goals", "handshake", "agreement", "cooperation", "unity"] },

  // --- Academic & University (Picsum) ---
  { url: "https://picsum.photos/seed/university/1200/800", source: "Picsum", keywords: ["university", "campus", "students", "academic", "education"] },
  { url: "https://picsum.photos/seed/learning/1200/800", source: "Picsum", keywords: ["university", "collaboration", "workshop", "learning", "engagement"] },
  { url: "https://picsum.photos/seed/graduation/1200/800", source: "Picsum", keywords: ["university", "graduation", "success", "exposure"] },
  { url: "https://picsum.photos/seed/library-hall/1200/800", source: "Picsum", keywords: ["university", "library", "study"] },
  { url: "https://picsum.photos/seed/lecture-hall/1200/800", source: "Picsum", keywords: ["university", "lecture", "education"] },
  { url: "https://picsum.photos/seed/research-center/1200/800", source: "Picsum", keywords: ["university", "research", "science"] },

  // --- Engagement & Exposure (Picsum) ---
  { url: "https://picsum.photos/seed/discussion/1200/800", source: "Picsum", keywords: ["engagement", "students", "discussion"] },
  { url: "https://picsum.photos/seed/meeting/1200/800", source: "Picsum", keywords: ["engagement", "meeting", "collaboration"] },
  { url: "https://picsum.photos/seed/presentation/1200/800", source: "Picsum", keywords: ["exposure", "presentation", "audience", "workshop"] },
  { url: "https://picsum.photos/seed/seminar/1200/800", source: "Picsum", keywords: ["exposure", "seminar", "lecture"] },
  { url: "https://picsum.photos/seed/networking/1200/800", source: "Picsum", keywords: ["exposure", "networking", "event"] },
  { url: "https://picsum.photos/seed/community-event/1200/800", source: "Picsum", keywords: ["engagement", "community", "event"] },

  // --- Funding & Grants ---
  { url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["funding", "grant", "money", "budget", "finance", "investment", "nih", "nsf", "reporting", "compliance"] },
  { url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["funding", "grant", "investment", "growth", "finance", "support", "misalignment"] },

  // --- Policy & Benchmarking ---
  { url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["policy", "benchmarking", "report", "document", "analysis", "comparison", "standards", "framework", "science europe"] },
  { url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["policy", "lag", "benchmarking", "report", "analysis", "data", "comparison"] },

  // --- Institutional Governance ---
  { url: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["governance", "institutional", "oversight", "management", "board", "meeting", "leadership", "framework"] },
  { url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["governance", "collaboration", "meeting", "institutional", "team", "discussion"] },

  // --- Technology & Innovation ---
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "innovation", "digital", "code", "efficiency", "optimization", "hardware", "circuit", "execution", "speed", "implementation", "stagnation", "stalled"] },
  { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "cyber", "security", "digital", "code", "protection", "risk", "mitigation", "shield", "compliance", "regulatory", "standards", "non-compliance"] },
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "data", "analytics", "chart", "efficiency", "metrics", "statistics", "optimization", "finding", "impact", "lca", "lifecycle"] },
  { url: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "data", "dashboard", "analytics", "metrics", "tracking", "efficiency", "impact", "monitoring", "compliance"] },

  // --- Strategy & Leadership ---
  { url: "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["strategy", "planning", "vision", "roadmap", "framework", "alignment", "mitigation", "solution", "governance", "policy", "institutional", "compliance", "regulatory", "standards", "iso", "asme"] },
  { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["leadership", "team", "collaboration", "management", "governance", "mitigation", "oversight", "institutional", "group", "agile", "sprint", "speed"] },
  { url: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["strategy", "roadmap", "future", "plan", "trajectory", "milestone", "path", "vision", "execution", "speed"] },

  // --- Risk & Mitigation ---
  { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "fog", "uncertainty", "caution", "vague", "challenge", "mitigation", "fatigue", "burnout", "exhaustion", "stress"] },
  { url: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["fatigue", "burnout", "tired", "stress", "exhaustion", "workplace", "mental health", "pressure"] },
  { url: "https://images.unsplash.com/photo-1534224039826-c7a0dee265e1?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "cracked", "dry", "drought", "environmental risk", "critical", "fragile", "hazard", "fatigue", "stress"] },
  { url: "https://images.unsplash.com/photo-1510511459019-5dee667ff1f6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "mitigation", "safety", "protection", "security", "prevention", "shield", "solution", "compliance", "regulatory"] },
  { url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "security", "cyber", "threat", "mitigation", "code", "hacker", "misdirected", "innovation"] },

  // --- SPECIFIC IMAGES: Status & Progress (Keep Unsplash for context) ---
  { url: "https://images.unsplash.com/photo-1485575301924-6891ef935dcd?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["developing", "starting", "low", "seedling", "growth", "beginning", "small", "knowledge", "engagement", "exposure", "developing"] },
  { url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["developing", "low", "path", "journey", "start", "climb", "strategy", "engagement", "developing"] },
  { url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["developing", "low", "seed", "sprout", "growth"] },
  { url: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["developing", "low", "sunrise", "hope", "beginning"] },
  { url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["developing", "low", "plant", "growth", "nature"] },
  
  { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["excelled", "high", "peak", "mountain", "summit", "success", "leader", "strategy", "excelled"] },
  { url: "https://images.unsplash.com/photo-1491333078588-55b6733c7de6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["excelled", "high", "trophy", "award", "achievement", "winner", "engagement", "excelled"] },
  { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["excelled", "high", "professional", "mastery", "expert", "leader", "knowledge", "exposure", "excelled"] },
  { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["excelled", "high", "celebration", "team success", "victory"] },
  { url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["excelled", "high", "business", "meeting", "success"] },

  // --- SPECIFIC IMAGES: Risk & Warning (Keep Unsplash for context) ---
  { url: "https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "caution", "storm", "danger", "challenge", "critical", "mitigation", "non-compliance", "regulatory"] },
  { url: "https://images.unsplash.com/photo-1534224039826-c7a0dee265e1?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "cracked", "dry", "drought", "environmental risk", "critical", "fragile"] },
  { url: "https://images.unsplash.com/photo-1429552077091-836152271555?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "lightning", "storm", "danger", "electricity", "power"] },
  { url: "https://images.unsplash.com/photo-1524333865981-3a4b2772e20b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "fire", "smoke", "hazard", "emergency"] },
  { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "fog", "uncertainty", "caution", "vague"] },
  { url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "warning", "ice", "cold", "hazard", "slippery"] },
  { url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "security", "hacker", "code", "cyber", "threat", "mitigation"] },
  { url: "https://images.unsplash.com/photo-1510511459019-5dee667ff1f6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["risk", "mitigation", "safety", "helmet", "construction", "protection", "compliance", "regulatory", "non-compliance"] },

  // --- SPECIFIC IMAGES: Knowledge (Keep Unsplash for context) ---
  { url: "https://images.unsplash.com/photo-1523050335102-c6744729ea2f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["knowledge", "academic", "study", "research", "learning"] },
  { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["knowledge", "books", "library", "wisdom"] },
  { url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["knowledge", "focus", "study", "concentration"] },
  { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["knowledge", "digital", "data", "information"] },
  { url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["knowledge", "open book", "reading", "wisdom"] },
  { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["knowledge", "classroom", "learning", "education"] },
  
  // --- New High-Quality Unsplash Additions ---
  { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "digital", "global", "network", "future", "innovation", "connectivity"] },
  { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["office", "modern", "workspace", "collaboration", "business", "institutional", "governance"] },
  { url: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["analytics", "data", "business", "growth", "metrics", "efficiency", "finding"] },
  { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "coding", "software", "development", "innovation", "digital"] },
  { url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["teamwork", "collaboration", "meeting", "strategy", "leadership", "partnership"] },
  { url: "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["planning", "strategy", "business", "roadmap", "policy", "framework"] },
  { url: "https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["handshake", "partnership", "agreement", "trust", "collaboration", "sdg17"] },
  { url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["workshop", "education", "learning", "engagement", "discussion", "students"] },
  { url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["science", "laboratory", "research", "medical", "innovation", "health"] },
  { url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["architecture", "modern", "building", "institutional", "university", "campus"] },
  { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["nature", "mountains", "environment", "sustainability", "landscape"] },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["forest", "trees", "green", "environment", "nature", "biodiversity"] },
  { url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["energy", "solar", "renewable", "sustainability", "clean energy", "sdg7"] },
  { url: "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["wind", "turbines", "renewable", "energy", "sustainability", "sdg7"] },
  { url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["recycling", "waste", "environment", "sustainability", "sdg12"] },
  { url: "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["circular economy", "sustainability", "green", "future", "innovation", "stagnation", "stalled"] },
  { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["education", "classroom", "students", "learning", "sdg4"] },
  { url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["students", "university", "campus", "collaboration", "learning"] },
  { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["success", "achievement", "teamwork", "celebration", "excelled"] },
  { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "engineering", "standards", "compliance", "regulatory", "asme", "iso", "quality", "control", "inspection", "non-compliance", "audit"] },
  { url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["agile", "sprint", "scrum", "planning", "speed", "execution", "collaboration", "team", "board", "post-it", "innovation", "stagnation", "stalled"] },
  { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["meeting", "presentation", "leadership", "strategy", "business", "governance", "institutional"] },
  { url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["diversity", "inclusion", "equality", "team", "sdg5", "sdg10"] },
  { url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["community", "support", "volunteering", "sdg1", "sdg17"] },

  // --- Additional Contextual Images (Picsum) ---
  { url: "https://picsum.photos/seed/collaboration-2/1200/800", source: "Picsum", keywords: ["collaboration", "teamwork", "sdg17"] },
  { url: "https://picsum.photos/seed/innovation-2/1200/800", source: "Picsum", keywords: ["innovation", "technology", "sdg9"] },
  { url: "https://picsum.photos/seed/nature-2/1200/800", source: "Picsum", keywords: ["nature", "environment", "sdg15"] },
  { url: "https://picsum.photos/seed/city-2/1200/800", source: "Picsum", keywords: ["city", "urban", "sdg11"] },
  { url: "https://picsum.photos/seed/water-2/1200/800", source: "Picsum", keywords: ["water", "clean", "sdg6"] },
  { url: "https://picsum.photos/seed/energy-2/1200/800", source: "Picsum", keywords: ["energy", "renewable", "sdg7"] },
  { url: "https://picsum.photos/seed/health-2/1200/800", source: "Picsum", keywords: ["health", "wellness", "sdg3"] },
  { url: "https://picsum.photos/seed/education-2/1200/800", source: "Picsum", keywords: ["education", "learning", "sdg4"] },
  { url: "https://picsum.photos/seed/equality-2/1200/800", source: "Picsum", keywords: ["equality", "inclusion", "sdg5", "sdg10"] },
  { url: "https://picsum.photos/seed/economy-2/1200/800", source: "Picsum", keywords: ["economy", "growth", "sdg8"] },
  { url: "https://picsum.photos/seed/climate-2/1200/800", source: "Picsum", keywords: ["climate", "action", "sdg13"] },
  { url: "https://picsum.photos/seed/ocean-2/1200/800", source: "Picsum", keywords: ["ocean", "marine", "sdg14"] },
  { url: "https://picsum.photos/seed/peace-2/1200/800", source: "Picsum", keywords: ["peace", "justice", "sdg16"] },
  { url: "https://picsum.photos/seed/partnership-2/1200/800", source: "Picsum", keywords: ["partnership", "global", "sdg17"] },
  { url: "https://picsum.photos/seed/sustainability-2/1200/800", source: "Picsum", keywords: ["sustainability", "green", "sdg12"] },
  { url: "https://picsum.photos/seed/future-2/1200/800", source: "Picsum", keywords: ["future", "vision"] },
  { url: "https://picsum.photos/seed/research-2/1200/800", source: "Picsum", keywords: ["research", "science"] },
  { url: "https://picsum.photos/seed/global-2/1200/800", source: "Picsum", keywords: ["global", "world"] },
  { url: "https://picsum.photos/seed/community-2/1200/800", source: "Picsum", keywords: ["community", "people", "sdg1"] },
  { url: "https://picsum.photos/seed/food-2/1200/800", source: "Picsum", keywords: ["food", "hunger", "sdg2"] },
  { url: "https://picsum.photos/seed/diversity-2/1200/800", source: "Picsum", keywords: ["diversity", "inclusion"] },
  { url: "https://picsum.photos/seed/leadership-2/1200/800", source: "Picsum", keywords: ["leadership", "strategy"] },
  { url: "https://picsum.photos/seed/tech-2/1200/800", source: "Picsum", keywords: ["technology", "digital"] },
  { url: "https://picsum.photos/seed/ai-2/1200/800", source: "Picsum", keywords: ["ai", "future"] },
  { url: "https://picsum.photos/seed/data-2/1200/800", source: "Picsum", keywords: ["data", "information"] },
  { url: "https://picsum.photos/seed/network-2/1200/800", source: "Picsum", keywords: ["network", "global"] },
  { url: "https://picsum.photos/seed/vision-2/1200/800", source: "Picsum", keywords: ["vision", "future"] },
  { url: "https://picsum.photos/seed/impact-2/1200/800", source: "Picsum", keywords: ["impact", "change"] },
  { url: "https://picsum.photos/seed/goal-2/1200/800", source: "Picsum", keywords: ["goal", "target"] },
];
