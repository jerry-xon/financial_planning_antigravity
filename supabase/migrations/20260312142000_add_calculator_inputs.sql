-- Migration: Add calculator_inputs column to financial_plans
-- Date: 2026-03-12

ALTER TABLE public.financial_plans 
ADD COLUMN IF NOT EXISTS calculator_inputs jsonb DEFAULT '{
    "personal_loan": {"amount": 0, "rate": 10.5, "tenure": 5},
    "home_loan": {"amount": 0, "rate": 8.5, "tenure": 20},
    "car_loan": {"amount": 0, "rate": 9.5, "tenure": 5},
    "lumpsum": {"amount": 0, "rate": 12, "tenure": 10},
    "swp": {"amount": 0, "withdrawal": 0, "rate": 10, "tenure": 15}
}'::jsonb;
