// api/reset-password.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MANAGER_SECRET = process.env.MANAGER_SECRET; // simple protection for MVP

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Simple header-based protection (MVP). For production, validate manager JWT instead.
  const headerSecret = req.headers['x-manager-secret'];
  if (!headerSecret || headerSecret !== MANAGER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { user_id, new_password } = req.body;
    if (!user_id || !new_password) {
      return res.status(400).json({ error: 'Missing user_id or new_password' });
    }

    // Call Supabase Admin API to update the user by id
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: new_password,
    });

    if (error) {
      console.error('Supabase admin error:', error);
      return res.status(400).json({ error });
    }

    // Optionally, set a user_metadata flag forcing a password change on next login:
    // await supabaseAdmin.auth.admin.updateUserById(user_id, { user_metadata: { must_change_password: true } });

    return res.status(200).json({ ok: true, user: { id: data.user.id, email: data.user.email } });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
