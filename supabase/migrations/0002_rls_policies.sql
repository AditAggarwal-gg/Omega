-- Omega RLS
-- Everything defaults closed. Every table below gets `enable row level
-- security`, and access is only ever opened up explicitly, per action.

-- ---------------------------------------------------------------------
-- Helper functions (security definer so they can read memberships
-- without recursively triggering RLS on memberships itself)
-- ---------------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select is_platform_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.org_role(target_org uuid)
returns public.org_role
language sql stable security definer set search_path = public
as $$
  select role from public.memberships
  where org_id = target_org and user_id = auth.uid() and status = 'active';
$$;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where org_id = target_org and user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.is_org_manager(target_org uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.org_role(target_org) in ('owner', 'manager');
$$;

create or replace function public.has_premium_access(target_org uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.premium_subscriptions
    where org_id = target_org and user_id = auth.uid() and status = 'active'
      and (current_period_end is null or current_period_end > now())
  ) or public.is_org_manager(target_org);
$$;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_platform_admin());

create policy "profiles: read org co-members" on public.profiles
  for select using (
    exists (
      select 1 from public.memberships m1
      join public.memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = profiles.id and m2.user_id = auth.uid()
        and m1.status = 'active' and m2.status = 'active'
    )
  );

create policy "profiles: update own (not admin flag)" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and is_platform_admin = (select is_platform_admin from public.profiles p where p.id = auth.uid()));

-- ---------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------

alter table public.organizations enable row level security;

create policy "organizations: members can read" on public.organizations
  for select using (public.is_org_member(id) or public.is_platform_admin());

create policy "organizations: any authenticated user can create" on public.organizations
  for insert with check (auth.uid() is not null);

create policy "organizations: owners can update" on public.organizations
  for update using (public.org_role(id) = 'owner' or public.is_platform_admin());

create policy "organizations: owners or admin can delete" on public.organizations
  for delete using (public.org_role(id) = 'owner' or public.is_platform_admin());

-- ---------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------

alter table public.memberships enable row level security;

create policy "memberships: read within own org" on public.memberships
  for select using (public.is_org_member(org_id) or user_id = auth.uid() or public.is_platform_admin());

create policy "memberships: owner/manager can add" on public.memberships
  for insert with check (public.is_org_manager(org_id) or public.is_platform_admin());

create policy "memberships: owner/manager can update roles" on public.memberships
  for update using (public.is_org_manager(org_id) or public.is_platform_admin());

create policy "memberships: owner/manager can remove, or self can leave" on public.memberships
  for delete using (public.is_org_manager(org_id) or user_id = auth.uid() or public.is_platform_admin());

-- ---------------------------------------------------------------------
-- invites
-- ---------------------------------------------------------------------

alter table public.invites enable row level security;

create policy "invites: managers can read" on public.invites
  for select using (public.is_org_manager(org_id) or public.is_platform_admin());

create policy "invites: managers can create" on public.invites
  for insert with check (public.is_org_manager(org_id) or public.is_platform_admin());

create policy "invites: managers can revoke" on public.invites
  for delete using (public.is_org_manager(org_id) or public.is_platform_admin());

-- ---------------------------------------------------------------------
-- premium_subscriptions
-- ---------------------------------------------------------------------

alter table public.premium_subscriptions enable row level security;

create policy "premium: user reads own, managers read org's" on public.premium_subscriptions
  for select using (user_id = auth.uid() or public.is_org_manager(org_id) or public.is_platform_admin());

create policy "premium: managers can grant" on public.premium_subscriptions
  for insert with check (public.is_org_manager(org_id) or public.is_platform_admin());

create policy "premium: managers can update" on public.premium_subscriptions
  for update using (public.is_org_manager(org_id) or public.is_platform_admin());

-- ---------------------------------------------------------------------
-- content_items
-- ---------------------------------------------------------------------

alter table public.content_items enable row level security;

-- Public, published, non-premium content is readable by anyone (anon
-- included) — this is what powers the public content area.
create policy "content: public can read published free content" on public.content_items
  for select using (status = 'published' and is_premium = false);

-- Org members can always read their org's content (drafts included).
create policy "content: members read all org content" on public.content_items
  for select using (public.is_org_member(org_id) or public.is_platform_admin());

-- Premium published content requires an active entitlement, even for
-- members who aren't managers (managers already pass has_premium_access).
create policy "content: premium requires entitlement" on public.content_items
  for select using (
    status = 'published' and is_premium = true and public.has_premium_access(org_id)
  );

create policy "content: managers and authors can insert" on public.content_items
  for insert with check (public.is_org_member(org_id) and author_id = auth.uid());

create policy "content: authors or managers can update" on public.content_items
  for update using (
    (author_id = auth.uid() and public.is_org_member(org_id)) or public.is_org_manager(org_id) or public.is_platform_admin()
  );

create policy "content: authors or managers can delete" on public.content_items
  for delete using (
    (author_id = auth.uid() and public.is_org_member(org_id)) or public.is_org_manager(org_id) or public.is_platform_admin()
  );

-- ---------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------

alter table public.reports enable row level security;

create policy "reports: anyone signed in can file" on public.reports
  for insert with check (auth.uid() is not null and reporter_id = auth.uid());

create policy "reports: reporter can read own" on public.reports
  for select using (reporter_id = auth.uid());

create policy "reports: org managers read org reports" on public.reports
  for select using (org_id is not null and public.is_org_manager(org_id));

create policy "reports: platform admin reads all" on public.reports
  for select using (public.is_platform_admin());

create policy "reports: managers or admin triage" on public.reports
  for update using (
    (org_id is not null and public.is_org_manager(org_id)) or public.is_platform_admin()
  );

-- ---------------------------------------------------------------------
-- analytics_events — write-only for the public (privacy-friendly
-- pageview beacon), read restricted to org managers / platform admin.
-- ---------------------------------------------------------------------

alter table public.analytics_events enable row level security;

create policy "analytics: anyone can record an event" on public.analytics_events
  for insert with check (true);

create policy "analytics: org managers read own org" on public.analytics_events
  for select using (org_id is not null and public.is_org_manager(org_id));

create policy "analytics: platform admin reads all" on public.analytics_events
  for select using (public.is_platform_admin());
