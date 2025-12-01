import { createClient } from '@supabase/supabase-js';

// Supabase côté serveur avec service_role (RLS bypass)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Gestion OPTIONS pour CORS (utile si test cross-domain)
  if (req.method === "OPTIONS") {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  // Parsing JSON du body
  let body;
  try {
    body = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: "JSON invalide" });
  }

  const { user_id, lat, lon } = body;
  if (!user_id || !lat || !lon) {
    return res.status(400).json({ error: "user_id, lat et lon requis" });
  }

  // Écriture dans Supabase
  const { data, error } = await supabase
    .from("positions")
    .upsert({ user_id, lat, lon }, { onConflict: ['user_id'] }); // upsert selon user_id

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true, data });
}
