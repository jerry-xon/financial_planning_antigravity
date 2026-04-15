-- Migration: Add subscription_active column to user_profiles
-- Used by RoleBasedRouting / SubscriptionGate to gate access.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT false;

