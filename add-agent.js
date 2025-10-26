import {{ createClient }} from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {{
  try {{
    if (req.method !== 'POST') return res.status(405).json({{ error: 'Method not allowed' }});
    const {{ name, email, password, team, target }} = req.body || {{}};
    if (!name || !email || !password) return res.status(400).json({{ error: 'Missing required fields' }});

    // 1) Create Auth user (admin)
    const {{ data: authUser, error: authError }} = await supabase.auth.admin.createUser({{
      email,
      password,
      email_confirm: true,
    }});
    if (authError) return res.status(500).json({{ error: authError.message || String(authError) }});

    // 2) Insert into agents (store plain-text password as requested)
    const {{ data, error }} = await supabase
      .from('agents')
      .insert([{ id: authUser.user.id, full_name: name, email, team_id: team, target: target || 0, password: password }]);
    if (error) return res.status(500).json({{ error: error.message || String(error) }});

    return res.status(200).json({{ id: authUser.user.id, data }});
  }} catch (err) {{
    console.error('Add agent error:', err);
    return res.status(500).json({{ error: String(err) }});
  }}
}
