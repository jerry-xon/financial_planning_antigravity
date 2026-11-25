# Project Context & Architecture Rules

## 1. Dual-Model Architecture & Single Source of Truth
- **Active Development Target (B2B Model):** Located in `WealthMap-Partner` (`@finplan/partner`).
  - All new feature development, client management, advisor workflows, detailed financial planning wizard forms, custom inputs, and CRM logic belong here.
- **Reference / Single Source of Truth (B2C Model):** Located in `apps/web` (`@finplan/web`).
  - **B2C development is ON HOLD.**
  - It serves strictly as the reference implementation and single source of truth for:
    - Financial calculation engines (`supabase/functions/_shared/engines/`)
    - Report component designs (`SummaryReport/`, `DetailedReport/`)
    - Core planning logic and algorithms
- **Rule:** Do NOT modify `apps/web` or B2C files for B2B-specific features, new fields, or client plan extensions.

---

## 2. B2C to B2B Bridge & Component Integration
- Reports from B2C are rendered inside B2B (`WealthMap-Partner/src/components/WealthMapReportView.jsx`) across dedicated tabs:
  1. Your Money Story (`MoneyStorySection`)
  2. The Safety Net (`SafetyNetSection`)
  3. Your Future Self (`FutureSelfSection`)
  4. Useful Insights (`ExecutiveSummarySection`)
  5. 1 Understand - Your Money Flow (`YourMoneyFlowSection`)
  6. 4 Grow - Your Money's Magic (`TrackSurplusAllocationSection`)
  7. Old report view (`ReportSections` legacy view preserved)
- B2B uses Vite aliases and bridge shims defined in `WealthMap-Partner/vite.config.js` to adapt B2C components without editing B2C source files:
  - `FinancialPlanContext` → `WealthMap-Partner/src/lib/PartnerPlanContext.jsx`
  - `AuthContext` → `WealthMap-Partner/src/lib/AuthContext.jsx`
  - `FinancialWorkspaceContext` → `WealthMap-Partner/src/lib/b2cShims/workspaceShim.jsx`
  - Profile & Projection logic → `WealthMap-Partner/src/lib/b2cShims/profileLogicShim.js` & `projectionLogicShim.js`

---

## 3. Playbook: Where to Add New Fields & Features

Always identify which scenario the field belongs to before making changes:

### Scenario A: Financial Planning Data (Income, Expenses, Assets, Liabilities, Goals, Insurance)
These fields affect client plan data and calculation reports.
1. **Frontend UI & Forms (B2B):**
   - Update form components in `WealthMap-Partner/src/components/` or pages in `WealthMap-Partner/src/pages/` (e.g., `ClientWizardPage.jsx`, `ClientDetailPage.jsx`).
2. **State & Defaults:**
   - Update `WealthMap-Partner/src/lib/planDefaults.js`:
     - Add field to `emptyPlanPayload()` with default fallback values.
     - Add conversion in `planFromDb(plan)` and `planToDb(plan)` ensuring bidirectional compatibility.
3. **Report Renderers:**
   - If displayed in partner views/reports: update `WealthMap-Partner/src/components/ReportSections.jsx` or `WealthMapReportView.jsx`.
   - If fed into shared calculation engines or server-side reports: update `supabase/functions/plan-compute/` or `supabase/functions/_shared/partnerReport.ts`.
4. **Backend & Database:**
   - Database schema: `supabase/migrations/` (create `YYYYMMDDHHMMSS_*.sql` and reflect in `supabase/schema.sql`).
   - Partner API endpoint: update `supabase/functions/partner-api/index.ts` (actions: `get_client_plan`, `update_client`, etc.) to accept, sanitize, and persist the new attributes.

### Scenario B: B2B / Partner CRM Fields (Policies, Folios, Renewals, Commissions, Leads)
These fields are exclusive to the advisor/partner book of business and CRM operations.
1. **Database Schema & Migrations:**
   - Partner master profile: `partners` table.
   - Client CRM metadata (tags, source, PAN last 4, etc.): `partner_clients` table.
   - Policy records: `crm_policies` table.
   - Investment folios: `crm_mf_folios` table.
   - Add new migration under `supabase/migrations/` and update `supabase/schema.sql`.
2. **Backend API (`partner-api`):**
   - File: `supabase/functions/partner-api/index.ts`.
   - Add/update action handlers: `crm_upsert_policy`, `crm_list_policies`, `crm_update_client`, `crm_dashboard`, etc.
3. **B2B Frontend UI:**
   - Modal forms: `WealthMap-Partner/src/components/PolicyFormModal.jsx`
   - CRM Pages: `WealthMap-Partner/src/pages/PoliciesPage.jsx`, `ClientDetailPage.jsx`, `RenewalsPage.jsx`, `DashboardPage.jsx`.
   - API client: `WealthMap-Partner/src/lib/partnerApi.js`.

### Scenario C: User Identity & Account Profiles
These fields relate to account authentication and high-level identity.
1. **Database:** `ALTER TABLE public.user_profiles ADD COLUMN ...` in `supabase/migrations/` and `supabase/schema.sql`.
2. **B2B Client Provisioning:** `supabase/functions/partner-api/index.ts` under `create_client` / `auth.admin.createUser`.
3. **B2C (Reference only):** `apps/web/src/services/authService.js` and `apps/web/src/components/ProfileModule/` (keep untouched unless authorized).

---

## 4. Verification Standard
- **Always test the B2B build before completing tasks:**
  ```bash
  npm run build:partner
  ```
- Ensure zero syntax, import, or build errors in the partner application.
- If edge functions were modified, ensure TypeScript / Deno compatibility in `supabase/functions/`.
