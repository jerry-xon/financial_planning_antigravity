-- Migration: Add checkout_transactions table for paid and coupon-based checkouts

CREATE TABLE IF NOT EXISTS public.checkout_transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES public.financial_plans(id) ON DELETE SET NULL,
  amount_inr numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'SUCCESS',
  payment_provider text NOT NULL,
  payment_method text NOT NULL,
  coupon_code text,
  provider_payment_id text,
  provider_order_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS checkout_transactions_user_id_idx
  ON public.checkout_transactions(user_id);

CREATE INDEX IF NOT EXISTS checkout_transactions_plan_id_idx
  ON public.checkout_transactions(plan_id);

ALTER TABLE public.checkout_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkout transactions" ON public.checkout_transactions;
DROP POLICY IF EXISTS "Users can insert own checkout transactions" ON public.checkout_transactions;

CREATE POLICY "Users can view own checkout transactions"
  ON public.checkout_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkout transactions"
  ON public.checkout_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
