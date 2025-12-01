// api/position.js (Node / Vercel serverless)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role key (SECRET)
);

// CORS HEADERS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

export default async function handler(req, res) {
  // CORS immédiat
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  try {
    // Récupérer Authorization Bearer <token>
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];

    // Vérifier le token via Supabase Admin
    // supabase-js v2
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    // si tu utilises supabase-js v1, fais :
    // const { user, error } = await supabaseAdmin.auth.api.getUser(token);

    if (userErr || !userData?.user) {
      console.error('Auth error', userErr);
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = userData.user; // contient id (UUID)
    const user_id = user.id;

    // parse body
    const { lat, lon } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    if (lat == null || lon == null) {
      return res.status(400).json({ error: 'Missing lat/lon' });
    }

    // Upsert position (on utilise service_role ici pour faire upsert "fiable")
    const { error } = await supabaseAdmin
      .from('positions')
      .upsert({ user_id, lat, lon, updated_at: new Date().toISOString() }, { returning: 'representation' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Server error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
