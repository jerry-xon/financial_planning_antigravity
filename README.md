# Financial Planning Application

A comprehensive financial planning tool built with React and Supabase that helps users manage their finances through multiple planning modules.

## Features

- **Authentication**: Email/password and Google OAuth login
- **User Profiles**: Manage personal and family member information
- **Cash Flow Analysis**: Track income and expenses
- **Asset & Liability Management**: Monitor your financial position
- **Goal Planning**: Set and track financial goals
- **Insurance Planning**: Manage insurance policies
- **Contingency Planning**: Calculate emergency fund requirements
- **Protection Gap Analysis**: Identify insurance coverage gaps
- **Journey Projection**: Visualize your financial future
- **Cloud Storage**: All data securely stored in Supabase
- **Auto-Save**: Changes automatically saved with debouncing
- **PWA Support**: Install as a Progressive Web App

## Tech Stack

- **Frontend**: React 19.2.0 + Vite 7.3.1
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Authentication**: JWT-based with Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Icons**: Lucide React
- **Testing**: Vitest
- **PWA**: vite-plugin-pwa

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up here](https://supabase.com))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd financial_planning_antigravity
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Follow the detailed guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Create a Supabase project
   - Run the database schema from `supabase/schema.sql`
   - Configure authentication providers

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Running without Supabase (e.g. during DB migration):** You can run the app without a live database by setting `VITE_USE_SUPABASE=false` or by leaving `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` unset. The app will use a mock client (no persistence; you will see the login screen).

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

> This repository is **frontend only**. The standalone backend service lives in a separate repository and is consumed via `VITE_API_URL` (see [Deployment](#deployment)).

## Project Structure

```
financial_planning_antigravity/
├── apps/
│   └── web/                 # React + Vite frontend (deploys to Vercel)
│       ├── public/          # Static assets
│       ├── src/             # Application source
│       └── vite.config.js
├── supabase/
│   ├── schema.sql           # Database schema
│   ├── migrations/          # SQL migrations
│   └── functions/           # Supabase Edge Functions (razorpay-checkout)
├── vercel.json              # Vercel build + headers for the web app
├── .env.example             # Environment variables template
├── SUPABASE_SETUP.md        # Detailed Supabase setup guide
└── BACKEND_DOCUMENTATION.md # Backend architecture docs (Supabase)
```

## Available Scripts

```bash
npm run dev          # Web (Vite) — http://localhost:5173
npm run build        # Build the web app for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
```

## Modules Overview

### 1. Profile Module
- Manage personal information and family members
- Track age, employment status, and relationships

### 2. Cash Flow Module
- Income tracking (salary, business, rental, etc.)
- Expense categorization (household, EMIs, savings)
- Monthly cash flow analysis

### 3. Asset & Liability Module
- Track assets (cash, real estate, investments, etc.)
- Manage liabilities (loans, mortgages, credit cards)
- Calculate net worth

### 4. Goal Module
- Define financial goals (education, marriage, retirement, etc.)
- Set target amounts and timelines
- Track progress

### 5. Insurance Module
- Manage insurance policies (life, health, property)
- Calculate existing coverage
- Identify insurance needs

### 6. Contingency Module
- Calculate emergency fund requirements
- Factor in household income and expenses
- Suggest 6-12 months of expenses

### 7. Protection Gap Module
- Analyze life insurance coverage gaps
- Calculate financial needs for dependents
- Recommend additional coverage

### 8. Journey Module
- Visual projection of financial future
- Year-by-year cash flow projections
- Goal achievement timeline

### 9. Report Module
- Comprehensive financial summary
- Export capabilities (future feature)

## Authentication

The app uses Supabase Auth with:
- **Email/Password**: Traditional signup and login
- **Google OAuth**: One-click sign in with Google
- **JWT Tokens**: Automatic token management and refresh
- **Protected Routes**: All routes require authentication
- **Session Persistence**: Stay logged in across browser sessions

## Database Schema

### Tables

- **user_profiles**: Extended user information
- **financial_plans**: All financial planning data (JSONB storage)
- **audit_logs**: Change tracking and audit trail

### Security

- **Row Level Security (RLS)**: Users can only access their own data
- **PostgreSQL Policies**: Enforced at database level
- **JWT Validation**: Every request validated by Supabase

See [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) for detailed architecture.

## API Services

### Authentication (`src/services/authService.js`)
- Sign up, sign in, sign out
- Google OAuth integration
- Password reset
- Session management

### Financial Plans (`src/services/financialPlanService.js`)
- Get active plan
- Create/update/delete plans
- Update individual modules
- Real-time subscriptions

## Testing

Run the test suite:
```bash
npm run test
```

Current test coverage:
- ProfileLogic: 4 tests
- CashFlowLogic: 3 tests
- AssetLogic: 3 tests
- GoalLogic: 4 tests
- InsuranceLogic: 3 tests
- ContingencyLogic: 3 tests
- ProtectionGapLogic: 4 tests
- ProjectionLogic: 3 tests

**Total: 27 tests passing**

## Development

### Adding a New Module

1. Create module folder in `src/components/`
2. Create input, output, and logic files
3. Add tests for logic functions
4. Import in `App.jsx`
5. Update database schema if needed

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_USE_SUPABASE` | `true` to use Supabase, `false` for mock mode | No (default `false`) |
| `VITE_SUPABASE_URL` | Your Supabase project URL | If `VITE_USE_SUPABASE=true` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | If `VITE_USE_SUPABASE=true` |
| `VITE_SITE_URL` | Public URL of the web app (Vercel URL or `http://localhost:5173`) | Recommended |
| `VITE_API_URL` | URL of the standalone backend API (e.g. `https://finplan-api.onrender.com`) | Only if the app calls the backend repo |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (test or live) | Only for payments |
| `VITE_WEB3FORMS_ACCESS_KEY` | Web3Forms key for the support form | Only for support form |

**Important**: Never commit `.env` to version control!

## Deployment

This repo is **frontend only**. The standalone backend service lives in a separate repository and is deployed independently (e.g. Render).

| Piece                | Hosting                   | Config file    |
|----------------------|---------------------------|----------------|
| React/Vite frontend  | **Vercel** (Hobby plan)   | `vercel.json`  |
| Backend API          | separate repo (e.g. Render) | n/a in this repo |
| Database / Auth      | Supabase (free tier)      | `supabase/`    |

### Local production build

```bash
npm run build   # builds apps/web → apps/web/dist
```

### Frontend → Vercel

1. Push your branch to GitHub.
2. In Vercel: **Add New → Project → Import** this repo.
3. Vercel will auto-detect the root `vercel.json` (framework: Vite, output: `apps/web/dist`). No "Root Directory" override is needed.
4. Under **Settings → Environment Variables**, add at minimum:
   - `VITE_USE_SUPABASE` = `true`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` = your Vercel production URL (e.g. `https://your-app.vercel.app`)
   - `VITE_RAZORPAY_KEY_ID` (if using Razorpay)
   - `VITE_WEB3FORMS_ACCESS_KEY` (if using support form)
   - `VITE_API_URL` = your deployed backend URL (e.g. `https://finplan-api.onrender.com`) — only if the app calls the backend
5. Click **Deploy**. Subsequent pushes to the branch will redeploy automatically.

### Backend

The backend is in a separate repository and deploys independently. Once it's deployed, make sure:

- Its `CORS_ORIGIN` (or equivalent) includes your Vercel production URL (and `http://localhost:5173` for local dev).
- You set `VITE_API_URL` in Vercel to the backend's public URL.

### Quick deploy checklist

- [ ] Supabase project provisioned (`SUPABASE_SETUP.md`)
- [ ] Backend (separate repo) deployed and reachable
- [ ] Backend CORS includes the Vercel URL
- [ ] Frontend deployed to Vercel with all `VITE_*` env vars set

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Verify variables start with `VITE_`
- Restart development server after changes
- **To run without Supabase:** Set `VITE_USE_SUPABASE=false` or leave `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` unset to use mock mode (no database).

### Authentication not working
- Check Supabase project is active
- Verify auth providers are enabled
- Check browser console for errors

### Data not saving
- Verify JWT token is valid
- Check network tab for failed requests
- Review Supabase logs for errors

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for setup help
- Review [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) for architecture
- Open an issue on GitHub

## Roadmap

- [ ] Multi-plan support (allow users to maintain multiple plans)
- [ ] PDF export functionality
- [ ] Email notifications for milestones
- [ ] Financial advisor collaboration features
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync

---

Built with ❤️ using React and Supabase
