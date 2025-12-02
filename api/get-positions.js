// api/get-positions.js (note le pluriel)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
  }

  try {
    const { data, error } = await supabase
      .from('positions')
      .select('user_id, lat, lon');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
