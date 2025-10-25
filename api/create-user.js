import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, team, target } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // 1️⃣ Create the Supabase Auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('Auth error:', error);
      return res.status(400).json({ error: error.message });
    }

    const userId = data.user.id;

    // 2️⃣ Add to agents table
    const { error: insertError } = await supabaseAdmin
      .from('agents')
      .insert({
        id: userId,
        name: name || email.split('@')[0],
        email,
        team: team || 'Unassigned',
        target: target || 0,
        sales: 0,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(400).json({ error: insertError.message });
    }

    // 3️⃣ Return JSON success
    return res.status(200).json({
      success: true,
      id: userId,
      email,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
