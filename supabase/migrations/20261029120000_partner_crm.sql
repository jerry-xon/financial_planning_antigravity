-- Partner CRM: book-of-business on top of existing partners / partner_clients / seats

-- ── partners: CRM profile fields ─────────────────────────────────────────────
alter table public.partners
  add column if not exists partner_code text;

create unique index if not exists partners_partner_code_uidx
  on public.partners (partner_code)
  where partner_code is not null;

-- ── partner_clients: CRM person fields (report flow columns stay) ────────────
alter table public.partner_clients
  add column if not exists gender text
    check (gender is null or gender in ('Male', 'Female', 'Other')),
  add column if not exists dob date,
  add column if not exists marital_status text,
  add column if not exists occupation text,
  add column if not exists address text,
  add column if not exists pan_last4 text,
  add column if not exists source text
    check (source is null or source in ('report', 'referral', 'walk_in', 'renewal', 'other')),
  add column if not exists notes text,
  add column if not exists tags text[] not null default '{}';

comment on column public.partner_clients.pan_last4 is 'Last 4 of PAN only; full KYC via crm_documents';

-- ── policies (master) ────────────────────────────────────────────────────────
create table if not exists public.crm_policies (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  client_id uuid not null references public.partner_clients(id) on delete cascade,
  category text not null
    check (category in ('life', 'health', 'motor', 'non_motor')),
  sub_category text,
  policy_no text not null,
  insurer_name text not null,
  plan_name text,
  insured_name text,
  policy_start_date date,
  policy_end_date date,
  next_premium_due_date date,
  premium_frequency text
    check (premium_frequency is null or premium_frequency in (
      'Annual', 'Half-yearly', 'Quarterly', 'Monthly', 'Single'
    )),
  premium_amount numeric(12, 2) default 0,
  gst_amount numeric(10, 2) default 0,
  total_premium numeric(12, 2) default 0,
  status text not null default 'Active'
    check (status in (
      'Active', 'Grace Period', 'Lapsed', 'Matured', 'Surrendered', 'Claimed', 'Cancelled'
    )),
  payment_mode text,
  nominee_name text,
  nominee_relation text,
  commission_amount numeric(12, 2) default 0,
  commission_status text
    check (commission_status is null or commission_status in (
      'pending', 'received', 'not_applicable'
    )),
  policy_document_url text,
  notes text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (partner_id, insurer_name, policy_no)
);

create index if not exists crm_policies_partner_due_idx
  on public.crm_policies (partner_id, next_premium_due_date)
  where status in ('Active', 'Grace Period');

create index if not exists crm_policies_partner_status_idx
  on public.crm_policies (partner_id, status);

create index if not exists crm_policies_client_idx
  on public.crm_policies (client_id);

create index if not exists crm_policies_partner_category_idx
  on public.crm_policies (partner_id, category);

-- Ensure partner_id matches client ownership
create or replace function public.crm_policies_enforce_partner()
returns trigger
language plpgsql
as $$
declare
  expected uuid;
begin
  select partner_id into expected from public.partner_clients where id = new.client_id;
  if expected is null then
    raise exception 'client_id not found';
  end if;
  if new.partner_id is distinct from expected then
    raise exception 'partner_id must match client owner';
  end if;
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_crm_policies_enforce_partner on public.crm_policies;
create trigger trg_crm_policies_enforce_partner
  before insert or update of partner_id, client_id on public.crm_policies
  for each row execute function public.crm_policies_enforce_partner();

-- ── category detail tables (1:1) ─────────────────────────────────────────────
create table if not exists public.crm_life_policy_details (
  policy_id uuid primary key references public.crm_policies(id) on delete cascade,
  sum_assured numeric(14, 2),
  policy_term_pt integer,
  premium_paying_term_ppt integer,
  plan_short_description text
);

create table if not exists public.crm_health_policy_details (
  policy_id uuid primary key references public.crm_policies(id) on delete cascade,
  sum_insured numeric(14, 2),
  policy_term_pt integer,
  members_in_policy jsonb not null default '[]'::jsonb,
  ped_details text,
  plan_short_description text
);

create table if not exists public.crm_motor_policy_details (
  policy_id uuid primary key references public.crm_policies(id) on delete cascade,
  vehicle_no text,
  vehicle_model text,
  idv numeric(12, 2),
  od_premium numeric(10, 2),
  tp_premium numeric(10, 2),
  addons_opted text
);

create index if not exists crm_motor_vehicle_no_idx
  on public.crm_motor_policy_details (vehicle_no)
  where vehicle_no is not null;

create table if not exists public.crm_non_motor_policy_details (
  policy_id uuid primary key references public.crm_policies(id) on delete cascade,
  product_type text,
  sum_insured numeric(14, 2),
  location_or_asset_details text
);

-- ── Mutual funds: folio → holdings ───────────────────────────────────────────
create table if not exists public.crm_mf_folios (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  client_id uuid not null references public.partner_clients(id) on delete cascade,
  folio_number text,
  amc_name text,
  investor_name text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists crm_mf_folios_partner_idx on public.crm_mf_folios (partner_id);
create index if not exists crm_mf_folios_client_idx on public.crm_mf_folios (client_id);

create table if not exists public.crm_mf_holdings (
  id uuid primary key default gen_random_uuid(),
  folio_id uuid not null references public.crm_mf_folios(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  scheme_name text not null,
  amount_invested numeric(14, 2) default 0,
  current_value numeric(14, 2) default 0,
  units numeric(14, 4),
  nav numeric(12, 4),
  sip_amount numeric(12, 2) default 0,
  sip_day_of_month integer check (sip_day_of_month is null or (sip_day_of_month between 1 and 31)),
  status text not null default 'Active'
    check (status in ('Active', 'Paused', 'Redeemed')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists crm_mf_holdings_partner_idx on public.crm_mf_holdings (partner_id);
create index if not exists crm_mf_holdings_folio_idx on public.crm_mf_holdings (folio_id);

-- ── Activities & documents ───────────────────────────────────────────────────
create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  client_id uuid not null references public.partner_clients(id) on delete cascade,
  policy_id uuid references public.crm_policies(id) on delete set null,
  activity_type text not null
    check (activity_type in (
      'call', 'whatsapp', 'email', 'meeting', 'note', 'follow_up', 'renewal_touch'
    )),
  subject text,
  body text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists crm_activities_partner_due_idx
  on public.crm_activities (partner_id, due_at)
  where completed_at is null;

create index if not exists crm_activities_client_idx
  on public.crm_activities (client_id, created_at desc);

create table if not exists public.crm_documents (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  client_id uuid not null references public.partner_clients(id) on delete cascade,
  policy_id uuid references public.crm_policies(id) on delete set null,
  doc_type text not null
    check (doc_type in (
      'pan', 'aadhaar', 'policy_pdf', 'kyc', 'proposal', 'other'
    )),
  file_name text,
  storage_path text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists crm_documents_client_idx on public.crm_documents (client_id);

-- ── Renewals helper view ─────────────────────────────────────────────────────
create or replace view public.crm_renewals_due as
select
  p.id as policy_id,
  p.partner_id,
  p.client_id,
  c.full_name as client_name,
  c.phone as client_phone,
  c.email as client_email,
  p.category,
  p.sub_category,
  p.policy_no,
  p.insurer_name,
  p.plan_name,
  p.next_premium_due_date,
  p.total_premium,
  p.status,
  (p.next_premium_due_date - current_date) as days_until_due
from public.crm_policies p
join public.partner_clients c on c.id = p.client_id
where p.status in ('Active', 'Grace Period')
  and p.next_premium_due_date is not null;

grant select on public.crm_renewals_due to authenticated;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.crm_policies enable row level security;
alter table public.crm_life_policy_details enable row level security;
alter table public.crm_health_policy_details enable row level security;
alter table public.crm_motor_policy_details enable row level security;
alter table public.crm_non_motor_policy_details enable row level security;
alter table public.crm_mf_folios enable row level security;
alter table public.crm_mf_holdings enable row level security;
alter table public.crm_activities enable row level security;
alter table public.crm_documents enable row level security;

drop policy if exists "Partners manage own policies" on public.crm_policies;
create policy "Partners manage own policies"
  on public.crm_policies for all
  using (auth.uid() = partner_id)
  with check (auth.uid() = partner_id);

drop policy if exists "Partners manage own life details" on public.crm_life_policy_details;
create policy "Partners manage own life details"
  on public.crm_life_policy_details for all
  using (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ));

drop policy if exists "Partners manage own health details" on public.crm_health_policy_details;
create policy "Partners manage own health details"
  on public.crm_health_policy_details for all
  using (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ));

drop policy if exists "Partners manage own motor details" on public.crm_motor_policy_details;
create policy "Partners manage own motor details"
  on public.crm_motor_policy_details for all
  using (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ));

drop policy if exists "Partners manage own non_motor details" on public.crm_non_motor_policy_details;
create policy "Partners manage own non_motor details"
  on public.crm_non_motor_policy_details for all
  using (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.crm_policies p where p.id = policy_id and p.partner_id = auth.uid()
  ));

drop policy if exists "Partners manage own mf folios" on public.crm_mf_folios;
create policy "Partners manage own mf folios"
  on public.crm_mf_folios for all
  using (auth.uid() = partner_id)
  with check (auth.uid() = partner_id);

drop policy if exists "Partners manage own mf holdings" on public.crm_mf_holdings;
create policy "Partners manage own mf holdings"
  on public.crm_mf_holdings for all
  using (auth.uid() = partner_id)
  with check (auth.uid() = partner_id);

drop policy if exists "Partners manage own activities" on public.crm_activities;
create policy "Partners manage own activities"
  on public.crm_activities for all
  using (auth.uid() = partner_id)
  with check (auth.uid() = partner_id);

drop policy if exists "Partners manage own documents" on public.crm_documents;
create policy "Partners manage own documents"
  on public.crm_documents for all
  using (auth.uid() = partner_id)
  with check (auth.uid() = partner_id);

grant select, insert, update, delete on public.crm_policies to authenticated;
grant select, insert, update, delete on public.crm_life_policy_details to authenticated;
grant select, insert, update, delete on public.crm_health_policy_details to authenticated;
grant select, insert, update, delete on public.crm_motor_policy_details to authenticated;
grant select, insert, update, delete on public.crm_non_motor_policy_details to authenticated;
grant select, insert, update, delete on public.crm_mf_folios to authenticated;
grant select, insert, update, delete on public.crm_mf_holdings to authenticated;
grant select, insert, update, delete on public.crm_activities to authenticated;
grant select, insert, update, delete on public.crm_documents to authenticated;
