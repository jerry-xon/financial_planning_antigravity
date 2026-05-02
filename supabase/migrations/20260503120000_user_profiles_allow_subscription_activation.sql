-- Allow users to set subscription_active from false -> true (coupon, checkout).
-- Previous WITH CHECK required subscription_active to stay unchanged, blocking activation.

drop policy if exists "Users can update own profile" on public.user_profiles;

create policy "Users can update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    AND email = (select up.email from public.user_profiles up where up.id = auth.uid())
    AND role = (select up.role from public.user_profiles up where up.id = auth.uid())
    AND is_approved = (select up.is_approved from public.user_profiles up where up.id = auth.uid())
    AND (
      subscription_active = (select up.subscription_active from public.user_profiles up where up.id = auth.uid())
      OR subscription_active = true
    )
  );
