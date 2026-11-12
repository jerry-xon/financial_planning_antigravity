/**
 * Partner report sections — runs the same engines as plan-compute in-process
 * so partner-api does not depend on a nested Edge Function call.
 */
import { calculateCashFlow } from './engines/cashFlow.js';
import { calculateNetWorth } from './engines/netWorth.js';
import {
  classifyAssets,
  calculateUnallocatedSurplus,
  buildWaterfallData,
  computeSIPProjection,
} from './engines/moneyStory.js';
import {
  calculateProtectionData,
  calculateContingencyData,
  calculateHealthInsuranceData,
} from './engines/safetyNet.js';
import {
  buildYourMoneyFlowReport,
} from './engines/moneyFlow.js';
import { generateProjections } from './engines/projections.js';
import { resolveEmploymentType } from './engines/employmentType.js';

function asArray(value: unknown, fallback: unknown[] = []): unknown[] {
  return Array.isArray(value) ? value : fallback;
}

function asObject(value: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : fallback;
}

export async function buildPartnerReportSections(payload: Record<string, unknown>) {
  const familyMembers = asArray(payload.familyMembers);
  const income = asObject(payload.income);
  const expenseCategories = asObject(payload.expenseCategories);
  const assetCategories = asObject(payload.assetCategories);
  const liabilityCategories = asObject(payload.liabilityCategories);
  const goals = asArray(payload.goals);
  const policies = asArray(payload.policies);
  const inflationRates = asObject(payload.inflationRates, {
    incomeIncrement: 10,
    householdInflation: 6,
    educationInflation: 8,
  });
  const hasSpouseIncome = Boolean(payload.hasSpouseIncome);
  const contingencyFund = payload.contingencyFund ?? 0;
  const summaryLifeCover = payload.summaryLifeCover;
  const summaryHealthCover = payload.summaryHealthCover;
  const hasHealthInsurance = payload.hasHealthInsurance;
  const calculatorInputs = asObject(payload.calculatorInputs);
  const investmentAllocations = asArray(payload.investmentAllocations);
  const currentYearLedger = asObject(payload.currentYearLedger);
  const planStartMonth = Number(payload.planStartMonth) || 0;
  const goalMappings = asObject(payload.goalMappings);

  const reports: Record<string, unknown> = {};

  try {
    const cashFlow = calculateCashFlow(income, expenseCategories, familyMembers, hasSpouseIncome);
    const netWorth = calculateNetWorth(assetCategories, liabilityCategories);
    reports.money_story = {
      cashFlow,
      netWorth,
      assets: classifyAssets(assetCategories),
      unallocated: calculateUnallocatedSurplus(cashFlow),
      waterfall: buildWaterfallData(cashFlow),
      sipProjection: computeSIPProjection(
        Number(asObject(expenseCategories.savings).sip) || 0,
        12,
        10,
      ),
    };
  } catch (err) {
    reports.money_story = { error: err instanceof Error ? err.message : 'money_story failed' };
  }

  try {
    reports.safety_net = {
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
  } catch (err) {
    reports.safety_net = { error: err instanceof Error ? err.message : 'safety_net failed' };
  }

  let journeyProjections: unknown[] = [];
  let moneyFlowReport: unknown = null;
  try {
    journeyProjections = generateProjections({
      familyMembers,
      income,
      expenseCategories,
      goals,
      inflationRates,
      policies,
      journeyAdjustments: asArray(payload.journeyAdjustments),
      investmentAllocations,
      loanProposals: asArray(payload.loanProposals),
      currentYearLedger,
      hasSpouseIncome,
      planStartMonth,
    });
    moneyFlowReport = buildYourMoneyFlowReport({
      currentYearLedger,
      planStartMonth,
      familyMembers,
      income,
      expenseCategories,
      hasSpouseIncome,
      resolveEmploymentType,
      journeyProjections,
    });
    reports.money_flow = moneyFlowReport;
  } catch (err) {
    reports.money_flow = { error: err instanceof Error ? err.message : 'money_flow failed' };
  }

  try {
    const { buildTrackSurplusAllocationReport } = await import('./engines/yourMoneysMagic.js');
    reports.your_moneys_magic = buildTrackSurplusAllocationReport({
      moneyFlowReport,
      journeyProjections,
      goals,
      familyMembers,
      expenseCategories,
      assetCategories,
      investmentAllocations,
      goalMappings,
      calculatorInputs,
      policies,
      currentYearLedger,
      planStartMonth,
      inflationRates,
    });
  } catch (err) {
    reports.your_moneys_magic = {
      error: err instanceof Error ? err.message : 'your_moneys_magic failed',
    };
  }

  return reports;
}
