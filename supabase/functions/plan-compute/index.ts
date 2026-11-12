/**
 * plan-compute — authenticated financial engine API.
 *
 * Body: { action: string, planId?: string, payload?: object, extras?: object }
 *
 * Auth: Bearer JWT validated via getUser() (verify_jwt=false at gateway for ES256).
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, readJsonBody } from '../_shared/http.ts';
import { loadOwnedPlan, requireUser } from '../_shared/auth.ts';

import { calculateCashFlow } from '../_shared/engines/cashFlow.js';
import { generateProjections } from '../_shared/engines/projections.js';
import { calculateProtectionGap } from '../_shared/engines/protectionGap.js';
import {
  calculateIncomeTaxFromDetail,
  calculateIncomeTaxFromInput,
  calculateProjectedMemberTax,
} from '../_shared/engines/incomeTax.js';
import { calculateNetWorth } from '../_shared/engines/netWorth.js';
import { calculateFutureCost, categorizeGoals, getPredefinedGoals } from '../_shared/engines/goals.js';
import { calculateContingencyFund } from '../_shared/engines/contingency.js';
import {
  calculateAge,
  calculateRetirementYear,
  calculateProfile,
  calculateFamilyProfile,
} from '../_shared/engines/profile.js';
import { resolveEmploymentType } from '../_shared/engines/employmentType.js';
import { buildExecutiveSummaryReport, buildWhatIfScenario } from '../_shared/engines/executiveSummary.js';
import {
  calculateProtectionData,
  calculateContingencyData,
  calculateHealthInsuranceData,
} from '../_shared/engines/safetyNet.js';
import { buildFutureSelfReport } from '../_shared/engines/futureSelf.js';
import {
  classifyAssets,
  calculateUnallocatedSurplus,
  buildWaterfallData,
  computeSIPProjection,
} from '../_shared/engines/moneyStory.js';
import {
  buildYourMoneyFlowReport,
  syncLedgerFromMonthlyTotals,
  computeTaxAdjustmentArray,
} from '../_shared/engines/moneyFlow.js';
import { buildInvestSurplusReport } from '../_shared/engines/investSurplus.js';
import { buildLifeJourneyReport } from '../_shared/engines/lifeJourneyTable.js';
// yourMoneysMagic is large (calculator JSX); load lazily so a bad bundle cannot take down ping/money_story.

type PlanSnapshot = Record<string, unknown>;

function asArray(value: unknown, fallback: unknown[] = []): unknown[] {
  return Array.isArray(value) ? value : fallback;
}

function asObject(value: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : fallback;
}

function resolveSnapshot(plan: PlanSnapshot | null, payload: PlanSnapshot): PlanSnapshot {
  const base = plan ?? {};
  return {
    familyMembers: payload.familyMembers ?? base.family_members ?? base.familyMembers ?? [],
    income: payload.income ?? base.income ?? {},
    expenseCategories: payload.expenseCategories ?? base.expense_categories ?? base.expenseCategories ?? {},
    assetCategories: payload.assetCategories ?? base.asset_categories ?? base.assetCategories ?? {},
    liabilityCategories:
      payload.liabilityCategories ?? base.liability_categories ?? base.liabilityCategories ?? {},
    goals: payload.goals ?? base.goals ?? [],
    policies: payload.policies ?? base.policies ?? [],
    contingencyFund: payload.contingencyFund ?? base.contingency_fund ?? base.contingencyFund ?? 0,
    inflationRates: payload.inflationRates ?? base.inflation_rates ?? base.inflationRates ?? {
      incomeIncrement: 10,
      householdInflation: 6,
      educationInflation: 8,
    },
    journeyAdjustments:
      payload.journeyAdjustments ?? base.journey_adjustments ?? base.journeyAdjustments ?? [],
    investmentAllocations:
      payload.investmentAllocations ?? base.investment_allocations ?? base.investmentAllocations ?? [],
    loanProposals: payload.loanProposals ?? base.loan_proposals ?? base.loanProposals ?? [],
    goalMappings: payload.goalMappings ?? base.goal_mappings ?? base.goalMappings ?? {},
    calculatorInputs: payload.calculatorInputs ?? base.calculator_inputs ?? base.calculatorInputs ?? {},
    currentYearLedger:
      payload.currentYearLedger ?? base.current_year_ledger ?? base.currentYearLedger ?? {},
    planStartMonth: payload.planStartMonth ?? base.plan_start_month ?? base.planStartMonth ?? 0,
    hasSpouseIncome: payload.hasSpouseIncome ?? false,
    hasLifeInsurance: payload.hasLifeInsurance ?? base.has_life_insurance ?? null,
    hasHealthInsurance: payload.hasHealthInsurance ?? base.has_health_insurance ?? null,
    summaryLifeCover: payload.summaryLifeCover ?? base.summary_life_cover ?? '',
    summaryHealthCover: payload.summaryHealthCover ?? base.summary_health_cover ?? '',
  };
}

function buildProjections(snap: PlanSnapshot) {
  return generateProjections({
    familyMembers: asArray(snap.familyMembers),
    income: asObject(snap.income),
    expenseCategories: asObject(snap.expenseCategories),
    goals: asArray(snap.goals),
    inflationRates: asObject(snap.inflationRates),
    policies: asArray(snap.policies),
    journeyAdjustments: asArray(snap.journeyAdjustments),
    investmentAllocations: asArray(snap.investmentAllocations),
    loanProposals: asArray(snap.loanProposals),
    currentYearLedger: asObject(snap.currentYearLedger),
    hasSpouseIncome: Boolean(snap.hasSpouseIncome),
    planStartMonth: Number(snap.planStartMonth) || 0,
  });
}

function buildMoneyFlow(snap: PlanSnapshot, journeyProjections?: unknown[]) {
  return buildYourMoneyFlowReport({
    currentYearLedger: asObject(snap.currentYearLedger),
    planStartMonth: Number(snap.planStartMonth) || 0,
    familyMembers: asArray(snap.familyMembers),
    income: asObject(snap.income),
    expenseCategories: asObject(snap.expenseCategories),
    hasSpouseIncome: Boolean(snap.hasSpouseIncome),
    resolveEmploymentType,
    journeyProjections: journeyProjections ?? buildProjections(snap),
  });
}

function runAction(action: string, snap: PlanSnapshot, extras: PlanSnapshot = {}): unknown | Promise<unknown> {
  const familyMembers = asArray(snap.familyMembers);
  const income = asObject(snap.income);
  const expenseCategories = asObject(snap.expenseCategories);
  const assetCategories = asObject(snap.assetCategories);
  const liabilityCategories = asObject(snap.liabilityCategories);
  const goals = asArray(snap.goals);
  const policies = asArray(snap.policies);
  const inflationRates = asObject(snap.inflationRates);
  const hasSpouseIncome = Boolean(snap.hasSpouseIncome);
  const calculatorInputs = asObject(snap.calculatorInputs);
  const contingencyFund = snap.contingencyFund;
  const summaryLifeCover = snap.summaryLifeCover;
  const summaryHealthCover = snap.summaryHealthCover;
  const hasHealthInsurance = snap.hasHealthInsurance;
  const investmentAllocations = asArray(snap.investmentAllocations);

  switch (action) {
    case 'ping':
      return { ok: true, engine: 'plan-compute', version: 1 };

    case 'cashflow':
      return calculateCashFlow(income, expenseCategories, familyMembers, hasSpouseIncome);

    case 'projections':
      return buildProjections(snap);

    case 'protection_gap':
      return calculateProtectionGap(
        expenseCategories,
        policies,
        familyMembers,
        income,
        inflationRates,
        calculatorInputs,
        goals,
        assetCategories,
        liabilityCategories,
      );

    case 'net_worth':
      return calculateNetWorth(assetCategories, liabilityCategories);

    case 'contingency':
      return calculateContingencyFund(expenseCategories, contingencyFund);

    case 'goal_future_cost':
      return {
        futureCost: calculateFutureCost(extras.presentValue ?? extras.pv, extras.years, extras.inflationRate ?? extras.inflation),
        categorized: categorizeGoals(goals),
        predefined: getPredefinedGoals(familyMembers),
      };

    case 'income_tax': {
      const detail = asObject(extras.detail ?? extras.selfDetail);
      const employmentType = String(extras.employmentType || 'Private Sector');
      if (extras.taxInput) return calculateIncomeTaxFromInput(asObject(extras.taxInput));
      if (extras.yearIndex != null) {
        return calculateProjectedMemberTax(
          detail,
          employmentType,
          Number(extras.yearIndex),
          Number(extras.incomeIncrementPercent) || 0,
        );
      }
      return calculateIncomeTaxFromDetail(detail, employmentType);
    }

    case 'profile':
      return {
        family: calculateFamilyProfile(familyMembers),
        members: familyMembers.map((m) => calculateProfile(m)),
      };

    case 'age':
      return {
        age: calculateAge(extras.dob),
        retirementYear: calculateRetirementYear(extras.dob, extras.retirementAge),
      };

    case 'executive_summary':
      return buildExecutiveSummaryReport({
        income,
        expenseCategories,
        assetCategories,
        summaryLifeCover,
        summaryHealthCover,
        contingencyFund,
        goals,
        inflationRates,
        familyMembers,
        hasSpouseIncome,
        policies,
        hasHealthInsurance,
        liabilityCategories,
        calculatorInputs,
      });

    case 'what_if_score':
      return buildWhatIfScenario(asObject(extras.baseReport), asObject(extras.scenario));

    case 'safety_net':
      return {
        protection: calculateProtectionData(
          expenseCategories,
          summaryLifeCover,
          familyMembers,
          policies,
          income,
          inflationRates,
          calculatorInputs,
          goals,
          assetCategories,
          liabilityCategories,
        ),
        contingency: calculateContingencyData(expenseCategories, contingencyFund, familyMembers),
        health: calculateHealthInsuranceData(
          summaryHealthCover,
          hasHealthInsurance,
          familyMembers,
          policies,
        ),
      };

    case 'future_self': {
      const cashFlowResults = calculateCashFlow(income, expenseCategories, familyMembers, hasSpouseIncome);
      return buildFutureSelfReport({
        goals,
        cashFlowResults,
        expenseCategories,
        inflationRates,
      });
    }

    case 'money_story': {
      const cashFlow = calculateCashFlow(income, expenseCategories, familyMembers, hasSpouseIncome);
      const netWorth = calculateNetWorth(assetCategories, liabilityCategories);
      return {
        cashFlow,
        netWorth,
        assets: classifyAssets(assetCategories),
        unallocated: calculateUnallocatedSurplus(cashFlow),
        waterfall: buildWaterfallData(cashFlow),
        sipProjection: computeSIPProjection(
          Number(extras.monthlySip) || Number(asObject(expenseCategories.savings).sip) || 0,
          Number(extras.annualRate) || 12,
          Number(extras.years) || 10,
        ),
      };
    }

    case 'money_flow':
      return buildMoneyFlow(snap);

    case 'sync_ledger':
      return syncLedgerFromMonthlyTotals(
        asObject(extras.ledger ?? snap.currentYearLedger),
        asObject(extras.totals),
      );

    case 'tax_adjustment':
      return computeTaxAdjustmentArray({
        income,
        familyMembers,
        hasSpouseIncome,
        resolveEmploymentType,
        calendarYear: Number(extras.calendarYear) || new Date().getFullYear(),
      });

    case 'invest_surplus': {
      const moneyFlowReport = buildMoneyFlow(snap);
      return buildInvestSurplusReport({
        moneyFlowReport,
        familyMembers,
        expenseCategories,
        assetCategories,
        contingencyFund,
        summaryLifeCover,
        investmentAllocations,
        policies,
        liabilityCategories,
        income,
        inflationRates,
        calculatorInputs,
        goals,
      });
    }

    case 'life_journey_table': {
      const journeyProjections = buildProjections(snap);
      return buildLifeJourneyReport({
        familyMembers,
        journeyProjections,
        goals,
        inflationRates,
      });
    }

    case 'your_moneys_magic': {
      const journeyProjections = buildProjections(snap);
      const moneyFlowReport = buildMoneyFlow(snap, journeyProjections);
      return import('../_shared/engines/yourMoneysMagic.js').then(({ buildTrackSurplusAllocationReport }) =>
        buildTrackSurplusAllocationReport({
          moneyFlowReport,
          journeyProjections,
          goals,
          familyMembers,
          expenseCategories,
          assetCategories,
          investmentAllocations,
          goalMappings: asObject(snap.goalMappings ?? {}),
          calculatorInputs,
          policies,
          currentYearLedger: asObject(snap.currentYearLedger),
          planStartMonth: Number(snap.planStartMonth) || 0,
          inflationRates,
        }),
      );
    }

    case 'compute_all': {
      const cashFlow = calculateCashFlow(income, expenseCategories, familyMembers, hasSpouseIncome);
      const projections = buildProjections(snap);
      const moneyFlow = buildMoneyFlow(snap, projections);
      return {
        cashFlow,
        projections,
        protectionGap: calculateProtectionGap(
          expenseCategories,
          policies,
          familyMembers,
          income,
          inflationRates,
          calculatorInputs,
          goals,
          assetCategories,
          liabilityCategories,
        ),
        netWorth: calculateNetWorth(assetCategories, liabilityCategories),
        contingency: calculateContingencyFund(expenseCategories, contingencyFund),
        moneyFlow,
        executiveSummary: buildExecutiveSummaryReport({
          income,
          expenseCategories,
          assetCategories,
          summaryLifeCover,
          summaryHealthCover,
          contingencyFund,
          goals,
          inflationRates,
          familyMembers,
          hasSpouseIncome,
          policies,
          hasHealthInsurance,
          liabilityCategories,
          calculatorInputs,
        }),
      };
    }

    default:
      return null;
  }
}

const ALLOWED_ACTIONS = [
  'ping',
  'cashflow',
  'projections',
  'protection_gap',
  'net_worth',
  'contingency',
  'goal_future_cost',
  'income_tax',
  'profile',
  'age',
  'executive_summary',
  'what_if_score',
  'safety_net',
  'future_self',
  'money_story',
  'money_flow',
  'sync_ledger',
  'tax_adjustment',
  'invest_surplus',
  'life_journey_table',
  'your_moneys_magic',
  'compute_all',
];

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
  if (!action) {
    return json(400, { success: false, error: 'action is required' });
  }

  const planId = parsed.body.planId ? String(parsed.body.planId) : '';
  const payload = asObject(parsed.body.payload);
  const extras = asObject(parsed.body.extras);

  let plan: PlanSnapshot | null = null;
  if (planId) {
    const loaded = await loadOwnedPlan(auth.ctx.userClient, planId);
    if (!loaded.ok) return loaded.response;
    plan = loaded.plan;
  } else if (Object.keys(payload).length === 0 && action !== 'ping') {
    return json(400, {
      success: false,
      error: 'Provide planId and/or payload with plan fields',
    });
  }

  const snap = resolveSnapshot(plan, payload);

  try {
    const result = await runAction(action, snap, extras);
    if (result === null) {
      return json(400, {
        success: false,
        error: `Unknown action: ${action}`,
        allowed: ALLOWED_ACTIONS,
      });
    }
    return json(200, {
      success: true,
      action,
      planId: planId || null,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Compute failed';
    console.error('plan-compute error', action, message);
    return json(500, { success: false, error: message, action });
  }
});
