import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // 🔹 Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id manquant" });

  const { data, error } = await supabase
    .from("positions")
    .select("lat, lon, updated_at")
    .eq("user_id", user_id)
    .single();

  if (error) return res.status(500).json({ error });

  return res.status(200).json(data);
}
