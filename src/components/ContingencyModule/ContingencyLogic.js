export const calculateContingencyFund = (expenseCategories, fundAvailable) => {
    // A. Monthly Expenditure (Household)
    const householdTotal = Object.values(expenseCategories.household || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    // B. EMIs & Insurance
    const emiTotal = Object.values(expenseCategories.emi || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const monthlyTotal = householdTotal + emiTotal;
    const contingencyPeriod = 6;
    const idealFundsRequired = monthlyTotal * contingencyPeriod;
    const availableFunds = parseFloat(fundAvailable) || 0;
    const netShortfall = idealFundsRequired - availableFunds;

    const isHealthy = availableFunds >= idealFundsRequired;

    let suggestion = "";
    if (isHealthy) {
        suggestion = "You have a healthy contingency fund. Since there is a surplus, consider allocating these funds to higher-return investments like Mutual Funds or Equity.";
    } else {
        suggestion = "There is a shortfall in your emergency fund. We suggest prioritizing this and filling the gap as soon as possible to ensure financial stability during unforeseen events.";
    }

    return {
        monthlyTotal,
        contingencyPeriod,
        idealFundsRequired,
        availableFunds,
        netShortfall,
        isHealthy,
        suggestion
    };
};
