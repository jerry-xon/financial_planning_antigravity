/** Stub FinancialPlanContext / AuthContext for Edge engine bundles. */
export function useFinancialPlan() {
  return {
    familyMembers: [],
    income: {},
    expenseCategories: {},
    assetCategories: {},
    liabilityCategories: {},
    goals: [],
    policies: [],
    calculatorInputs: {},
    investmentAllocations: [],
    goalMappings: {},
    setCalculatorInputs: () => {},
    setInvestmentAllocations: () => {},
    setGoalMappings: () => {},
  };
}

export function useAuth() {
  return { user: null, session: null };
}

export function FinancialPlanProvider({ children }) {
  return children ?? null;
}

export function AuthProvider({ children }) {
  return children ?? null;
}

export default {};
