-- Two small, tightly-scoped security-definer functions. Both still check
-- auth.uid() and ownership themselves — "security definer" means they run
-- with elevated privilege, not that they skip authorization.

-- ---------------------------------------------------------------------
-- create_organization: inserts the org and makes the caller its owner
-- in one transaction. Without this, the client would need to insert into
-- `organizations` then `memberships` as two separate calls, and the
-- memberships insert would fail — a brand new org has no manager yet to
-- satisfy the normal "owner/manager can add members" policy.
-- ---------------------------------------------------------------------

create or replace function public.create_organization(p_name text, p_slug text)
returns public.organizations
language plpgsql
security definer set search_path = public
as $$
declare
  v_org public.organizations;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (p_name, p_slug, auth.uid())
  returning * into v_org;

  insert into public.memberships (org_id, user_id, role, status)
  values (v_org.id, auth.uid(), 'owner', 'active');

  return v_org;
end;
$$;

-- ---------------------------------------------------------------------
-- get_invite_preview: lets an unauthenticated/non-member visitor see
-- what they're accepting (org name, role, whether it's expired) without
-- granting broad SELECT access to the invites table.
-- ---------------------------------------------------------------------

create or replace function public.get_invite_preview(p_token uuid)
returns table (
  org_name text,
  role public.org_role,
  invited_email text,
  is_expired boolean,
  is_accepted boolean
)
language sql stable security definer set search_path = public
as $$
  select o.name, i.role, i.email, (i.expires_at < now()), (i.accepted_at is not null)
  from public.invites i
  join public.organizations o on o.id = i.org_id
  where i.token = p_token;
$$;

-- ---------------------------------------------------------------------
-- accept_invite: validates the token belongs to the caller's own email,
-- isn't expired/already used, then creates the membership.
-- ---------------------------------------------------------------------

create or replace function public.accept_invite(p_token uuid)
returns public.memberships
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite public.invites;
  v_caller_email text;
  v_membership public.memberships;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_caller_email from auth.users where id = auth.uid();

  select * into v_invite from public.invites where token = p_token;

  if v_invite is null then
    raise exception 'Invite not found';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'Invite already used';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'Invite expired';
  end if;
  if lower(v_invite.email) <> lower(v_caller_email) then
    raise exception 'This invite was sent to a different email address';
  end if;

  insert into public.memberships (org_id, user_id, role, status)
  values (v_invite.org_id, auth.uid(), v_invite.role, 'active')
  on conflict (org_id, user_id) do update set role = excluded.role, status = 'active'
  returning * into v_membership;

  update public.invites set accepted_at = now() where id = v_invite.id;

  return v_membership;
end;
$$;

grant execute on function public.create_organization(text, text) to authenticated;
grant execute on function public.get_invite_preview(uuid) to anon, authenticated;
grant execute on function public.accept_invite(uuid) to authenticated;
