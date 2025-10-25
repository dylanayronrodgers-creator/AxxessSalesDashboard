// api/create-user.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = process.env.https://dsxogtkqbqdobkshckjy.supabase.co;
const SUPABASE_SERVICE_ROLE_KEY = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeG9ndGtxYnFkb2Jrc2hja2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzkyOTMsImV4cCI6MjA3NjgxNTI5M30.Hcpx-DWykTsWY6kw0DyKaY2lppBfAk7X6MJKXeRHwMQ;

const supabaseAdmin = createClient(https://dsxogtkqbqdobkshckjy.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeG9ndGtxYnFkb2Jrc2hja2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzkyOTMsImV4cCI6MjA3NjgxNTI5M30.Hcpx-DWykTsWY6kw0DyKaY2lppBfAk7X6MJKXeRHwMQ);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, email, password, team_id, target } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true
    });
    if (error) return res.status(400).json({ error: error.message || error });

    const userId = data.user.id;
    const { error: insertError } = await supabaseAdmin.from('agents').insert({
      id: userId, name: name || email.split('@')[0], email, target: target||0, sales: 0, team_id: team_id || null
    });
    if (insertError) {
      try { await supabaseAdmin.auth.admin.deleteUser(userId); } catch(e){}
      return res.status(400).json({ error: insertError.message || insertError });
    }

    return res.status(200).json({ success: true, id: userId, email });
  } catch (err) {
    console.error('create-user error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
