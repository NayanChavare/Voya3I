interface StaticImage {
  url: string;
  source: string;
  keywords: string[];
}

export const IMAGE_DATABASE: StaticImage[] = [
  // --- General & Fallback ---
  { url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["general", "nature", "landscape", "green", "sustainability", "environment", "earth"] },
  { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["modern", "architecture", "office", "clean", "sustainability", "building"] },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["forest", "trees", "sunlight", "nature", "environment"] },
  { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["abstract", "technology", "network", "digital", "data", "blue"] },
  { url: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["nature", "greenery", "eco", "sustainability"] },

  // --- Education & Institutional ---
  { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["university", "education", "students", "campus", "knowledge", "academic", "institution", "modern"] },
  { url: "https://images.unsplash.com/photo-1491841550275-5b462bf48569?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["books", "library", "research", "academic", "knowledge", "study"] },
  { url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["graduation", "success", "achievement", "students", "university"] },
  { url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["lecture", "classroom", "learning", "teacher", "higher education"] },
  { url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["campus", "building", "architecture", "modern university"] },
  { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["students", "collaboration", "meeting", "university life", "group work"] },
  { url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["library", "study", "quiet", "knowledge", "shelves"] },
  { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["technology", "team", "workshop", "digital", "modern"] },
  { url: "https://images.unsplash.com/photo-1525921429624-479b6a29d84c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["stairs", "campus", "modern", "design", "university"] },
  { url: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["students", "learning", "classroom", "international"] },

  // --- Computer Science & Engineering ---
  { url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["code", "programming", "software", "development", "it", "cs", "computer"] },
  { url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["ai", "robotics", "artificial intelligence", "innovation", "circuit", "science"] },
  { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["engineering", "mechanical", "industry", "technology", "blueprint"] },
  { url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["laptop", "coding", "developer", "technology", "workspace"] },
  { url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["it", "server", "data center", "cloud", "security"] },
  { url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["tech", "development", "it", "digital"] },

  // --- Science & Medicine ---
  { url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["lab", "microscope", "science", "biology", "chemistry", "research", "innovation"] },
  { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["medical", "healthcare", "doctor", "health", "science", "clinical"] },
  { url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["medicine", "doctor", "healthcare", "hospital"] },
  { url: "https://images.unsplash.com/photo-1530026405186-ed1f1305b3c2?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["laboratory", "test tube", "chemistry", "analysis"] },
  { url: "https://images.unsplash.com/photo-1470115636472-72369c5455ee?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["environmental science", "ecology", "biology", "research", "nature", "field work"] },

  // --- Business & Social Sciences ---
  { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["business", "administration", "corporate", "office", "architecture", "finance"] },
  { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["analysis", "meeting", "strategy", "professional", "charts", "graphs"] },
  { url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["law", "justice", "legal", "court", "gavel", "advocacy", "statue"] },
  { url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["social sciences", "community", "people", "society", "connection"] },

  // --- Arts & Humanities ---
  { url: "https://images.unsplash.com/photo-1460662136044-55cc062d8471?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["arts", "humanities", "painting", "creative", "culture", "museum", "history"] },
  { url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["sculpture", "design", "creative", "studio", "aesthetic"] },

  // --- Specific SDG Themes ---
  { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["poverty", "no poverty", "community support", "sdg 1"] },
  { url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["zero hunger", "food", "agriculture", "sdg 2"] },
  { url: "https://images.unsplash.com/photo-1542601906-a237f299e129?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["clean energy", "wind turbine", "solar", "renewable", "sdg 7"] },
  { url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["climate action", "glacier", "weather", "sdg 13", "planet"] },
  { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["life on land", "mountains", "biodiversity", "sdg 15"] },
  { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["innovation", "industry", "sdg 9", "modern"] },

  // --- Additional Sustainability & SDG ---
  { url: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["agriculture", "farming", "sustainable", "sdg 2"] },
  { url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["water", "clean water", "river", "sdg 6"] },
  { url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["energy", "solar", "renewable", "sdg 7"] },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["ocean", "sea", "life below water", "sdg 14"] },
  { url: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["growth", "economy", "decent work", "sdg 8"] },
  { url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["partnership", "meeting", "collaboration", "sdg 17"] },
  { url: "https://images.unsplash.com/photo-1444653300604-1de7af84213a?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["equality", "justice", "peace", "sdg 16"] },
  { url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["diverse", "people", "reduced inequalities", "sdg 10"] },
  { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["digital", "learning", "education", "sdg 4"] },
  { url: "https://images.unsplash.com/photo-1504384764586-bb4cdc17497b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["smart city", "urban", "sustainable cities", "sdg 11"] },
  { url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["recycling", "waste", "responsible consumption", "sdg 12"] },
  { url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["students", "university", "learning", "sdg 4"] },
  { url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["team", "business", "work", "sdg 8"] },
  { url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["code", "tech", "innovation", "sdg 9"] },
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["electronics", "circuit", "innovation", "sdg 9"] },
  { url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["server", "data", "it", "sdg 9"] },
  { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["earth", "global", "connectivity", "sdg 17"] },
  { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["education", "classroom", "learning", "sdg 4"] },
  { url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["lecture", "university", "sdg 4"] },
  { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["books", "library", "sdg 4"] },
  { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["teacher", "school", "sdg 4"] },
  { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["profile", "person", "equality", "sdg 5"] },
  { url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["business woman", "leadership", "sdg 5"] },
  { url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["community", "help", "sdg 1"] },
  { url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["volunteer", "support", "sdg 1"] },
  { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["charity", "donation", "sdg 1"] },
  { url: "https://images.unsplash.com/photo-1488459711615-228239783f78?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["food", "nutrition", "sdg 2"] },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["meal", "healthy", "sdg 2"] },
  { url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["health", "medical", "sdg 3"] },
  { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["healthcare", "doctor", "sdg 3"] },
  { url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["wellness", "health", "sdg 3"] },
  { url: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["nature", "forest", "sdg 15"] },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["woods", "environment", "sdg 15"] },
  { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["mountains", "landscape", "sdg 15"] },
  { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["nature", "mist", "sdg 15"] },
  { url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["bridge", "park", "sdg 11"] },
  { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["city", "street", "sdg 11"] },
  { url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["urban", "skyline", "sdg 11"] },
  { url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["metropolis", "cityscape", "sdg 11"] },
  { url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["peace", "dove", "sdg 16"] },
  { url: "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["law", "justice", "sdg 16"] },
  { url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", source: "Unsplash", keywords: ["court", "legal", "sdg 16"] },
];