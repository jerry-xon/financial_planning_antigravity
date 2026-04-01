# Razorpay Checkout Edge Function

This function provides backend support for Razorpay Checkout.js:

- `create_order` (server-side order creation using Razorpay key secret)
- `verify_signature` (server-side signature verification)

## Required Supabase Edge Secrets

Set these in your Supabase project:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are available in Edge Functions by default.

## Deploy

```bash
supabase functions deploy razorpay-checkout
```

## Set secrets

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
supabase secrets set RAZORPAY_KEY_SECRET=your_live_secret
```
