-- Migration: Add extra JSONB columns to financial_plans for the Fulfillment Module
-- These columns will natively persist loan proposals and allocation plans without risking browser localStorage wipes.

ALTER TABLE public.financial_plans 
ADD COLUMN IF NOT EXISTS loan_proposals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS allocation_plans JSONB DEFAULT '{}'::jsonb;
