-- TEMPORARY (demo): extra permissive RLS policies scoped ONLY to the signed-in user.
-- Anonymous clients still cannot satisfy auth.uid(); requires a real JWT session.
--
-- REMOVE AFTER DEMO:
--   DROP POLICY "TEMP_DEMO own profile update" ON public.user_profiles;
--   DROP POLICY "TEMP_DEMO own financial plan select" ON public.financial_plans;
--   DROP POLICY "TEMP_DEMO own financial plan insert" ON public.financial_plans;
--   DROP POLICY "TEMP_DEMO own financial plan update" ON public.financial_plans;
--   DROP POLICY "TEMP_DEMO own financial plan delete" ON public.financial_plans;
--   DROP POLICY "TEMP_DEMO own audit select" ON public.audit_logs;
--   DROP POLICY "TEMP_DEMO own audit insert" ON public.audit_logs;
--   DROP POLICY "TEMP_DEMO own checkout select" ON public.checkout_transactions;
--   DROP POLICY "TEMP_DEMO own checkout insert" ON public.checkout_transactions;

grant usage on schema public to authenticated;
grant select, insert, update on public.user_profiles to authenticated;
grant select, insert, update, delete on public.financial_plans to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant select, insert on public.checkout_transactions to authenticated;
grant select, insert, update on public.coupon_codes to authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "TEMP_DEMO own profile update" on public.user_profiles;
create policy "TEMP_DEMO own profile update"
  on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "TEMP_DEMO own financial plan select" on public.financial_plans;
create policy "TEMP_DEMO own financial plan select"
  on public.financial_plans
  for select
  using (auth.uid() = user_id);

drop policy if exists "TEMP_DEMO own financial plan insert" on public.financial_plans;
create policy "TEMP_DEMO own financial plan insert"
  on public.financial_plans
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "TEMP_DEMO own financial plan update" on public.financial_plans;
create policy "TEMP_DEMO own financial plan update"
  on public.financial_plans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "TEMP_DEMO own financial plan delete" on public.financial_plans;
create policy "TEMP_DEMO own financial plan delete"
  on public.financial_plans
  for delete
  using (auth.uid() = user_id);

drop policy if exists "TEMP_DEMO own audit select" on public.audit_logs;
create policy "TEMP_DEMO own audit select"
  on public.audit_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "TEMP_DEMO own audit insert" on public.audit_logs;
create policy "TEMP_DEMO own audit insert"
  on public.audit_logs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "TEMP_DEMO own checkout select" on public.checkout_transactions;
create policy "TEMP_DEMO own checkout select"
  on public.checkout_transactions
  for select
  using (auth.uid() = user_id);

drop policy if exists "TEMP_DEMO own checkout insert" on public.checkout_transactions;
create policy "TEMP_DEMO own checkout insert"
  on public.checkout_transactions
  for insert
  with check (auth.uid() = user_id);
