-- Fix PostgreSQL 42P17: infinite recursion detected in policy for relation "user_profiles".
-- Admin policies subqueried user_profiles from inside user_profiles RLS → recursion.
-- Use SECURITY DEFINER so the admin check reads user_profiles without re-entering RLS.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can select all profiles" on public.user_profiles;
create policy "Admins can select all profiles"
  on public.user_profiles
  for select
  using (public.is_admin());

drop policy if exists "Admins can update any profile" on public.user_profiles;
create policy "Admins can update any profile"
  on public.user_profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can select all financial plans" on public.financial_plans;
create policy "Admins can select all financial plans"
  on public.financial_plans
  for select
  using (public.is_admin());

drop policy if exists "Admins can select all checkout transactions" on public.checkout_transactions;
create policy "Admins can select all checkout transactions"
  on public.checkout_transactions
  for select
  using (public.is_admin());

drop policy if exists "Admins can select all audit logs" on public.audit_logs;
create policy "Admins can select all audit logs"
  on public.audit_logs
  for select
  using (public.is_admin());
