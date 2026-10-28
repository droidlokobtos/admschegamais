-- Protect Admin Master accounts.
-- Any current Admin Master may promote an ADM, but only Paçoca may
-- deactivate or demote an account that currently has the Admin Master role.

create or replace function public.protect_admin_master_account_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_pacoca_id constant uuid := '550e96d4-a39d-43d9-b35a-0c4774d4f1b3';
begin
  if old.role = 'admin_master'
     and (
       new.role is distinct from old.role
       or (old.is_active = true and new.is_active = false)
     )
     and auth.uid() is distinct from v_pacoca_id then
    raise exception 'Somente o ADM Paçoca pode desligar ou remover o acesso Admin Master de outro Admin Master.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_admin_master_account_changes on public.profiles;

create trigger protect_admin_master_account_changes
before update of role, is_active on public.profiles
for each row
execute function public.protect_admin_master_account_changes();
