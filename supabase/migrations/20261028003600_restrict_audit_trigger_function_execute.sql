-- Trigger functions should not be callable directly through the exposed RPC API.
revoke execute on function public.audit_admin_role_changes() from public, anon, authenticated;