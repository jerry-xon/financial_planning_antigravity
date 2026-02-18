# Backend Implementation with Supabase

This document provides an overview of the backend implementation using Supabase.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Protected Routes + JWT Authentication)                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Supabase Client SDK
                 │ (JWT Token in Headers)
                 │
┌────────────────┴────────────────────────────────────────┐
│                  Supabase Backend                        │
├─────────────────────────────────────────────────────────┤
│  Auth Layer (Supabase Auth)                             │
│  - Email/Password Authentication                         │
│  - Google OAuth Integration                              │
│  - JWT Token Management                                  │
│  - Session Handling                                      │
├─────────────────────────────────────────────────────────┤
│  Database Layer (PostgreSQL)                             │
│  - user_profiles                                         │
│  - financial_plans                                       │
│  - audit_logs                                            │
│  - Row Level Security (RLS)                              │
├─────────────────────────────────────────────────────────┤
│  API Layer                                               │
│  - Auto-generated REST API                               │
│  - Real-time Subscriptions                               │
│  - PostgreSQL Functions                                  │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

#### 1. user_profiles
Extends Supabase auth.users with additional profile information.

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | UUID (PK)    | References auth.users(id)      |
| email       | TEXT         | User email (unique)            |
| full_name   | TEXT         | User's full name               |
| avatar_url  | TEXT         | Profile picture URL            |
| created_at  | TIMESTAMPTZ  | Account creation timestamp     |
| updated_at  | TIMESTAMPTZ  | Last update timestamp          |

#### 2. financial_plans
Stores complete financial planning data for each user.

| Column                | Type         | Description                           |
|-----------------------|--------------|---------------------------------------|
| id                    | UUID (PK)    | Unique plan identifier                |
| user_id               | UUID (FK)    | References auth.users(id)             |
| plan_name             | TEXT         | Name of the financial plan            |
| current_step          | INTEGER      | Current module step (1-9)             |
| family_members        | JSONB        | Array of family member objects        |
| income                | JSONB        | Income breakdown                       |
| expense_categories    | JSONB        | Expense categories (household/emi/savings) |
| asset_categories      | JSONB        | Asset breakdown                        |
| liability_categories  | JSONB        | Liability breakdown                    |
| goals                 | JSONB        | Array of financial goals               |
| policies              | JSONB        | Array of insurance policies            |
| contingency_fund      | NUMERIC      | Emergency fund amount                  |
| inflation_rates       | JSONB        | Inflation rate settings                |
| is_active             | BOOLEAN      | Whether this is the active plan        |
| created_at            | TIMESTAMPTZ  | Plan creation timestamp                |
| updated_at            | TIMESTAMPTZ  | Last update timestamp                  |

#### 3. audit_logs (Optional)
Tracks changes to financial plans for audit purposes.

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | UUID (PK)    | Unique log entry identifier    |
| user_id     | UUID (FK)    | References auth.users(id)      |
| plan_id     | UUID (FK)    | References financial_plans(id) |
| action      | TEXT         | CREATE/UPDATE/DELETE           |
| module      | TEXT         | Which module was changed       |
| changes     | JSONB        | What changed                   |
| created_at  | TIMESTAMPTZ  | When the change occurred       |

### Row Level Security (RLS)

All tables have RLS enabled to ensure data isolation:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own plans" 
  ON financial_plans FOR SELECT 
  USING (auth.uid() = user_id);
```

## Authentication Flow

### 1. Email/Password Signup

```javascript
// User fills signup form
const { data, error } = await signUpWithEmail(email, password, fullName);

// Supabase sends confirmation email
// User clicks confirmation link
// Trigger: handle_new_user() creates user_profiles and financial_plans entries
```

### 2. Email/Password Login

```javascript
// User enters credentials
const { data, error } = await signInWithEmail(email, password);

// Supabase validates and returns JWT token
// Token stored in browser (localStorage)
// All subsequent requests include token in headers
```

### 3. Google OAuth

```javascript
// User clicks "Continue with Google"
const { data, error } = await signInWithGoogle();

// Redirects to Google for authorization
// Google redirects back with code
// Supabase exchanges code for JWT token
// Trigger: handle_new_user() creates profile if first time
```

## JWT Token Management

### Token Structure

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated"
}
```

### Token Flow

1. User authenticates → Receives JWT access token & refresh token
2. Access token stored in browser (httpOnly cookie)
3. Every API request includes access token in Authorization header
4. Supabase validates token on every request
5. Access token expires → Auto-refreshed using refresh token
6. User logs out → Tokens invalidated

### Token in API Requests

```javascript
// Automatic via Supabase client
const { data } = await supabase
  .from('financial_plans')
  .select('*')
  .eq('user_id', user.id);

// Headers automatically include:
// Authorization: Bearer <jwt-token>
```

## API Service Layer

### Authentication Service (`src/services/authService.js`)

```javascript
// All authentication operations
- signUpWithEmail(email, password, fullName)
- signInWithEmail(email, password)
- signInWithGoogle()
- signOut()
- getCurrentUser()
- getSession()
- resetPassword(email)
- updatePassword(newPassword)
- onAuthStateChange(callback)
```

### Financial Plan Service (`src/services/financialPlanService.js`)

```javascript
// CRUD operations for financial data
- getActivePlan()
- createFinancialPlan(planName)
- updateFinancialPlan(planId, updates)
- updateModule(planId, moduleName, moduleData)
- updateCurrentStep(planId, step)
- deleteFinancialPlan(planId)
- getUserProfile()
- updateUserProfile(updates)
- subscribeToPlanChanges(planId, callback)
```

## Data Flow

### Loading User Data

```
1. User logs in → JWT token stored
2. App.jsx loads → useAuth hook checks authentication
3. If authenticated → getActivePlan() called
4. Supabase validates JWT → Returns user's financial plan
5. State populated with plan data
6. User sees their financial data
```

### Saving User Data

```
1. User makes changes (e.g., adds family member)
2. State updated in React
3. useEffect debounces changes (1 second)
4. updateFinancialPlan(planId, updates) called
5. Supabase validates JWT
6. RLS ensures user only updates their own data
7. Database updated
8. "Saving..." indicator cleared
```

## Supabase Functions vs REST API

### Current Implementation: Auto-Generated REST API

We're using Supabase's auto-generated REST API (PostgREST):

**Advantages:**
- Zero backend code to write
- Automatic CRUD operations
- Built-in RLS integration
- Real-time subscriptions
- Type-safe with TypeScript

**Example:**
```javascript
// No API endpoint needed!
const { data } = await supabase
  .from('financial_plans')
  .update({ current_step: 2 })
  .eq('id', planId);
```

### Alternative: Supabase Edge Functions

For complex business logic, you can use Edge Functions:

**When to use:**
- Complex calculations
- Third-party API integrations
- Custom authentication logic
- Background jobs
- Email sending

**Example Function:**
```typescript
// supabase/functions/calculate-retirement/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { planId } = await req.json()
  
  // Complex retirement calculation logic
  const result = calculateRetirementNeeds(planData)
  
  return new Response(
    JSON.stringify(result),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

## Real-Time Features

### Subscribe to Plan Changes

```javascript
// Real-time updates when plan changes
const unsubscribe = subscribeToPlanChanges(planId, (newPlan) => {
  console.log('Plan updated:', newPlan);
  // Update UI automatically
});

// Cleanup
return () => unsubscribe();
```

## Security Considerations

### 1. Row Level Security (RLS)
- **Enforced at database level**
- Users can only access their own data
- Even if JWT is compromised, they can't access others' data

### 2. JWT Token Security
- **Auto-refresh**: Tokens expire and refresh automatically
- **httpOnly cookies**: Prevents XSS attacks
- **Secure transmission**: All requests over HTTPS

### 3. Environment Variables
- Never commit `.env` to Git
- Use different keys for development/production
- Rotate keys if compromised

### 4. Input Validation
- Client-side validation for UX
- Server-side validation via PostgreSQL constraints
- RLS prevents unauthorized access

## Error Handling

```javascript
// All service functions return { data, error }
const { data, error } = await getActivePlan();

if (error) {
  console.error('Error:', error.message);
  // Show user-friendly error message
  return;
}

// Use data safely
console.log('Plan loaded:', data);
```

## Testing Authentication

### Test Email/Password Flow
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to app
# 3. Click "Sign Up"
# 4. Enter email, password, name
# 5. Check email for confirmation
# 6. Click confirmation link
# 7. Log in with credentials
```

### Test Google OAuth
```bash
# 1. Ensure Google OAuth is configured
# 2. Click "Continue with Google"
# 3. Select Google account
# 4. Authorize application
# 5. Redirected back to app logged in
```

## Performance Optimization

### 1. Debounced Saves
```javascript
// Wait 1 second after user stops typing before saving
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    await updateFinancialPlan(planId, data);
  }, 1000);
  
  return () => clearTimeout(timeoutId);
}, [data]);
```

### 2. Selective Updates
```javascript
// Only update changed fields
await updateModule(planId, 'family_members', familyMembers);
// Instead of updating entire plan
```

### 3. Connection Pooling
- Supabase handles connection pooling automatically
- Max 60 concurrent connections per project
- Upgrade plan for more connections

## Deployment Considerations

### Environment Variables
```env
# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key

# Staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
```

### Database Migrations
- Schema changes tracked in `supabase/schema.sql`
- Apply migrations via Supabase dashboard
- Test in staging before production

## Monitoring

### Supabase Dashboard
- **Database**: Query performance, table statistics
- **Authentication**: User signups, login attempts
- **Logs**: Real-time logs for debugging
- **Reports**: Usage statistics, error rates

## Future Enhancements

1. **Multi-Plan Support**: Allow users to maintain multiple financial plans
2. **Sharing**: Share plans with financial advisors
3. **Export**: PDF export via Edge Function
4. **Notifications**: Email alerts for milestones
5. **Analytics**: Track user engagement
6. **Offline Mode**: Service Worker + IndexedDB sync

## Troubleshooting

### "Not authenticated" errors
- Check if token exists: `await supabase.auth.getSession()`
- Verify token not expired
- Re-login if needed

### RLS policy errors
- Check if policies are enabled
- Verify user_id matches auth.uid()
- Test policies in SQL Editor

### Data not saving
- Check browser console for errors
- Verify JWT token in request headers
- Check Supabase logs for errors

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
