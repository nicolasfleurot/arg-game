import { createClient } from '@supabase/supabase-js';

// Client Supabase côté serveur avec la clé service_role
const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
try {
// CORS (utile si tu appelles depuis un autre domaine)
if (req.method === "OPTIONS") {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
return res.status(200).json({ ok: true });
}

// On n’accepte que POST
if (req.method !== "POST") {
  return res.status(405).json({ error: "Method not allowed" });
}

// Récupération du body (string ou objet déjà parsé)
let body = req.body;
if (typeof body === "string") {
  try {
    body = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ error: "JSON invalide" });
  }
}

const { user_id, lat, lon } = body || {};

// Vérification des champs
if (!user_id || lat == null || lon == null) {
  return res
    .status(400)
    .json({ error: "user_id, lat et lon sont requis" });
}

// Écriture / mise à jour dans Supabase
const { data, error } = await supabase
  .from("positions")
  .upsert(
    { user_id, lat, lon },
    { onConflict: ["user_id"] } // utilisera la PK user_id
  );

if (error) {
  console.error("Supabase error:", error);
  return res.status(500).json({ error: error.message });
}

// Réponse OK
return res.status(200).json({ ok: true, data });
} catch (e) {
console.error("Handler error:", e);
return res.status(500).json({ error: "Internal server error" });
}
}
