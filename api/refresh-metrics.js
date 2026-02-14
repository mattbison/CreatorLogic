
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { partnerships, token } = req.body;

    if (!partnerships || !Array.isArray(partnerships) || partnerships.length === 0) {
        return res.status(200).json({ message: 'No partnerships to refresh' });
    }

    if (!token) {
        return res.status(401).json({ error: 'Missing Apify Token' });
    }

    try {
        // Prepare URLs
        const videoUrls = partnerships.map(p => p.videoUrl).filter(url => url && url.includes('instagram'));

        if (videoUrls.length === 0) {
            return res.status(200).json({ message: 'No valid Instagram URLs found' });
        }

        // Trigger Apify Actor
        const actorInput = {
            "includeDownloadedVideo": false,
            "includeSharesCount": true,
            "includeTranscript": false,
            "onlyPostsNewerThan": "2024-01-01", // Default to recent
            "resultsLimit": videoUrls.length,
            "skipPinnedPosts": true,
            "username": videoUrls // Using URLs as 'username' input per user request
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

    } catch (err) {
        console.error("Metrics Refresh Error:", err);
        return res.status(500).json({ error: err.message });
    }
}
