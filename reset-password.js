import {{ createClient }} from '@supabase/supabase-js';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {{
  if (req.method !== 'POST') return res.status(405).json({{ error: 'Method not allowed' }});
  const {{ email, newPassword }} = req.body || {{}};
  if (!email || !newPassword) return res.status(400).json({{ error: 'Missing' }});
  // Find user
  const {{ data: users, error: uerr }} = await supabase.auth.admin.listUsers();
  if (uerr) return res.status(500).json({{ error: uerr.message }});
  const user = (users?.users||[]).find(u => u.email === email);
  if (!user) return res.status(404).json({{ error: 'User not found' }});
  const {{ error }} = await supabase.auth.admin.updateUserById(user.id, {{ password: newPassword }});
  if (error) return res.status(500).json({{ error: error.message }});
  // Optionally update agents table password as plaintext
  await supabase.from('agents').update({{ password: newPassword }}).eq('id', user.id);
  res.json({{ success: true }});
}
