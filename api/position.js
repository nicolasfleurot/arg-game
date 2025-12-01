import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // 🔹 Headers CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://coral-bee-703513.hostingersite.com'); // ton domaine exact
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 🔹 Répond aux requêtes OPTIONS (préflight)
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { user_id, lat, lon } = req.body;

  const { error } = await supabase
    .from("positions")
    .upsert({ user_id, lat, lon });

  if (error) return res.status(500).json({ error });

  return res.status(200).json({ ok: true });
}
