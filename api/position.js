import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// CORS AVANT TOUT
export default async function handler(req, res) {
  // Headers CORS IMMÉDIATS (avant toute logique)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  try {
    const { user_id, lat, lon } = typeof req.body === 'string' 
      ? JSON.parse(req.body) 
      : req.body ?? {};

    if (!user_id || lat == null || lon == null) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const { error } = await supabase
      .from('positions')
      .upsert({ user_id, lat, lon });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}
