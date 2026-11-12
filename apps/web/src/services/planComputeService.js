import { invokeEdgeFunction, useEdgeApi } from './edgeApiClient';

/**
 * Build the live plan payload Edge Functions expect (camelCase).
 * Pass the same fields FinancialPlanContext holds.
 */
export function buildComputePayload(planState = {}) {
  return {
    familyMembers: planState.familyMembers,
    income: planState.income,
    expenseCategories: planState.expenseCategories,
    assetCategories: planState.assetCategories,
    liabilityCategories: planState.liabilityCategories,
    goals: planState.goals,
    policies: planState.policies,
    contingencyFund: planState.contingencyFund,
    inflationRates: planState.inflationRates,
    journeyAdjustments: planState.journeyAdjustments,
    investmentAllocations: planState.investmentAllocations,
    loanProposals: planState.loanProposals,
    calculatorInputs: planState.calculatorInputs,
    currentYearLedger: planState.currentYearLedger,
    planStartMonth: planState.planStartMonth,
    hasSpouseIncome: planState.hasSpouseIncome,
    hasLifeInsurance: planState.hasLifeInsurance,
    hasHealthInsurance: planState.hasHealthInsurance,
    summaryLifeCover: planState.summaryLifeCover,
    summaryHealthCover: planState.summaryHealthCover,
  };
}

/**
 * Call plan-compute Edge Function.
 * @param {string} action
 * @param {{ planId?: string, payload?: object, extras?: object }} options
 */
export async function computePlan(action, options = {}) {
  const result = await invokeEdgeFunction('plan-compute', {
    action,
    planId: options.planId || undefined,
    payload: options.payload || undefined,
    extras: options.extras || undefined,
  });
  return result.data;
}

export async function computeCashFlow(planState, planId) {
  return computePlan('cashflow', {
    planId,
    payload: buildComputePayload(planState),
  });
}

export async function computeProjections(planState, planId) {
  return computePlan('projections', {
    planId,
    payload: buildComputePayload(planState),
  });
}

export async function computeProtectionGap(planState, planId) {
  return computePlan('protection_gap', {
    planId,
    payload: buildComputePayload(planState),
  });
}

export async function computeNetWorth(planState, planId) {
  return computePlan('net_worth', {
    planId,
    payload: buildComputePayload(planState),
  });
}

export async function computeExecutiveSummary(planState, planId) {
  return computePlan('executive_summary', {
    planId,
    payload: buildComputePayload(planState),
  });
}

export async function computeMoneyFlow(planState, planId) {
  return computePlan('money_flow', {
    planId,
    payload: buildComputePayload(planState),
  });
}

export async function computeAll(planState, planId) {
  return computePlan('compute_all', {
    planId,
    payload: buildComputePayload(planState),
  });
}

export { useEdgeApi };
