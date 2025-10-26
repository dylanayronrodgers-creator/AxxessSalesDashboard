// /api/add-agent.js
import { createClient } from "@supabase/supabase-js";

// ✅ Use SERVER-ONLY keys from environment
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, password, team, target } = req.body;
    if (!name || !email || !password || !team || !target) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 2️⃣ Insert into `agents` table
    const { data, error } = await supabase.from("agents").insert([
      {
        id: authUser.user.id,
        full_name: name,
        email,
        team,
        target,
      },
    ]);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Add agent error:", err);
    return res.status(500).json({ error: err.message });
  }
}
