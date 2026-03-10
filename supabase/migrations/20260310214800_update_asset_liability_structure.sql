-- Migration: Update Asset and Liability Structure
-- Date: 2026-03-10

-- Update default values for the table
ALTER TABLE public.financial_plans 
ALTER COLUMN asset_categories SET DEFAULT '{"realEstate": {"residential": "", "secondProperty": "", "landPlot": ""}, "vehicles": {"idv": ""}, "valuables": {"gold": "", "art": ""}, "cash": {"savings": ""}, "investments": {"equity": "", "mutualFunds": "", "fixedDeposit": "", "recurringDeposit": ""}, "insurance": {"savingPlans": "", "ulip": ""}, "retirement": {"epf": "", "ppf": "", "nps": ""}, "others": {"other": ""}, "custom": []}'::jsonb,
ALTER COLUMN liability_categories SET DEFAULT '{"loans": {"home": "", "personal": "", "car": "", "education": "", "otherEmis": "", "creditCard": ""}, "custom": []}'::jsonb;

-- Note: We are not migrating existing data to the new structure automatically as it might cause data loss 
-- for users who have already entered data. The frontend will be updated to handle both or 
-- we will update existing records to the new default if they are currently at the old default.

UPDATE public.financial_plans
SET asset_categories = '{"realEstate": {"residential": "", "secondProperty": "", "landPlot": ""}, "vehicles": {"idv": ""}, "valuables": {"gold": "", "art": ""}, "cash": {"savings": ""}, "investments": {"equity": "", "mutualFunds": "", "fixedDeposit": "", "recurringDeposit": ""}, "insurance": {"savingPlans": "", "ulip": ""}, "retirement": {"epf": "", "ppf": "", "nps": ""}, "others": {"other": ""}, "custom": []}'::jsonb
WHERE asset_categories = '{"equity":{"stocks":"","mfEquity":""},"debt":{"ppf":"","fd":""},"realEstate":{"residence":"","investmentProp":""},"others":{"gold":"","others":""}}'::jsonb;

UPDATE public.financial_plans
SET liability_categories = '{"loans": {"home": "", "personal": "", "car": "", "education": "", "otherEmis": "", "creditCard": ""}, "custom": []}'::jsonb
WHERE liability_categories = '{"loans":{"home":"","car":"","other":""}}'::jsonb;
