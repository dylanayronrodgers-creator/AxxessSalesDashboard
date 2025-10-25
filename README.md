# Axxess Sales Dashboard — Quick Deploy

## Files to deploy
- index.html (login)
- manager.html
- agent.html
- tv.html
- styles.css
- supabase-config.js
- /api/create-user.js  (deploy on Vercel)
- RLS.sql (run in Supabase SQL Editor)

## Setup steps

1. **Supabase**
   - Confirm tables: `agents`, `sales_log`, `messages`, `teams`.
   - Run `RLS.sql` (create RPC and policies).
   - Enable Realtime/Replication on tables in Supabase Dashboard if needed.

2. **Vercel**
   - Push repo to GitHub with `/api/create-user.js`.
   - In Vercel Project Settings -> Environment Variables add:
     - `SUPABASE_URL = https://dsxogtkqbqdobkshckjy.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY = <service_role_key>` (KEEP SECRET).
   - Deploy.

3. **Frontend**
   - Ensure `supabase-config.js` has the anon key and project URL (already set).
   - Deploy static files (GitHub Pages or Vercel static site). Vercel auto deploys the repo and the serverless function.

4. **Test flow**
   - Open `manager.html` → Add Agent (creates Auth user + agents row).
   - Go to `index.html` → Agent login → Choose the agent and login.
   - On `agent.html` → Log sale → Check `sales_log` and `agents.sales` increased.
   - Open `tv.html` → confirm live updates.

## Troubleshooting
- **Unexpected token '<'** — Vercel function returned HTML (error). Check Vercel deployment logs and ensure env vars set.
- **Foreign key error on sales_log** — Ensure `agent_id` is a valid `agents.id` (UUID). Manager creates agent with same user UUID.
- **RPC permission error** — If RLS enabled, ensure `increment_agent_sales_secure` exists and `GRANT EXECUTE` to `authenticated`.
- **Dropdown options invisible** — Fixed via `styles.css` (z-index). If still invisible, clear browser cache.

## Security
- Never commit `SUPABASE_SERVICE_ROLE_KEY` to git.
- Use the RLS policies provided.
