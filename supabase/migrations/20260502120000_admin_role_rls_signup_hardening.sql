-- Admin role support, RLS for admin-wide reads/updates, and signup hardening.
-- Admin cannot be chosen via signup metadata; promote via SQL in Dashboard only.

-- 1. Allow role = 'admin' on user_profiles
alter table public.user_profiles drop constraint if exists user_profiles_role_check;

alter table public.user_profiles
  add constraint user_profiles_role_check
  check (role in ('agent', 'user', 'admin'));

-- 2. Never assign admin from auth signup metadata (only agent|user)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  signup_role text;
begin
  signup_role := coalesce(new.raw_user_meta_data->>'role', 'user');
  if signup_role = 'agent' then
    signup_role := 'agent';
  else
    signup_role := 'user';
  end if;

  insert into public.user_profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    signup_role
  );

  insert into public.financial_plans (user_id, plan_name, family_members, income, expense_categories, asset_categories, liability_categories)
  values (
    new.id,
    'My Financial Plan',
    jsonb_build_array(jsonb_build_object(
      'name', '',
      'dob', '',
      'occupation', '',
      'retirementAge', 60,
      'relation', 'Self',
      'natureOfBusiness', '',
      'organizationName', '',
      'educationalQualification', ''
    )),
    jsonb_build_object(
      'self', '',
      'spouse', '',
      'bonus', '',
      'passive', '',
      'other', ''
    ),
    jsonb_build_object(
      'household', jsonb_build_object('grocery', '', 'rent', '', 'education', '', 'lifestyle', '', 'medical', '', 'travel', ''),
      'emi', jsonb_build_object('personalLoan', '', 'homeLoan', '', 'educationLoan', '', 'otherEmi', '', 'healthInsurance', '', 'carInsurance', '', 'bikeInsurance', '', 'otherInsurance', ''),
      'savings', jsonb_build_object('rd', '', 'fd', '', 'lifeInsurance', '', 'ppf', '', 'savingSchemes', '', 'mfSip', '', 'otherSaving', '')
    ),
    jsonb_build_object(
      'realEstate', jsonb_build_object('residential', '', 'secondProperty', '', 'landPlot', ''),
      'vehicles', jsonb_build_object('idv', ''),
      'valuables', jsonb_build_object('gold', '', 'art', ''),
      'cash', jsonb_build_object('savings', ''),
      'investments', jsonb_build_object('equity', '', 'mutualFunds', '', 'fixedDeposit', '', 'recurringDeposit', ''),
      'insurance', jsonb_build_object('savingPlans', '', 'ulip', ''),
      'retirement', jsonb_build_object('epf', '', 'ppf', '', 'nps', ''),
      'others', jsonb_build_object('other', ''),
      'custom', '[]'::jsonb
    ),
    jsonb_build_object(
      'loans', jsonb_build_object('home', '', 'personal', '', 'car', '', 'education', '', 'otherEmis', '', 'creditCard', ''),
      'custom', '[]'::jsonb
    )
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 3. RLS: admins may read/update broadly for the admin portal (server still enforces JWT)
drop policy if exists "Admins can select all profiles" on public.user_profiles;
create policy "Admins can select all profiles"
  on public.user_profiles
  for select
  using (
    (select up.role from public.user_profiles up where up.id = auth.uid()) = 'admin'
  );

drop policy if exists "Admins can update any profile" on public.user_profiles;
create policy "Admins can update any profile"
  on public.user_profiles
  for update
  using (
    (select up.role from public.user_profiles up where up.id = auth.uid()) = 'admin'
  )
  with check (
    (select up.role from public.user_profiles up where up.id = auth.uid()) = 'admin'
  );

drop policy if exists "Admins can select all financial plans" on public.financial_plans;
create policy "Admins can select all financial plans"
  on public.financial_plans
  for select
  using (
    (select up.role from public.user_profiles up where up.id = auth.uid()) = 'admin'
  );

drop policy if exists "Admins can select all checkout transactions" on public.checkout_transactions;
create policy "Admins can select all checkout transactions"
  on public.checkout_transactions
  for select
  using (
    (select up.role from public.user_profiles up where up.id = auth.uid()) = 'admin'
  );

drop policy if exists "Admins can select all audit logs" on public.audit_logs;
create policy "Admins can select all audit logs"
  on public.audit_logs
  for select
  using (
    (select up.role from public.user_profiles up where up.id = auth.uid()) = 'admin'
  );
