-- Migration: Add plan_start_month column to financial_plans
-- This stores the starting month for projections (0-11, JS Date.getMonth()).

ALTER TABLE public.financial_plans
ADD COLUMN IF NOT EXISTS plan_start_month integer DEFAULT 0;

