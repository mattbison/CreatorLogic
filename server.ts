import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from 'jsonwebtoken';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // --- API ROUTES ---

  // 1. Apple Verify
  app.post("/api/apple-verify", async (req, res) => {
    const { issuerId, keyId, privateKey } = req.body;

    if (!issuerId || !keyId || !privateKey) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
      // 1. Generate JWT signed with the .p8 private key
      const token = jwt.sign({}, privateKey, {
        algorithm: 'ES256',
        expiresIn: '20m', // Apple max is 20m
        issuer: issuerId,
        audience: 'appstoreconnect-v1',
        header: {
          alg: 'ES256',
          kid: keyId,
          typ: 'JWT'
        }
      });

      // 2. Call Apple API to verify credentials work (Fetch Apps List)
      const appleRes = await fetch('https://api.appstoreconnect.apple.com/v1/apps?limit=1', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!appleRes.ok) {
          const errText = await appleRes.text();
          throw new Error(`Apple API Error: ${appleRes.status} - ${errText}`);
      }

      const data = await appleRes.json();
      const appName = data.data?.[0]?.attributes?.name || 'Unknown App';
      const appId = data.data?.[0]?.id;

      // 3. Return success
      return res.status(200).json({ 
          success: true, 
          appName,
          appId,
          message: 'Successfully connected to App Store Connect'
      });

    } catch (err: any) {
      console.error("Apple Verify Error:", err);
      return res.status(500).json({ error: err.message || 'Failed to verify credentials' });
    }
  });

  // 2. Refresh Metrics (Apify)
  app.post("/api/refresh-metrics", async (req, res) => {
    const { partnerships, token } = req.body;

    if (!partnerships || !Array.isArray(partnerships) || partnerships.length === 0) {
        return res.status(200).json({ message: 'No partnerships to refresh' });
    }

    if (!token) {
        return res.status(401).json({ error: 'Missing Apify Token' });
    }

    try {
        // Prepare URLs
        const videoUrls = partnerships.map((p: any) => p.videoUrl).filter((url: string) => url && url.includes('instagram'));

        if (videoUrls.length === 0) {
            return res.status(200).json({ message: 'No valid Instagram URLs found' });
        }

        // Trigger Apify Actor with updated params for specific video extraction
        const actorInput = {
            "includeDownloadedVideo": false,
            "includeSharesCount": true,
            "includeTranscript": false,
            "onlyPostsNewerThan": "2020-01-01",
            "resultsLimit": videoUrls.length,
            "skipPinnedPosts": true,
            "username": videoUrls // Array of URLs
        };

        const runRes = await fetch(`https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actorInput)
        });

        if (!runRes.ok) {
            throw new Error('Failed to start Apify run');
        }

        const runData = await runRes.json();
        const runId = runData.data.id;

        // Return the Run ID so frontend can poll
        return res.status(200).json({ 
            success: true, 
            runId, 
            message: 'Extraction started' 
        });

    } catch (err: any) {
        console.error("Metrics Refresh Error:", err);
        return res.status(500).json({ error: err.message });
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
