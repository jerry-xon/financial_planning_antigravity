-- coupon_codes: one-time VIP coupons bound to a single email address.

create table if not exists public.coupon_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  target_email text not null,
  is_used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint coupon_codes_code_unique unique (code),
  constraint coupon_codes_code_format check (length(trim(code)) >= 4)
);

-- At most one unused coupon per email at a time (admins can issue another after redemption).
create unique index if not exists coupon_codes_one_unused_per_email
  on public.coupon_codes (lower(trim(target_email)))
  where not is_used;

create index if not exists coupon_codes_target_email_idx on public.coupon_codes (lower(trim(target_email)));

alter table public.coupon_codes enable row level security;

drop policy if exists "Admins can select all coupons" on public.coupon_codes;
drop policy if exists "Admins can insert coupons" on public.coupon_codes;
drop policy if exists "Admins can update any coupon" on public.coupon_codes;
drop policy if exists "Users can view own coupon rows" on public.coupon_codes;
drop policy if exists "Users can redeem own unused coupon" on public.coupon_codes;

create policy "Admins can select all coupons"
  on public.coupon_codes for select
  using (public.is_admin());

create policy "Admins can insert coupons"
  on public.coupon_codes for insert
  with check (public.is_admin());

create policy "Admins can update any coupon"
  on public.coupon_codes for update
  using (public.is_admin())
  with check (public.is_admin());

-- Redeeming user: read row only if coupon is for their JWT email (needed for code lookup + validation)
create policy "Users can view own coupon rows"
  on public.coupon_codes for select
  using (
    lower(trim(target_email)) = lower(trim(coalesce(auth.jwt()->>'email', '')))
  );

-- Mark used: only own email, and row must have been unused
create policy "Users can redeem own unused coupon"
  on public.coupon_codes for update
  using (
    not is_used
    and lower(trim(target_email)) = lower(trim(coalesce(auth.jwt()->>'email', '')))
  )
  with check (
    lower(trim(target_email)) = lower(trim(coalesce(auth.jwt()->>'email', '')))
    and is_used = true
  );

drop trigger if exists coupon_codes_updated_at on public.coupon_codes;
create trigger coupon_codes_updated_at
  before update on public.coupon_codes
  for each row execute function public.handle_updated_at();

grant select, insert, update on public.coupon_codes to authenticated;
