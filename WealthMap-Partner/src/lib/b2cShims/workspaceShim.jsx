import React, { createContext, useContext, useCallback } from 'react';

const FinancialWorkspaceContext = createContext({
  state: { workspaceFocus: 'summary', activeSummaryReportId: 'safety_net' },
  launchRecommendationAction: () => false,
});

export function useFinancialWorkspace() {
  const ctx = useContext(FinancialWorkspaceContext);
  return ctx || { state: { workspaceFocus: 'summary', activeSummaryReportId: 'safety_net' } };
}

export function useLaunchRecommendationAction() {
  const ctx = useContext(FinancialWorkspaceContext);
  return useCallback(
    (recommendation) => {
      if (ctx?.launchRecommendationAction) {
        return ctx.launchRecommendationAction(recommendation);
      }
      return false;
    },
    [ctx],
  );
}

export function FinancialWorkspaceProvider({ children }) {
  return (
    <FinancialWorkspaceContext.Provider
      value={{
        state: { workspaceFocus: 'summary', activeSummaryReportId: 'safety_net' },
        launchRecommendationAction: () => false,
      }}
    >
      {children}
    </FinancialWorkspaceContext.Provider>
  );
}

export default FinancialWorkspaceContext;

