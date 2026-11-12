-- Partner B2B portal: partners, seat ledger, client mapping

-- 1. Partners (one row per partner Auth user)
create table if not exists public.partners (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  company_name text,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'disabled')),
  must_change_password boolean not null default true,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists partners_email_idx on public.partners (email);
create index if not exists partners_status_idx on public.partners (status);

-- 2. Seat ledger (balance = sum(delta))
create table if not exists public.partner_seat_ledger (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  delta integer not null,
  reason text not null
    check (reason in (
      'signup_bonus',
      'client_create',
      'purchase_single',
      'purchase_pack',
      'admin_adjust'
    )),
  razorpay_payment_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists partner_seat_ledger_partner_id_idx
  on public.partner_seat_ledger (partner_id);

-- 3. Partner → client mapping
create table if not exists public.partner_clients (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  client_user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.financial_plans(id) on delete set null,
  email text not null,
  full_name text,
  phone text,
  status text not null default 'active'
    check (status in ('active', 'disabled', 'deleted')),
  report_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (partner_id, email)
);

create index if not exists partner_clients_partner_id_idx
  on public.partner_clients (partner_id);
create index if not exists partner_clients_client_user_id_idx
  on public.partner_clients (client_user_id);

-- 4. Seat balance view
create or replace view public.partner_seat_balance as
select
  p.id as partner_id,
  coalesce(sum(l.delta), 0)::integer as seats_remaining,
  coalesce(sum(case when l.delta > 0 then l.delta else 0 end), 0)::integer as seats_earned,
  coalesce(sum(case when l.delta < 0 then abs(l.delta) else 0 end), 0)::integer as seats_used
from public.partners p
left join public.partner_seat_ledger l on l.partner_id = p.id
group by p.id;

-- 5. must_change_password on user_profiles (clients)
alter table public.user_profiles
  add column if not exists must_change_password boolean not null default false;

-- 6. RLS
alter table public.partners enable row level security;
alter table public.partner_seat_ledger enable row level security;
alter table public.partner_clients enable row level security;

drop policy if exists "Partners select own row" on public.partners;
create policy "Partners select own row"
  on public.partners for select
  using (auth.uid() = id);

drop policy if exists "Partners update own row" on public.partners;
create policy "Partners update own row"
  on public.partners for update
  using (auth.uid() = id);

drop policy if exists "Admins select all partners" on public.partners;
create policy "Admins select all partners"
  on public.partners for select
  using (public.is_admin());

drop policy if exists "Partners select own ledger" on public.partner_seat_ledger;
create policy "Partners select own ledger"
  on public.partner_seat_ledger for select
  using (auth.uid() = partner_id);

drop policy if exists "Partners select own clients" on public.partner_clients;
create policy "Partners select own clients"
  on public.partner_clients for select
  using (auth.uid() = partner_id);

drop policy if exists "Clients select own partner_clients row" on public.partner_clients;
create policy "Clients select own partner_clients row"
  on public.partner_clients for select
  using (auth.uid() = client_user_id);

-- 7. Harden public signup: never allow agent via metadata (partner-api creates partners)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  signup_role text;
  is_partner boolean;
begin
  is_partner := coalesce((new.raw_user_meta_data->>'is_partner')::boolean, false);
  signup_role := coalesce(new.raw_user_meta_data->>'role', 'user');

  if is_partner then
    signup_role := 'agent';
  else
    -- Public signup can only be user
    signup_role := 'user';
  end if;

  insert into public.user_profiles (id, email, full_name, role, must_change_password)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    signup_role,
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
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

grant select on public.partner_seat_balance to authenticated;
grant select on public.partners to authenticated;
grant select on public.partner_seat_ledger to authenticated;
grant select on public.partner_clients to authenticated;
