/**
 * Bridge: Edge plan-compute when VITE_USE_EDGE_API !== 'false',
 * otherwise (or on failure) the original in-browser Logic.js engines.
 */
import { useEdgeApi } from '../services/edgeApiClient';
import {
  buildComputePayload,
  computePlan,
} from '../services/planComputeService';
import { buildExecutiveSummaryReport } from '../components/SummaryReport/ExecutiveSummaryLogic';
import { calculateCashFlow } from '../components/CashFlowModule/CashFlowLogic';
import { generateProjections } from '../components/JourneyModule/ProjectionLogic';
import { calculateProtectionGap } from '../components/ProtectionGapModule/ProtectionGapLogic';
import { calculateNetWorth } from '../components/AssetModule/AssetLogic';
import { buildYourMoneyFlowReport } from '../components/DetailedReport/moneyFlowLedgerLogic';
import { resolveEmploymentType } from '../components/DetailedFlow/employmentTypeSync';

async function withEdgeFallback(action, planState, planId, localFn) {
  if (useEdgeApi()) {
    try {
      return await computePlan(action, {
        planId,
        payload: buildComputePayload(planState),
      });
    } catch (error) {
      console.warn(`[planComputeBridge] ${action} via edge failed, using local engine:`, error?.message || error);
    }
  }
  return localFn();
}

export async function bridgeExecutiveSummary(planState, planId) {
  return withEdgeFallback('executive_summary', planState, planId, () =>
    buildExecutiveSummaryReport({
      income: planState.income,
      expenseCategories: planState.expenseCategories,
      assetCategories: planState.assetCategories,
      summaryLifeCover: planState.summaryLifeCover,
      summaryHealthCover: planState.summaryHealthCover,
      contingencyFund: planState.contingencyFund,
      goals: planState.goals,
      inflationRates: planState.inflationRates,
      familyMembers: planState.familyMembers,
      hasSpouseIncome: planState.hasSpouseIncome,
      policies: planState.policies,
      hasHealthInsurance: planState.hasHealthInsurance,
      liabilityCategories: planState.liabilityCategories,
      calculatorInputs: planState.calculatorInputs,
    }),
  );
}

export async function bridgeCashFlow(planState, planId) {
  return withEdgeFallback('cashflow', planState, planId, () =>
    calculateCashFlow(
      planState.income,
      planState.expenseCategories,
      planState.familyMembers,
      planState.hasSpouseIncome,
    ),
  );
}

export async function bridgeProjections(planState, planId) {
  return withEdgeFallback('projections', planState, planId, () =>
    generateProjections({
      familyMembers: planState.familyMembers,
      income: planState.income,
      expenseCategories: planState.expenseCategories,
      goals: planState.goals,
      inflationRates: planState.inflationRates,
      journeyAdjustments: planState.journeyAdjustments,
      investmentAllocations: planState.investmentAllocations,
      loanProposals: planState.loanProposals,
      policies: planState.policies,
      planStartMonth: planState.planStartMonth,
      currentYearLedger: planState.currentYearLedger,
      hasSpouseIncome: planState.hasSpouseIncome,
    }),
  );
}

export async function bridgeProtectionGap(planState, planId) {
  return withEdgeFallback('protection_gap', planState, planId, () =>
    calculateProtectionGap(
      planState.expenseCategories,
      planState.policies,
      planState.familyMembers,
      planState.income,
      planState.inflationRates,
      planState.calculatorInputs,
      planState.goals,
      planState.assetCategories,
      planState.liabilityCategories,
    ),
  );
}

export async function bridgeNetWorth(planState, planId) {
  return withEdgeFallback('net_worth', planState, planId, () =>
    calculateNetWorth(planState.assetCategories, planState.liabilityCategories),
  );
}

export async function bridgeMoneyFlow(planState, planId, journeyProjections) {
  return withEdgeFallback('money_flow', planState, planId, () =>
    buildYourMoneyFlowReport({
      currentYearLedger: planState.currentYearLedger,
      planStartMonth: planState.planStartMonth,
      familyMembers: planState.familyMembers,
      income: planState.income,
      expenseCategories: planState.expenseCategories,
      hasSpouseIncome: planState.hasSpouseIncome,
      resolveEmploymentType,
      journeyProjections,
    }),
  );
}
