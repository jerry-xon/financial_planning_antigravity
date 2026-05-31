-- Migration: Add summary insurance columns to financial_plans
-- These columns store summary insurance indicators for the "Your Safety Net" report.

ALTER TABLE public.financial_plans 
ADD COLUMN IF NOT EXISTS has_life_insurance BOOLEAN,
ADD COLUMN IF NOT EXISTS has_health_insurance BOOLEAN,
ADD COLUMN IF NOT EXISTS summary_life_cover NUMERIC,
ADD COLUMN IF NOT EXISTS summary_health_cover NUMERIC;
