import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role key
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS préflight
  if (req.method === "OPTIONS") return res.status(200).end();

  // POST uniquement
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  // ⚡ Parser correctement le JSON
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { user_id, lat, lon } = body;

  if (!user_id || !lat || !lon) {
    return res.status(400).json({ error: "user_id, lat et lon requis" });
  }

  // Upsert dans Supabase
  const { error } = await supabase
    .from("positions")
    .upsert({ user_id, lat, lon });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
