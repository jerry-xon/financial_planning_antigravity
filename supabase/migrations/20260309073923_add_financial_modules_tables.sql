-- Migration to add columns for new financial modules
ALTER TABLE public.financial_plans 
ADD COLUMN IF NOT EXISTS investment_allocations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS goal_mappings jsonb DEFAULT '{}'::jsonb;
