import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  let body;
  try {
    body = JSON.parse(req.body); // ✅ corrige le 500
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { user_id, lat, lon } = body;
  if (!user_id || !lat || !lon) return res.status(400).json({ error: "user_id, lat et lon requis" });

  const { data, error } = await supabase
    .from("positions")
    .upsert({ user_id, lat, lon }); // ou .insert({ user_id, lat, lon })

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true, data });
}
