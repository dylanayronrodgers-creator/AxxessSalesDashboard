// api/create-user.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, team_id, target } = req.body || {};

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Create user in Supabase Auth
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message || 'Failed to create user' });
    }

    const userId = data.user.id;

    // Insert agent into database
    const { error: insertError } = await supabaseAdmin.from('agents').insert({
      id: userId,
      name: name || email.split('@')[0],
      email,
      target: target || 0,
      sales: 0,
      team_id: team_id || null,
    });

    if (insertError) {
      // Rollback: Delete the user if agent insert fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteErr) {
        console.error('Rollback error:', deleteErr);
      }
      return res.status(400).json({ error: insertError.message || 'Failed to create agent record' });
    }

    return res.status(200).json({ 
      success: true, 
      id: userId, 
      email,
      message: 'Agent created successfully'
    });

  } catch (err) {
    console.error('create-user error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
