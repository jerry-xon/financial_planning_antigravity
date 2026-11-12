import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { normalizeIncomeState } from '../../../apps/web/src/components/DetailedFlow/incomeDetailSync';
import { hasAnyEmiCommitment } from '../../../apps/web/src/components/DetailedFlow/expenseDetailSync';
import { migrateInsuranceBlock } from '../../../apps/web/src/components/DetailedFlow/insuranceDetailSync';
import { emptyPlanPayload } from './planDefaults';

const FinancialPlanContext = createContext(null);

export function useFinancialPlan() {
  const ctx = useContext(FinancialPlanContext);
  if (!ctx) throw new Error('useFinancialPlan must be used within PartnerPlanProvider');
  return ctx;
}

function seedFromPlan(plan) {
  const base = emptyPlanPayload();
  const merged = { ...base, ...(plan || {}) };
  const income = normalizeIncomeState(merged.income || {});
  const expenseCategories = {
    ...base.expenseCategories,
    ...(merged.expenseCategories || {}),
    household: { ...base.expenseCategories.household, ...(merged.expenseCategories?.household || {}) },
    emi: { ...base.expenseCategories.emi, ...(merged.expenseCategories?.emi || {}) },
    insurance: migrateInsuranceBlock({
      ...base.expenseCategories.insurance,
      ...(merged.expenseCategories?.insurance || {}),
    }),
    savings: { ...base.expenseCategories.savings, ...(merged.expenseCategories?.savings || {}) },
  };
  return {
    familyMembers:
      Array.isArray(merged.familyMembers) && merged.familyMembers.length
        ? merged.familyMembers
        : base.familyMembers,
    income,
    expenseCategories,
    assetCategories: {
      ...base.assetCategories,
      ...(merged.assetCategories || {}),
      realEstate: { ...base.assetCategories.realEstate, ...(merged.assetCategories?.realEstate || {}) },
      vehicles: { ...base.assetCategories.vehicles, ...(merged.assetCategories?.vehicles || {}) },
      valuables: { ...base.assetCategories.valuables, ...(merged.assetCategories?.valuables || {}) },
      cash: { ...base.assetCategories.cash, ...(merged.assetCategories?.cash || {}) },
      investments: {
        ...base.assetCategories.investments,
        ...(merged.assetCategories?.investments || {}),
      },
      retirement: { ...base.assetCategories.retirement, ...(merged.assetCategories?.retirement || {}) },
      custom: Array.isArray(merged.assetCategories?.custom) ? merged.assetCategories.custom : [],
    },
    liabilityCategories: {
      ...base.liabilityCategories,
      ...(merged.liabilityCategories || {}),
      loans: { ...base.liabilityCategories.loans, ...(merged.liabilityCategories?.loans || {}) },
      custom: Array.isArray(merged.liabilityCategories?.custom)
        ? merged.liabilityCategories.custom
        : [],
    },
    goals: Array.isArray(merged.goals) ? merged.goals : [],
    policies: Array.isArray(merged.policies) ? merged.policies : [],
    contingencyFund: merged.contingencyFund ?? '',
    inflationRates: merged.inflationRates || base.inflationRates,
    hasLifeInsurance: merged.hasLifeInsurance ?? null,
    hasHealthInsurance: merged.hasHealthInsurance ?? null,
    summaryLifeCover: merged.summaryLifeCover ?? '',
    summaryHealthCover: merged.summaryHealthCover ?? '',
    hasSpouseIncome:
      merged.hasSpouseIncome ??
      !!(income.spouse && Number(income.spouse) > 0),
    hasEMI: merged.hasEMI ?? hasAnyEmiCommitment(expenseCategories),
    currentYearLedger: merged.currentYearLedger,
    investmentAllocations: merged.investmentAllocations || [],
    goalMappings: merged.goalMappings || {},
  };
}

export function PartnerPlanProvider({ plan: planProp, children }) {
  const [familyMembers, setFamilyMembers] = useState(() => seedFromPlan(planProp).familyMembers);
  const [income, setIncome] = useState(() => seedFromPlan(planProp).income);
  const [expenseCategories, setExpenseCategories] = useState(
    () => seedFromPlan(planProp).expenseCategories,
  );
  const [assetCategories, setAssetCategories] = useState(
    () => seedFromPlan(planProp).assetCategories,
  );
  const [liabilityCategories, setLiabilityCategories] = useState(
    () => seedFromPlan(planProp).liabilityCategories,
  );
  const [goals, setGoals] = useState(() => seedFromPlan(planProp).goals);
  const [policies, setPolicies] = useState(() => seedFromPlan(planProp).policies);
  const [contingencyFund, setContingencyFund] = useState(
    () => seedFromPlan(planProp).contingencyFund,
  );
  const [inflationRates, setInflationRates] = useState(
    () => seedFromPlan(planProp).inflationRates,
  );
  const [hasLifeInsurance, setHasLifeInsurance] = useState(
    () => seedFromPlan(planProp).hasLifeInsurance,
  );
  const [hasHealthInsurance, setHasHealthInsurance] = useState(
    () => seedFromPlan(planProp).hasHealthInsurance,
  );
  const [summaryLifeCover, setSummaryLifeCover] = useState(
    () => seedFromPlan(planProp).summaryLifeCover,
  );
  const [summaryHealthCover, setSummaryHealthCover] = useState(
    () => seedFromPlan(planProp).summaryHealthCover,
  );
  const [hasSpouseIncome, setHasSpouseIncome] = useState(
    () => seedFromPlan(planProp).hasSpouseIncome,
  );
  const [hasEMI, setHasEMI] = useState(() => seedFromPlan(planProp).hasEMI);
  const [investmentAllocations, setInvestmentAllocations] = useState(
    () => seedFromPlan(planProp).investmentAllocations,
  );
  const [goalMappings, setGoalMappings] = useState(() => seedFromPlan(planProp).goalMappings);
  const [currentYearLedger, setCurrentYearLedger] = useState(
    () => seedFromPlan(planProp).currentYearLedger,
  );
  const [planStartMonth] = useState(new Date().getMonth());

  // Parent remounts this provider with `key={clientId}` when the loaded plan changes.

  const getPlanPayload = useCallback(
    () => ({
      familyMembers,
      income,
      expenseCategories,
      assetCategories,
      liabilityCategories,
      goals,
      policies,
      contingencyFund,
      inflationRates,
      hasLifeInsurance,
      hasHealthInsurance,
      summaryLifeCover,
      summaryHealthCover,
      hasSpouseIncome,
      hasEMI,
      investmentAllocations,
      goalMappings,
      currentYearLedger,
      planStartMonth,
    }),
    [
      familyMembers,
      income,
      expenseCategories,
      assetCategories,
      liabilityCategories,
      goals,
      policies,
      contingencyFund,
      inflationRates,
      hasLifeInsurance,
      hasHealthInsurance,
      summaryLifeCover,
      summaryHealthCover,
      hasSpouseIncome,
      hasEMI,
      investmentAllocations,
      goalMappings,
      currentYearLedger,
      planStartMonth,
    ],
  );

  const value = useMemo(
    () => ({
      planId: null,
      loading: false,
      saving: false,
      lastSaved: null,
      planSyncError: null,
      familyMembers,
      setFamilyMembers,
      income,
      setIncome,
      expenseCategories,
      setExpenseCategories,
      assetCategories,
      setAssetCategories,
      liabilityCategories,
      setLiabilityCategories,
      goals,
      setGoals,
      policies,
      setPolicies,
      contingencyFund,
      setContingencyFund,
      inflationRates,
      setInflationRates,
      hasLifeInsurance,
      setHasLifeInsurance,
      hasHealthInsurance,
      setHasHealthInsurance,
      summaryLifeCover,
      setSummaryLifeCover,
      summaryHealthCover,
      setSummaryHealthCover,
      hasSpouseIncome,
      setHasSpouseIncome,
      hasEMI,
      setHasEMI,
      investmentAllocations,
      setInvestmentAllocations,
      goalMappings,
      setGoalMappings,
      currentYearLedger,
      setCurrentYearLedger,
      planStartMonth,
      journeyAdjustments: [],
      setJourneyAdjustments: () => {},
      loanProposals: [],
      setLoanProposals: () => {},
      allocationPlans: {},
      setAllocationPlans: () => {},
      calculatorInputs: {},
      setCalculatorInputs: () => {},
      updateCalculatorData: () => () => {},
      insuranceMode: null,
      setInsuranceMode: () => {},
      expandedGoals: [],
      journeyProjections: [],
      proposedSIPs: [],
      proposedLumpsums: [],
      proposedEquities: [],
      savePlanData: async () => getPlanPayload(),
      getPlanPayload,
      handleLogoutCleanup: () => {},
      handleStepProgression: async () => {},
      markReportGenerated: async () => {},
      markDetailedPlanningComplete: async () => {},
      workspaceCapability: null,
      summaryReportGeneratedAt: null,
      currentStep: 1,
      setCurrentStep: () => {},
      maxStep: 1,
      setMaxStep: () => {},
      cashFlowSubStep: 0,
      setCashFlowSubStep: () => {},
    }),
    [
      familyMembers,
      income,
      expenseCategories,
      assetCategories,
      liabilityCategories,
      goals,
      policies,
      contingencyFund,
      inflationRates,
      hasLifeInsurance,
      hasHealthInsurance,
      summaryLifeCover,
      summaryHealthCover,
      hasSpouseIncome,
      hasEMI,
      investmentAllocations,
      goalMappings,
      currentYearLedger,
      planStartMonth,
      getPlanPayload,
    ],
  );

  return (
    <FinancialPlanContext.Provider value={value}>{children}</FinancialPlanContext.Provider>
  );
}

export default FinancialPlanContext;
