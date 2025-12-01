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
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const { data, error } = await supabase
      .from('positions')
      .select('lat, lon')
      .eq('user_id', user_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Position non trouvée' });
    }

    res.status(200).json(data);
  } catch (e) {
    console.error('Handler:', e);
    res.status(500).json({ error: 'Server error' });
  }
}
