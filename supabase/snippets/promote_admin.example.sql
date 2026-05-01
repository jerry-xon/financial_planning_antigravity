-- Run once in Supabase SQL Editor (Dashboard) after migrations applied.
-- Replace email(s) with real operator addresses. Never expose this in client code.

update public.user_profiles
set role = 'admin'
where email in ('deepurswani@gmail.com');

-- verify
select id, email, role from public.user_profiles where role = 'admin';
