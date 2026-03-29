import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import "dotenv/config";

console.log("🚀 SDG-INSIGHT: Starting server initialization...");

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ASSESSMENTS_FILE = path.join(DATA_DIR, "assessments.json");
const UNSPLASH_CACHE_FILE = path.join(DATA_DIR, "unsplash_cache.json");

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(ASSESSMENTS_FILE)) {
  fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(UNSPLASH_CACHE_FILE)) {
  fs.writeFileSync(UNSPLASH_CACHE_FILE, JSON.stringify({}));
}

function getUnsplashCache() {
  try {
    return JSON.parse(fs.readFileSync(UNSPLASH_CACHE_FILE, "utf-8"));
  } catch (e) {
    return {};
  }
}

function saveUnsplashCache(cache: any) {
  try {
    fs.writeFileSync(UNSPLASH_CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.error("Failed to save Unsplash cache:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.3", mode: process.env.NODE_ENV });
  });

  // --- API ROUTES ---

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  app.post("/api/auth/signup", (req, res) => {
    const { email, fullName, role, password, institution, country } = req.body;

    // Validation
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    if (!fullName || !role || !institution || !country) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    if (users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = {
      id: Math.random().toString(36).slice(2, 11),
      email,
      fullName,
      role,
      password, // In a real app, we would hash this
      institution,
      country,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    const { password: _, ...safeUser } = newUser;
    res.json(safeUser);
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/assessments", (req, res) => {
    const { userId, dept, scores } = req.body;

    if (!userId || !dept || !scores) {
      return res.status(400).json({ error: "Missing assessment data" });
    }

    const assessments = JSON.parse(fs.readFileSync(ASSESSMENTS_FILE, "utf-8"));
    const newAssessment = {
      id: Math.random().toString(36).slice(2, 11),
      userId,
      dept,
      scores,
      timestamp: new Date().toISOString(),
    };

    assessments.push(newAssessment);
    fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify(assessments, null, 2));

    res.json(newAssessment);
  });

  app.get("/api/assessments/:userId", (req, res) => {
    const { userId } = req.params;
    const assessments = JSON.parse(fs.readFileSync(ASSESSMENTS_FILE, "utf-8"));
    const userAssessments = assessments.filter((a: any) => a.userId === userId);
    res.json(userAssessments);
  });

  app.get("/api/admin/results", (req, res) => {
    const assessments = JSON.parse(fs.readFileSync(ASSESSMENTS_FILE, "utf-8"));
    res.json(assessments);
  });

  app.get("/api/admin/users", (req, res) => {
    const { adminId } = req.query;
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    
    if (adminId) {
      const admin = users.find((u: any) => u.id === adminId && u.role === "Admin");
      if (admin) {
        // Filter users by admin's institution
        const filteredUsers = users.filter((u: any) => u.institution === admin.institution);
        const safeUsers = filteredUsers.map(({ password, ...u }: any) => u);
        return res.json(safeUsers);
      }
    }
    
    const safeUsers = users.map(({ password, ...u }: any) => u);
    res.json(safeUsers);
  });

  app.post("/api/admin/create-user", (req, res) => {
    const { adminId, email, fullName, role, password, institution, country } = req.body;

    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const admin = users.find((u: any) => u.id === adminId && u.role === "Admin");

    if (!admin) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }

    if (institution !== admin.institution) {
      return res.status(403).json({ error: "Unauthorized: Can only create users for your own institution" });
    }

    // Validation
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    if (!fullName || !role || !institution || !country) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = {
      id: Math.random().toString(36).slice(2, 11),
      email,
      fullName,
      role,
      password,
      institution,
      country,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    const { password: _, ...safeUser } = newUser;
    res.json(safeUser);
  });

  app.patch("/api/admin/update-user/:id", (req, res) => {
    const { id } = req.params;
    const { adminId, ...updates } = req.body;

    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const admin = users.find((u: any) => u.id === adminId && u.role === "Admin");
    const targetUserIndex = users.findIndex((u: any) => u.id === id);

    if (!admin) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }

    if (targetUserIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const targetUser = users[targetUserIndex];

    if (targetUser.institution !== admin.institution) {
      return res.status(403).json({ error: "Unauthorized: Can only update users for your own institution" });
    }

    // Update fields
    if (updates.password && updates.password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const updatedUser = { ...targetUser, ...updates };
    users[targetUserIndex] = updatedUser;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    const { password: _, ...safeUser } = updatedUser;
    res.json(safeUser);
  });

  app.delete("/api/assessments/:id", (req, res) => {
    const { id } = req.params;
    let assessments = JSON.parse(fs.readFileSync(ASSESSMENTS_FILE, "utf-8"));
    assessments = assessments.filter((a: any) => a.id !== id);
    fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify(assessments, null, 2));
    res.json({ success: true });
  });

  // In-memory storage for custom universities added by admins
  const customUniversities: { name: string, country: string, address?: string }[] = [];

  app.get("/api/universities", async (req, res) => {
    const { name, country } = req.query;
    if (!name || !country) {
      return res.status(400).json({ error: "Missing name or country" });
    }
    try {
      const countryStr = country as string;
      const nameStr = (name as string).toLowerCase();

      // First, check custom universities
      const localMatches = customUniversities
        .filter(u => u.country === countryStr && u.name.toLowerCase().includes(nameStr))
        .map(u => ({ name: u.name, isCustom: true }));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      // Hardcoded mapping for common countries to ensure instant success
      const COUNTRY_LIST_MAPPING: Record<string, string[]> = {
        "India": ["List of universities in India", "List of private universities in India"],
        "United Kingdom": ["List of universities in the United Kingdom"],
        "United States": ["List of universities in the United States", "List of private colleges and universities in the United States"],
        "Canada": ["List of universities in Canada"],
        "Australia": ["List of universities in Australia"],
        "Germany": ["List of universities in Germany"],
        "France": ["List of universities in France"],
        "China": ["List of universities in China"],
        "Japan": ["List of universities in Japan"],
        "Brazil": ["List of universities in Brazil"]
      };

      let targetPages = COUNTRY_LIST_MAPPING[countryStr] || [];

      if (targetPages.length === 0) {
        // Step 1: Get all links from the master list page if not hardcoded
        const masterPage = "Lists_of_universities_and_colleges_by_country";
        const masterUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${masterPage}&prop=links&format=json&origin=*`;
        
        const masterResponse = await fetch(masterUrl, { signal: controller.signal });
        const masterData: any = await masterResponse.json();
        
        if (masterData.parse && masterData.parse.links) {
          const masterLinks = masterData.parse.links;
          // Find all relevant list pages (main, private, etc.)
          const relevantLinks = masterLinks.filter((link: any) => {
            const title = link["*"];
            return title.includes(countryStr) && 
                   (title.includes("List of universities") || 
                    title.includes("List of colleges") || 
                    title.includes("List of private universities"));
          });
          
          if (relevantLinks.length > 0) {
            targetPages = relevantLinks.map((l: any) => l["*"]);
          } else {
            targetPages = [`List of universities in ${countryStr}`];
          }
        } else {
          targetPages = [`List of universities in ${countryStr}`];
        }
      }

      // Step 2: Get links from all identified target pages
      let allLinks: any[] = [];
      for (const page of targetPages.slice(0, 3)) { // Limit to top 3 relevant pages to avoid excessive requests
        try {
          const countryUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=links&format=json&origin=*`;
          const countryResponse = await fetch(countryUrl, { signal: controller.signal });
          const countryData: any = await countryResponse.json();
          if (countryData.parse && countryData.parse.links) {
            allLinks = [...allLinks, ...countryData.parse.links];
          }
        } catch (e) {
          console.warn(`Failed to parse page ${page}:`, e);
        }
      }

      let results: { name: string }[] = [];

      if (allLinks.length > 0) {
        const institutionKeywords = [
          "university", "college", "institute", "school", "academy", 
          "polytechnic", "iit", "nit", "iim", "iisc", "private", "autonomous"
        ];
        
        // Use a Set to avoid duplicates from multiple pages
        const uniqueTitles = new Set<string>();
        
        results = allLinks
          .filter((link: any) => {
            if (link.ns !== 0) return false;
            const title = link["*"];
            const titleLower = title.toLowerCase();
            
            if (!titleLower.includes(nameStr)) return false;
            if (title.startsWith("List of") || title.includes("Education in") || title.includes("Lists of")) return false;
            
            const isInstitution = institutionKeywords.some(kw => titleLower.includes(kw));
            if (!isInstitution) return false;
            
            if (uniqueTitles.has(title)) return false;
            uniqueTitles.add(title);
            return true;
          })
          .map((link: any) => ({ name: link["*"] }))
          .slice(0, 30);
      }

      // Final Fallback: If hierarchy traversal yields nothing, use broad search
      if (results.length === 0) {
        const broadUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(nameStr + " " + countryStr + " university")}&limit=20&namespace=0&format=json&origin=*`;
        const broadResponse = await fetch(broadUrl, { signal: controller.signal });
        const broadData: any = await broadResponse.json();
        const titles = broadData[1] || [];
        results = titles.map((title: string) => ({ name: title }));
      }
      
      clearTimeout(timeout);
      
      // Combine local matches with Wikipedia results
      const combinedResults = [...localMatches, ...results];
      
      // Remove duplicates if any (case-insensitive name check)
      const seen = new Set();
      const finalResults = combinedResults.filter(u => {
        const lower = u.name.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });

      res.json(finalResults);
    } catch (err: any) {
      console.error("Wikipedia hierarchy search failed:", err.message);
      res.json([]);
    }
  });

  app.post("/api/universities/add", express.json(), (req, res) => {
    const { name, country, address, role } = req.body;
    
    // Simple admin check based on role passed from frontend
    if (role !== 'Admin') {
      return res.status(403).json({ error: "Only admins can add universities" });
    }

    if (!name || !country) {
      return res.status(400).json({ error: "Name and country are required" });
    }

    const exists = customUniversities.some(u => u.name.toLowerCase() === name.toLowerCase() && u.country === country);
    if (exists) {
      return res.status(400).json({ error: "University already exists in our dataset" });
    }

    customUniversities.push({ name, country, address });
    res.json({ success: true, message: "University added successfully" });
  });

  // --- UNSPLASH PROXY ---
  app.get("/api/images/search", async (req, res) => {
    const { query } = req.query;
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const cacheKey = (query as string).toLowerCase().trim();
    const cache = getUnsplashCache();

    // Check if we have a cache entry and it has images
    let cacheEntry = cache[cacheKey];
    
    // Migration: If cache entry is old format (single object), convert to new format
    if (cacheEntry && !Array.isArray(cacheEntry.images) && cacheEntry.url) {
      cacheEntry = {
        query: cacheEntry.query || query,
        images: [{
          url: cacheEntry.url,
          source: cacheEntry.source || "Unsplash",
          photographer: cacheEntry.photographer,
          photographerUrl: cacheEntry.photographerUrl,
          downloadLocation: cacheEntry.downloadLocation
        }],
        timestamp: cacheEntry.timestamp
      };
      cache[cacheKey] = cacheEntry;
      saveUnsplashCache(cache);
    }

    // Invalidation: If cache entry exists but images are missing photographer info, invalidate it
    if (cacheEntry && Array.isArray(cacheEntry.images) && cacheEntry.images.length > 0) {
      const hasPhotographerInfo = cacheEntry.images.every((img: any) => img.photographer);
      if (!hasPhotographerInfo) {
        console.log(`[Unsplash Cache] Invalidating entry for "${query}" due to missing photographer info.`);
        delete cache[cacheKey];
        saveUnsplashCache(cache);
        cacheEntry = undefined;
      }
    }

    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    const isCacheOld = cacheEntry && (Date.now() - new Date(cacheEntry.timestamp).getTime() > CACHE_EXPIRY);
    
    // If we have 15 or more images and the cache is not old, just return a random one
    if (cacheEntry && Array.isArray(cacheEntry.images) && cacheEntry.images.length >= 15 && !isCacheOld) {
      console.log(`[Unsplash Cache] Hit for query: "${query}" (${cacheEntry.images.length} images)`);
      const randomIndex = Math.floor(Math.random() * cacheEntry.images.length);
      return res.json(cacheEntry.images[randomIndex]);
    }

    if (!accessKey || accessKey === "YOUR_UNSPLASH_ACCESS_KEY" || accessKey.trim() === "") {
      console.warn("[Unsplash API] Key not configured. Falling back to static database.");
      if (cacheEntry && Array.isArray(cacheEntry.images) && cacheEntry.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * cacheEntry.images.length);
        return res.json(cacheEntry.images[randomIndex]);
      }
      return res.status(200).json({ error: "Unsplash API key not configured", fallback: true });
    }

    try {
      console.log(`[Unsplash API] Fetching fresh images for: "${query}"`);
      // Randomize the page to get different images each time
      const randomPage = Math.floor(Math.random() * 10) + 1; // Get a random page from 1-10
      
      // Use search/photos to get a batch of images
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query as string)}&orientation=landscape&per_page=15&page=${randomPage}`, {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.warn(`[Unsplash API] Request failed with status ${response.status}. Details: ${errorData}`);
        
        // If we have any cached images, use them as fallback
        if (cacheEntry && Array.isArray(cacheEntry.images) && cacheEntry.images.length > 0) {
          const randomIndex = Math.floor(Math.random() * cacheEntry.images.length);
          return res.json(cacheEntry.images[randomIndex]);
        }
        return res.status(200).json({ error: "Unsplash API error", details: errorData, fallback: true });
      }

      const data: any = await response.json();
      const photos = data.results || [];
      
      if (photos.length > 0) {
        const newImages = photos.map((photo: any) => ({
          url: photo.urls.regular,
          source: `Unsplash`,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          downloadLocation: photo.links.download_location
        }));

        // Merge with existing images if any
        let mergedImages = newImages;
        if (cacheEntry && Array.isArray(cacheEntry.images)) {
          const existingUrls = new Set(cacheEntry.images.map((img: any) => img.url));
          const uniqueNewImages = newImages.filter((img: any) => !existingUrls.has(img.url));
          mergedImages = [...cacheEntry.images, ...uniqueNewImages].slice(0, 50); // Cap at 50 images for more variety
        }

        const resultEntry = {
          query: query as string,
          images: mergedImages,
          timestamp: new Date().toISOString()
        };

        // Update cache
        cache[cacheKey] = resultEntry;
        saveUnsplashCache(cache);

        // Return a random one from the new batch
        const randomIndex = Math.floor(Math.random() * mergedImages.length);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return res.json(mergedImages[randomIndex]);
      }

      // If search yielded nothing, try random as fallback
      const randomResponse = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query as string)}&orientation=landscape&count=5`, {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      });

      if (randomResponse.ok) {
        const randomPhotos: any = await randomResponse.json();
        const photosArr = Array.isArray(randomPhotos) ? randomPhotos : [randomPhotos];
        
        if (photosArr.length > 0) {
          const newImages = photosArr.map((photo: any) => ({
            url: photo.urls.regular,
            source: `Unsplash`,
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
            downloadLocation: photo.links.download_location
          }));

          let mergedImages = newImages;
          if (cacheEntry && Array.isArray(cacheEntry.images)) {
            const existingUrls = new Set(cacheEntry.images.map((img: any) => img.url));
            const uniqueNewImages = newImages.filter((img: any) => !existingUrls.has(img.url));
            mergedImages = [...cacheEntry.images, ...uniqueNewImages].slice(0, 30);
          }

          cache[cacheKey] = {
            query: query as string,
            images: mergedImages,
            timestamp: new Date().toISOString()
          };
          saveUnsplashCache(cache);

          const randomIndex = Math.floor(Math.random() * mergedImages.length);
          return res.json(mergedImages[randomIndex]);
        }
      }

      res.status(404).json({ error: "No images found" });
    } catch (err: any) {
      console.error("[Unsplash Proxy] Fatal error:", err.message);
      res.status(200).json({ error: "Internal server error", fallback: true });
    }
  });

  // --- UNSPLASH DOWNLOAD TRIGGER ---
  app.post("/api/images/download", async (req, res) => {
    const { downloadLocation } = req.body;
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey || !downloadLocation) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      // Unsplash requires triggering this endpoint when an image is "used"
      const response = await fetch(downloadLocation, {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      });
      
      if (!response.ok) {
        console.warn(`[Unsplash Download] Trigger failed with status ${response.status}`);
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("Unsplash download trigger error:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Determine if we should run in production mode
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"));

  // Vite middleware for development
  if (!isProduction) {
    console.log("🛠️ SDG-INSIGHT: Running in DEVELOPMENT mode (Vite middleware enabled)");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true // Allow all hosts in dev mode too
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 SDG-INSIGHT: Running in PRODUCTION mode (Serving static files)");
    console.log(`📂 SDG-INSIGHT: Serving files from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      console.log(`🌐 SDG-INSIGHT: Fallback route hit for ${req.url}`);
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
