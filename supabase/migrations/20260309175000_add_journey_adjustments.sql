-- Migration to add journey_adjustments column for Future Financial Adjustments
ALTER TABLE public.financial_plans 
ADD COLUMN IF NOT EXISTS journey_adjustments jsonb DEFAULT '[]'::jsonb;
