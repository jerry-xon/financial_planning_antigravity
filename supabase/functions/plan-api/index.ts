/**
 * plan-api — authenticated CRUD for financial_plans.
 *
 * Replaces direct PostgREST writes from the browser for plan data.
 * RLS still applies via the user-scoped Supabase client.
 *
 * Actions:
 *   get_active | get | create | update | mark_summary_generated | delete
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, readJsonBody } from '../_shared/http.ts';
import { loadOwnedPlan, requireUser } from '../_shared/auth.ts';

const ALLOWED_UPDATE_KEYS = new Set([
  'plan_name',
  'current_step',
  'family_members',
  'income',
  'expense_categories',
  'asset_categories',
  'liability_categories',
  'goals',
  'policies',
  'contingency_fund',
  'has_life_insurance',
  'has_health_insurance',
  'summary_life_cover',
  'summary_health_cover',
  'summary_report_generated_at',
  'inflation_rates',
  'journey_adjustments',
  'investment_allocations',
  'loan_proposals',
  'allocation_plans',
  'goal_mappings',
  'insurance_mode',
  'calculator_inputs',
  'current_year_ledger',
  'plan_start_month',
  'is_active',
  'client_name',
  'client_email',
  'agent_id',
]);

function pickAllowedUpdates(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (ALLOWED_UPDATE_KEYS.has(key)) out[key] = value;
  }
  return out;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed' });
  }

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  const parsed = await readJsonBody(req);
  if (!parsed.ok) return parsed.response;

  const action = String(parsed.body.action || '').trim();
  const { userClient, user } = auth.ctx;

  try {
    switch (action) {
      case 'get_active': {
        const { data, error } = await userClient
          .from('financial_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) {
          return json(400, { success: false, error: error.message });
        }

        let plan = data && data.length > 0 ? data[0] : null;
        if (!plan) {
          const created = await createDefaultPlan(userClient, user.id, parsed.body.planName);
          if (!created.ok) return created.response;
          plan = created.plan;
        }
        return json(200, { success: true, data: plan });
      }

      case 'get': {
        const planId = String(parsed.body.planId || '');
        const loaded = await loadOwnedPlan(userClient, planId);
        if (!loaded.ok) return loaded.response;
        return json(200, { success: true, data: loaded.plan });
      }

      case 'create': {
        const created = await createDefaultPlan(
          userClient,
          user.id,
          parsed.body.planName,
          parsed.body as Record<string, unknown>,
        );
        if (!created.ok) return created.response;
        return json(200, { success: true, data: created.plan });
      }

      case 'update': {
        const planId = String(parsed.body.planId || '');
        if (!planId) {
          return json(400, { success: false, error: 'planId is required' });
        }
        // Ownership check first
        const owned = await loadOwnedPlan(userClient, planId);
        if (!owned.ok) return owned.response;

        const updates = pickAllowedUpdates(asObject(parsed.body.updates ?? parsed.body.payload));
        if (Object.keys(updates).length === 0) {
          return json(400, { success: false, error: 'No allowed update fields provided' });
        }
        updates.updated_at = new Date().toISOString();

        const { data, error } = await userClient
          .from('financial_plans')
          .update(updates)
          .eq('id', planId)
          .select('*')
          .single();

        if (error) {
          return json(400, { success: false, error: error.message });
        }
        return json(200, { success: true, data });
      }

      case 'mark_summary_generated': {
        const planId = String(parsed.body.planId || '');
        const owned = await loadOwnedPlan(userClient, planId);
        if (!owned.ok) return owned.response;

        const { data, error } = await userClient
          .from('financial_plans')
          .update({
            summary_report_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', planId)
          .select('*')
          .single();

        if (error) {
          return json(400, { success: false, error: error.message });
        }
        return json(200, { success: true, data });
      }

      case 'delete': {
        const planId = String(parsed.body.planId || '');
        const owned = await loadOwnedPlan(userClient, planId);
        if (!owned.ok) return owned.response;

        const { error } = await userClient.from('financial_plans').delete().eq('id', planId);
        if (error) {
          return json(400, { success: false, error: error.message });
        }
        return json(200, { success: true, data: { deleted: true, planId } });
      }

      default:
        return json(400, {
          success: false,
          error: `Unknown action: ${action}`,
          allowed: ['get_active', 'get', 'create', 'update', 'mark_summary_generated', 'delete'],
        });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'plan-api failed';
    console.error('plan-api error', action, message);
    return json(500, { success: false, error: message });
  }
});

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function createDefaultPlan(
  // deno-lint-ignore no-explicit-any
  userClient: any,
  userId: string,
  planName: unknown,
  extra: Record<string, unknown> = {},
): Promise<{ ok: true; plan: Record<string, unknown> } | { ok: false; response: Response }> {
  const row = {
    user_id: userId,
    plan_name: typeof planName === 'string' && planName.trim() ? planName.trim() : 'My Financial Plan',
    current_step: 1,
    family_members: [
      {
        name: '',
        dob: '',
        occupation: '',
        retirementAge: 60,
        relation: 'Self',
        natureOfBusiness: '',
        organizationName: '',
        educationalQualification: '',
      },
    ],
    income: { self: '', spouse: '', bonus: '', passive: '', other: '' },
    expense_categories: {
      household: { grocery: '', rent: '', education: '', lifestyle: '', medical: '', travel: '' },
      emi: {
        personalLoan: '',
        homeLoan: '',
        educationLoan: '',
        carLoan: '',
        twoWheelerLoan: '',
        otherEmi: '',
        healthInsurance: '',
        carInsurance: '',
        bikeInsurance: '',
        otherInsurance: '',
      },
      savings: { sip: '', ppf: '', nps: '', rd: '', otherSaving: '' },
      summaryMonthlyInvestments: '',
      summaryOtherSavings: '',
    },
    asset_categories: {
      equity: { stocks: '', mfEquity: '' },
      debt: { ppf: '', fd: '' },
      realEstate: { residence: '', investmentProp: '' },
      others: { gold: '', others: '' },
    },
    liability_categories: { loans: { home: '', car: '', other: '' } },
    goals: [],
    policies: [],
    contingency_fund: 0,
    inflation_rates: { incomeIncrement: 10, householdInflation: 6, educationInflation: 8 },
    journey_adjustments: [],
    investment_allocations: [],
    loan_proposals: [],
    allocation_plans: {},
    goal_mappings: {},
    insurance_mode: null,
    plan_start_month: new Date().getMonth(),
    ...pickAllowedUpdates(extra),
  };

  const { data, error } = await userClient.from('financial_plans').insert([row]).select('*').single();
  if (error) {
    return { ok: false, response: json(400, { success: false, error: error.message }) };
  }
  return { ok: true, plan: data as Record<string, unknown> };
}
