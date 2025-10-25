# Axxess Sales Dashboard — README

## What’s included
- `index.html` — unified login
- `agent.html` — agent portal (log sales, messages)
- `manager.html` — manager portal (add/delete agents, update targets, download CSV)
- `tv.html` — TV live dashboard
- `supabase-config.js` — client config (replace placeholders)
- `supabase-setup.sql` — RLS + RPC & policies (run once in SQL editor)
- `api/create-user.js` — Vercel serverless function to create auth users (requires service role key)

---

## Setup (Supabase)
1. In Supabase SQL Editor run `supabase-setup.sql`.
2. Ensure tables exist:
   - `agents` (id uuid PK, name text, email text unique, target numeric, sales numeric, team_id int4/int8)
   - `sales_log` (id uuid PK, agent_id uuid FK agents(id), package_type text NOT NULL, amount numeric NOT NULL, date timestamptz default now())
   - `messages` (id uuid PK, content text, from_id uuid, to_id uuid, timestamp timestamptz default now())
   - `teams` (id int PK, name text)
3. Add sample agent rows (use Table Editor) and confirm `id` values.

---

## Setup (Vercel)
1. Add project to Vercel (link GitHub repo).
2. Environment variables (Vercel project settings):
   - `SUPABASE_URL` = `https://<yourproject>.supabase.co`
   - `SUPABASE_ANON_KEY` = your anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (for `/api/create-user`)
3. Deploy — Vercel will build serverless endpoint `/api/create-user`.

---

## Local / Quick test
1. Replace placeholders in `supabase-config.js` with your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. Serve the static files (open `index.html`) or host on Vercel/GitHub Pages.
3. Use login:
   - Manager email: `stephanie@internet.co.za` (or the manager you set)
   - Agent: choose from dropdown (public list)

---

## Troubleshooting
- **"new row violates row-level security policy"** — make sure you've executed `supabase-setup.sql` and enabled RLS. Confirm `sales_insert_own` policy is present.
- **"Unexpected token '<' ... not valid JSON"** on Add Agent — serverless function returned HTML (crash). Check Vercel function logs. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel.
- **Sales not updating** — verify RPC `increment_agent_sales_secure` exists and granted to `authenticated`. Also verify `sales_log` row inserted and `agent_id` equals `auth.uid()` of the logged-in user.
- **Agent dropdown empty** — check `public_agent_list` policy exists and agents table has id,name,email values.
- **Real-time not updating** — make sure Realtime is enabled for the tables in Supabase settings (Replication -> Tables -> enable for agents, messages, sales_log).

---

## Security notes
- Do **not** put the Service Role key in client-side code.
- Keep RLS enabled once testing is complete.

