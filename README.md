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

**Running without Supabase (e.g. during DB migration):** You can run the app without a live database by setting `VITE_USE_SUPABASE=false` or by leaving `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` unset. The app will use a mock client (no persistence). Optionally set `VITE_DEV_USER_EMAIL=dev@localhost` to bypass the login screen and use the full UI with in-memory state.

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
financial_planning_antigravity/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons
│   ├── components/      # React components
│   │   ├── Auth/        # Login, Signup, ForgotPassword
│   │   ├── ProfileModule/
│   │   ├── CashFlowModule/
│   │   ├── AssetModule/
│   │   ├── GoalModule/
│   │   ├── InsuranceModule/
│   │   ├── ContingencyModule/
│   │   ├── ProtectionGapModule/
│   │   ├── JourneyModule/
│   │   └── ReportModule/
│   ├── contexts/        # React contexts (Auth)
│   ├── lib/             # Supabase client
│   ├── services/        # API services
│   ├── App.jsx          # Main app component
│   └── main.jsx         # App entry point
├── supabase/
│   └── schema.sql       # Database schema
├── .env.example         # Environment variables template
├── SUPABASE_SETUP.md    # Detailed Supabase setup guide
└── BACKEND_DOCUMENTATION.md  # Backend architecture docs
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
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
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

**Important**: Never commit `.env` to version control!

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Netlify

1. Push code to GitHub
2. Create new site from Git in Netlify
3. Add environment variables
4. Build command: `npm run build`
5. Publish directory: `dist`

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Verify variables start with `VITE_`
- Restart development server after changes
- **To run without Supabase:** Set `VITE_USE_SUPABASE=false` or leave `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` unset to use mock mode (no database). Set `VITE_DEV_USER_EMAIL=dev@localhost` to bypass login in mock mode.

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
