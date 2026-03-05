# Supabase Setup Guide

This guide will help you set up Supabase for the Financial Planning Application.

## Running without Supabase (mock mode)

During a database migration or when you do not have Supabase configured, you can still run the app for development. Set `VITE_USE_SUPABASE=false` in `.env`, or leave `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` unset. The app will use a mock client: no persistence and no real auth (you will see the login screen). When your new database is ready, set the real env vars and restart the dev server.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Google Cloud Console account (for Google OAuth)

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - **Name**: Financial Planning App
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Set Up the Database Schema

1. In your Supabase dashboard, navigate to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL Editor
5. Click "Run" to execute the script
6. Verify success: You should see tables created in the **Table Editor**

Expected tables:
- `user_profiles`
- `financial_plans`
- `audit_logs`

## Step 3: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm Signup", "Reset Password", etc.

### Enable Google OAuth

1. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable "Google+ API"
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add Authorized redirect URI:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     (Replace `your-project-ref` with your actual Supabase project reference)
   - Copy the **Client ID** and **Client Secret**

2. **Configure in Supabase:**
   - Go to **Authentication** → **Providers**
   - Find **Google** and enable it
   - Enter your **Client ID** and **Client Secret**
   - Save the configuration

## Step 4: Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 5: Configure Environment Variables

1. In your project root, open `.env` file
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

**Important:** Never commit `.env` to version control! It's already in `.gitignore`.

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. You should see the login/signup screen

4. Try creating an account:
   - Click "Sign Up"
   - Enter your details
   - Check your email for verification link

5. Try Google Sign-In:
   - Click "Continue with Google"
   - Authorize the application
   - You should be redirected back to the app

## Step 7: Verify Database Setup

1. After signing up/logging in, check the Supabase dashboard
2. Go to **Table Editor** → `user_profiles`
   - You should see your user profile entry
3. Go to **Table Editor** → `financial_plans`
   - You should see an initial financial plan created for you

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Verify Vite environment variables start with `VITE_`
- Restart development server after changing `.env`

### Google OAuth Not Working
- Verify redirect URI matches exactly in Google Cloud Console
- Check if Google+ API is enabled
- Ensure Client ID and Secret are correct in Supabase

### Database Errors
- Verify all SQL scripts ran successfully
- Check Row Level Security (RLS) policies are enabled
- Ensure triggers were created

### Authentication Issues
- Check browser console for errors
- Verify email confirmation is not required (or check your email)
- Clear browser cache and cookies

## Security Checklist

- [ ] RLS (Row Level Security) enabled on all tables
- [ ] `.env` file is in `.gitignore`
- [ ] Email templates configured
- [ ] Google OAuth redirect URI is correct
- [ ] Strong database password set
- [ ] API keys are kept secret

## Advanced Configuration

### Email Customization

Go to **Authentication** → **Email Templates** to customize:
- Confirmation email
- Password reset email
- Magic link email

### Custom Domain (Optional)

1. Go to **Settings** → **Custom Domains**
2. Follow instructions to set up your custom domain
3. Update environment variables and Google OAuth redirect URI

### Database Backups

1. Go to **Database** → **Backups**
2. Enable automatic backups
3. Schedule regular backups

## API Documentation

### Authentication API

See `src/services/authService.js` for:
- `signUpWithEmail(email, password, fullName)`
- `signInWithEmail(email, password)`
- `signInWithGoogle()`
- `signOut()`
- `resetPassword(email)`

### Financial Plan API

See `src/services/financialPlanService.js` for:
- `getActivePlan()`
- `createFinancialPlan(planName)`
- `updateFinancialPlan(planId, updates)`
- `updateModule(planId, moduleName, moduleData)`

## Support

For issues with:
- **Supabase**: https://supabase.com/docs
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2

## Next Steps

After setup is complete:
1. Test the entire user flow
2. Verify data is being saved to Supabase
3. Test on multiple devices
4. Deploy to production (see deployment guide)
