create or replace function public.is_org_manager(target_org uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.org_role(target_org) in ('owner', 'manager'), false);
$$;
