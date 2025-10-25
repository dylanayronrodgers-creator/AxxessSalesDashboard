// /api/add-agent.js
import { createClient } from "@supabase/supabase-js";

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

    // 1️⃣ Create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 2️⃣ Add agent data in your `agents` table
    const { data, error } = await supabase
      .from("agents")
      .insert([
        {
          name,
          email,
          team,
          target,
          user_id: authUser.user.id,
        },
      ]);

    if (error) throw error;

    return res.status(200).json({ success: true, agent: data[0] });
  } catch (err) {
    console.error("Add Agent API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
