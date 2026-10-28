-- Audit role and active-state changes on profiles.
create table if not exists public.admin_role_audit (
  id bigint generated always as identity primary key,
  actor_id uuid,
  target_id uuid not null,
  old_role text,
  new_role text,
  old_is_active boolean,
  new_is_active boolean,
  changed_at timestamptz not null default now()
);

alter table public.admin_role_audit enable row level security;

drop policy if exists admin_role_audit_select_master on public.admin_role_audit;
create policy admin_role_audit_select_master
  on public.admin_role_audit
  for select
  to authenticated
  using (public.current_app_role() = 'admin_master');

create or replace function public.audit_admin_role_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     or new.is_active is distinct from old.is_active then
    insert into public.admin_role_audit
      (actor_id, target_id, old_role, new_role, old_is_active, new_is_active)
    values
      (auth.uid(), old.id, old.role, new.role, old.is_active, new.is_active);
  end if;
  return new;
end;
$$;

drop trigger if exists audit_admin_role_changes on public.profiles;
create trigger audit_admin_role_changes
after update of role, is_active on public.profiles
for each row
execute function public.audit_admin_role_changes();

revoke insert, update, delete on public.admin_role_audit from anon, authenticated;
grant select on public.admin_role_audit to authenticated;
