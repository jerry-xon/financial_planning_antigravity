-- Migration: Add current_year_ledger column to financial_plans
-- This column persists the Cash Flow Monthly Tracker inputs across browser refreshes natively.

ALTER TABLE public.financial_plans 
ADD COLUMN IF NOT EXISTS current_year_ledger JSONB DEFAULT '{}'::jsonb;
