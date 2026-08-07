# Omega

Multi-organization publishing platform. Nuxt 4 + Supabase, tenant isolation
enforced via Postgres Row Level Security.

## What's in this step (Step 1: foundation)

- Nuxt 4.5 project skeleton (`app/` source layout), Tailwind, PWA config
- Full design token system (`tailwind.config.ts`, `app/assets/css/main.css`)
- Complete Supabase schema + RLS policies (`supabase/migrations/`):
  - `organizations`, `memberships` (owner/manager/member), `invites`
  - `content_items` (article/video/audio, draft/published/archived, premium flag)
  - `premium_subscriptions` (per-user, per-org entitlement)
  - `reports` (flagged content or external links)
  - `analytics_events` (cookie-free, first-party)
  - `profiles` with a `is_platform_admin` flag for the global admin, and a
    trigger that auto-creates a profile row on signup
- Every table has RLS **enabled by default** — nothing is readable or
  writable until a policy explicitly opens it up
- Homepage, default layout, and the composable/middleware pattern used for
  role gating throughout the app

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase project's URL + keys
```

Create a Supabase project (or run one locally with `supabase start`), then
apply the migrations:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npm run db:types   # regenerates app/types/database.types.ts from the real schema
npm run dev
```

## How tenant isolation actually works here

1. **Never trust the client.** Every query goes through `@nuxtjs/supabase`'s
   client, which carries the user's JWT. Postgres evaluates RLS policies
   against `auth.uid()` on every single row — there's no query a page can
   write that bypasses this.
2. **Security-definer helper functions** (`is_org_member`, `org_role`,
   `is_org_manager`, `has_premium_access`, `is_platform_admin`) centralize
   the access logic so policies stay readable and consistent, and so they
   can read `memberships` without infinite RLS recursion.
3. **The service role key** (bypasses RLS) is only ever used in Nitro
   server routes for genuinely cross-tenant operations (e.g. the platform
   admin dashboard's aggregate views) — never shipped to the client.
4. **UI-layer middleware** (`require-manager.ts`, `require-platform-admin.ts`)
   is defense-in-depth for a good user experience (redirect before a
   flash of wrong content) — the database is the actual authority.

## Step 2: auth, org creation, invites

- `/signup`, `/login`, `/confirm` — email/password auth
- `/app` — lists your organizations, or lets you create one (auto-redirects
  straight into the org if you only belong to one)
- `/app/[org]` — dashboard shell (real content comes in Step 3)
- `/app/[org]/team` — manager/owner-only: roster + role changes + invite links
- `/join/[token]` — public invite-preview page; requires signing in with the
  invited email before it lets you accept
- New SQL: `supabase/migrations/0003_org_and_invite_functions.sql` adds
  `create_organization`, `get_invite_preview`, `accept_invite` — all
  security-definer functions that still check `auth.uid()` and ownership
  themselves, used to solve the "can't add yourself as owner because you're
  not a manager yet" bootstrapping problem cleanly instead of loosening RLS.

## Roadmap (next steps)

- [ ] Step 3 — Public content browsing (`/content`, `/content/[slug]`) with
      the premium paywall UI
- [ ] Step 4 — Org dashboard (`/app/[org]`): content editor, team
      management, invites
- [ ] Step 5 — Platform admin (`/omega-admin`): cross-org overview, user
      management, reports triage
- [ ] Step 6 — Reporting/flagging UI wired to the `reports` table
- [ ] Step 7 — First-party analytics beacon + a simple dashboard chart
- [ ] Step 8 — PWA icons, offline fallback page, deploy guide
