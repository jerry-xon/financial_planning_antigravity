# send-coupon-email

Sends AWS SES invitation emails when admins issue `coupon_codes`.

## Supabase secrets

Configure in **Dashboard → Project Settings → Edge Functions → Secrets** (or CLI):

| Secret | Description |
|--------|--------------|
| `AWS_ACCESS_KEY_ID` | IAM user with `ses:SendEmail` on the verified identity / region |
| `AWS_SECRET_ACCESS_KEY` | Pair for above |
| `AWS_REGION` | e.g. `ap-south-1` (must match SES setup) |
| `SES_FROM_EMAIL` | Verified sender in SES (e.g. `noreply@wealthmap.app`) |

Optional:

| Secret | Default |
|--------|---------|
| `APP_PUBLIC_URL` | `https://app.wealthmap.app` |
| `MARKETING_SITE_URL` | `https://wealthmap.app` |
| `EMAIL_BRAND_NAME` | `Finbrella` |

## AWS SES checklist

1. Verify **domain** or **email** identity in SES (same region as `AWS_REGION`).
2. If SES account is in **sandbox**, verify **recipient** emails or exit sandbox.
3. IAM policy example: allow `ses:SendEmail` on `*` or scoped ARNs.

## Request

`POST` with user JWT (admin only).

```json
{ "codes": ["FIN-ABC123", "FIN-XYZ789"] }
```
