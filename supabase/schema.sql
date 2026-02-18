-- ============================================
-- FINANCIAL PLANNING APP - DATABASE SCHEMA
-- ============================================
-- Creates complete PostgreSQL schema for Supabase
-- Deploy this in Supabase SQL Editor

-- ============================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- 2. CREATE user_profiles TABLE
-- ============================================
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text not null check (role in ('agent', 'user')) default 'user',
  company_name text,
  phone text,
  is_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for user_profiles
alter table public.user_profiles enable row level security;

drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;

create policy "Users can view own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id);

-- ============================================
-- 3. CREATE financial_plans TABLE
-- ============================================
create table if not exists public.financial_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id uuid references auth.users(id) on delete set null,
  plan_name text not null default 'My Financial Plan',
  client_name text,
  client_email text,
  current_step integer default 1,
  family_members jsonb default '[]'::jsonb,
  income jsonb default '{"family":"","bonus":"","passive":"","other":""}'::jsonb,
  expense_categories jsonb default '{"household":{"grocery":"","rent":"","education":"","lifestyle":"","medical":"","travel":""},"emi":{"personalLoan":"","homeLoan":"","educationLoan":"","otherEmi":"","healthInsurance":"","carInsurance":"","bikeInsurance":"","otherInsurance":""},"savings":{"rd":"","fd":"","lifeInsurance":"","ppf":"","savingSchemes":"","mfSip":"","otherSaving":""}}'::jsonb,
  asset_categories jsonb default '{"equity":{"stocks":"","mfEquity":""},"debt":{"ppf":"","fd":""},"realEstate":{"residence":"","investmentProp":""},"others":{"gold":"","others":""}}'::jsonb,
  liability_categories jsonb default '{"loans":{"home":"","car":"","other":""}}'::jsonb,
  goals jsonb default '[]'::jsonb,
  policies jsonb default '[]'::jsonb,
  contingency_fund numeric default 0,
  inflation_rates jsonb default '{"incomeIncrement": 10, "householdInflation": 6, "educationInflation": 8}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for faster queries
create index if not exists financial_plans_user_id_idx on public.financial_plans(user_id);
create index if not exists financial_plans_agent_id_idx on public.financial_plans(agent_id);
create index if not exists financial_plans_is_active_idx on public.financial_plans(is_active);

-- Set up RLS for financial_plans
alter table public.financial_plans enable row level security;

drop policy if exists "Users can view own plans" on public.financial_plans;
drop policy if exists "Users can insert own plans" on public.financial_plans;
drop policy if exists "Users can update own plans" on public.financial_plans;
drop policy if exists "Users can delete own plans" on public.financial_plans;
drop policy if exists "Agents can view their client plans" on public.financial_plans;

create policy "Users can view own plans"
  on public.financial_plans
  for select
  using (auth.uid() = user_id);

create policy "Agents can view their client plans"
  on public.financial_plans
  for select
  using (auth.uid() = agent_id);

create policy "Users can insert own plans"
  on public.financial_plans
  for insert
  with check (auth.uid() = user_id AND agent_id IS NULL);

create policy "Agents can insert plans for clients"
  on public.financial_plans
  for insert
  with check (auth.uid() = agent_id);

create policy "Users can update own plans"
  on public.financial_plans
  for update
  using (auth.uid() = user_id);

create policy "Agents can update client plans"
  on public.financial_plans
  for update
  using (auth.uid() = agent_id);

create policy "Users can delete own plans"
  on public.financial_plans
  for delete
  using (auth.uid() = user_id);

create policy "Agents can delete client plans"
  on public.financial_plans
  for delete
  using (auth.uid() = agent_id);

-- ============================================
-- 4. CREATE audit_logs TABLE
-- ============================================
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id uuid references public.financial_plans(id) on delete cascade not null,
  action text not null check (action in ('CREATE', 'UPDATE', 'DELETE')),
  module text,
  changes jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for faster queries
create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);
create index if not exists audit_logs_plan_id_idx on public.audit_logs(plan_id);

-- Set up RLS for audit_logs
alter table public.audit_logs enable row level security;

drop policy if exists "Users can view own audit logs" on public.audit_logs;
drop policy if exists "Users can insert own audit logs" on public.audit_logs;

create policy "Users can view own audit logs"
  on public.audit_logs
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own audit logs"
  on public.audit_logs
  for insert
  with check (auth.uid() = user_id);

-- ============================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profiles_updated_at on public.user_profiles;
create trigger user_profiles_updated_at before update on public.user_profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists financial_plans_updated_at on public.financial_plans;
create trigger financial_plans_updated_at before update on public.financial_plans
  for each row execute function public.handle_updated_at();

-- ============================================
-- 6. CREATE FUNCTION FOR NEW USER SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
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
      'relation', 'Self'
    )),
    jsonb_build_object(
      'family', '',
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
      'equity', jsonb_build_object('stocks', '', 'mfEquity', ''),
      'debt', jsonb_build_object('ppf', '', 'fd', ''),
      'realEstate', jsonb_build_object('residence', '', 'investmentProp', ''),
      'others', jsonb_build_object('gold', '', 'others', '')
    ),
    jsonb_build_object(
      'loans', jsonb_build_object('home', '', 'car', '', 'other', '')
    )
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 7. GRANTS FOR AUTHENTICATED USERS
-- ============================================
grant usage on schema public to authenticated;
grant all privileges on all tables in schema public to authenticated;
grant all privileges on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
