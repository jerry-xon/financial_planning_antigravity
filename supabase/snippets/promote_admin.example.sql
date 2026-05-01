-- =============================================================================
-- Promote an operator to admin (run in Supabase → SQL Editor only)
-- =============================================================================
-- Why SQL Editor? RLS policy "Users can update own profile" prevents changing
-- your own `role` from the app or Table Editor (role must stay equal to itself
-- in a way that blocks role changes). The SQL Editor runs with privileges that
-- bypass RLS, so this UPDATE applies cleanly.
--
-- Before this: apply migration 20260502120000_admin_role_rls_signup_hardening.sql
-- (or full schema) so `role` may be 'admin'.
--
-- Confirm you are in the SAME Supabase project as VITE_SUPABASE_URL in GitHub.
-- =============================================================================

-- 1) See what you have
select id, email, role
from public.user_profiles
where email ilike 'deepurswani@gmail.com';

select id, email
from auth.users
where email ilike 'deepurswani@gmail.com';

-- 2) Promote by email (preferred if ids match)
update public.user_profiles
set role = 'admin'
where email = 'deepurswani@gmail.com';

-- 3) If (2) updated 0 rows: link by auth user id (profile missing or email typo)
-- Replace <AUTH_USER_ID> with id from: select id from auth.users where email = '...';
-- update public.user_profiles set role = 'admin' where id = '<AUTH_USER_ID>'::uuid;

-- 4) If user exists in auth.users but has NO row in user_profiles (rare):
-- insert into public.user_profiles (id, email, full_name, role)
-- select id, email, coalesce(raw_user_meta_data->>'full_name',''), 'admin'
-- from auth.users where id = '<AUTH_USER_ID>'::uuid
-- on conflict (id) do update set role = 'admin';

-- 5) Verify
select id, email, role from public.user_profiles where role = 'admin';
