
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS check for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

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

  } catch (err) {
    console.error("Apple Verify Error:", err);
    return res.status(500).json({ error: err.message || 'Failed to verify credentials' });
  }
}
