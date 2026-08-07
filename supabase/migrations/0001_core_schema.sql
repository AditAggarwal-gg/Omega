-- Omega core schema
-- Design: every tenant-scoped table carries org_id. Nothing is ever
-- filtered by org_id in application code alone — RLS (0002) enforces it
-- at the database layer so a bug in a page/component can't leak tenants.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  -- Global admin flag. Deliberately NOT settable by users themselves —
  -- see RLS policy that blocks updates to this column from non-admins.
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Organizations & membership
-- ---------------------------------------------------------------------

create type public.org_role as enum ('owner', 'manager', 'member');
create type public.membership_status as enum ('invited', 'active', 'removed');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.org_role not null default 'member',
  status public.membership_status not null default 'active',
  invited_email text,
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index memberships_user_id_idx on public.memberships(user_id);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role public.org_role not null default 'member',
  token uuid not null default gen_random_uuid(),
  invited_by uuid not null references public.profiles(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, email)
);

-- ---------------------------------------------------------------------
-- Premium access (per user, per org — a manager can grant it manually,
-- or a billing webhook can upsert it once Stripe/etc is wired up)
-- ---------------------------------------------------------------------

create type public.subscription_status as enum ('active', 'canceled', 'past_due');

create table public.premium_subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.subscription_status not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ---------------------------------------------------------------------
-- Content: articles, video, audio
-- ---------------------------------------------------------------------

create type public.content_type as enum ('article', 'video', 'audio');
create type public.content_status as enum ('draft', 'published', 'archived');

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  type public.content_type not null,
  title text not null,
  slug text not null,
  summary text,
  body text,               -- markdown for articles
  media_url text,          -- storage path/url for video or audio
  cover_image_url text,
  is_premium boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

create index content_items_org_status_idx on public.content_items(org_id, status);
create index content_items_published_idx on public.content_items(published_at desc) where status = 'published';

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger content_items_set_updated_at
  before update on public.content_items
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------
-- Reporting: flagged content or external links
-- ---------------------------------------------------------------------

create type public.report_reason as enum ('spam', 'abuse', 'copyright', 'broken_link', 'misinformation', 'other');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  -- org_id is nullable: a report can target a specific org's content, or
  -- be a general flagged external link with no tenant context.
  org_id uuid references public.organizations(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete cascade,
  flagged_url text,
  reporter_id uuid references public.profiles(id),
  reason public.report_reason not null,
  details text,
  status public.report_status not null default 'open',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint report_has_target check (content_id is not null or flagged_url is not null)
);

create index reports_org_status_idx on public.reports(org_id, status);

-- ---------------------------------------------------------------------
-- Privacy-friendly analytics: aggregate-first, no third-party trackers.
-- No IP address, no persistent cross-site identifier. session_id is a
-- client-generated value rotated daily and never linked to profiles.
-- ---------------------------------------------------------------------

create table public.analytics_events (
  id bigint generated always as identity primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  session_id text not null,          -- rotates daily, not tied to auth.users
  path text not null,
  referrer_domain text,
  event_name text not null default 'pageview',
  created_at timestamptz not null default now()
);

create index analytics_events_org_created_idx on public.analytics_events(org_id, created_at desc);
-- Cheap retention: keep raw events 90 days (pair with a scheduled job / pg_cron).
comment on table public.analytics_events is
  'Raw events, intended for short retention (~90d) and rollup into daily aggregates.';
