// api/create-user.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE env vars');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, email, password, team_id, target } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    // create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) return res.status(400).json({ error: error.message || error });

    const userId = data.user.id;

    // insert into agents table with same uuid
    const { error: insertError } = await supabaseAdmin.from('agents').insert({
      id: userId,
      name: name || email.split('@')[0],
      email,
      target: target || 0,
      sales: 0,
      team_id: team_id || null
    });

    if (insertError) {
      // cleanup auth user if agent insert failed
      try { await supabaseAdmin.auth.admin.deleteUser(userId); } catch (e) { /* ignore */ }
      return res.status(400).json({ error: insertError.message || insertError });
    }

    return res.status(200).json({ success: true, id: userId, email });
  } catch (err) {
    console.error('create-user error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

    return res.status(500).json({ error: 'Server error' });
  }
}
