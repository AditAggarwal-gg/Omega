create or replace function public.list_published_content(p_org_slug text default null, p_type public.content_type default null)
returns table (
  id uuid, org_id uuid, org_name text, org_slug text, type public.content_type,
  title text, slug text, summary text, cover_image_url text, is_premium boolean,
  published_at timestamptz, locked boolean
)
language sql stable security definer set search_path = public
as $$
  select
    ci.id, ci.org_id, o.name, o.slug, ci.type, ci.title, ci.slug,
    ci.summary, ci.cover_image_url, ci.is_premium, ci.published_at,
    (ci.is_premium and not public.has_premium_access(ci.org_id)) as locked
  from public.content_items ci
  join public.organizations o on o.id = ci.org_id
  where ci.status = 'published'
    and (p_org_slug is null or o.slug = p_org_slug)
    and (p_type is null or ci.type = p_type)
  order by ci.published_at desc;
$$;

create or replace function public.get_published_content(p_org_slug text, p_slug text)
returns table (
  id uuid, org_id uuid, org_name text, org_slug text, type public.content_type,
  title text, slug text, summary text, cover_image_url text, is_premium boolean,
  published_at timestamptz, locked boolean
)
language sql stable security definer set search_path = public
as $$
  select
    ci.id, ci.org_id, o.name, o.slug, ci.type, ci.title, ci.slug,
    ci.summary, ci.cover_image_url, ci.is_premium, ci.published_at,
    (ci.is_premium and not public.has_premium_access(ci.org_id)) as locked
  from public.content_items ci
  join public.organizations o on o.id = ci.org_id
  where ci.status = 'published' and o.slug = p_org_slug and ci.slug = p_slug
  limit 1;
$$;

grant execute on function public.list_published_content(text, public.content_type) to anon, authenticated;
grant execute on function public.get_published_content(text, text) to anon, authenticated;
