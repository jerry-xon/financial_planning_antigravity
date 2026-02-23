export const calculateCashFlow = (income, expenseCategories) => {
    const totalIncome = (parseFloat(income.self) || 0) + 
                       (parseFloat(income.selfBonus) || 0) + 
                       (parseFloat(income.selfPassive) || 0) + 
                       (parseFloat(income.selfOther) || 0) +
                       (parseFloat(income.spouse) || 0) + 
                       (parseFloat(income.spouseBonus) || 0) + 
                       (parseFloat(income.spousePassive) || 0) + 
                       (parseFloat(income.spouseOther) || 0) +
                       (parseFloat(income.family) || 0); // Include legacy family income if present

    const categorySums = {
        household: Object.values(expenseCategories.household || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0),
        emi: Object.values(expenseCategories.emi || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0),
        savings: Object.values(expenseCategories.savings || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    };

    // New logic: total expenses = A (Household) + B (EMIs)
    const totalExpenses = categorySums.household + categorySums.emi;
    const surplus = totalIncome - totalExpenses;
    const surplusRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;

    // Ratios (requested for report)
    const householdRatio = totalIncome > 0 ? (categorySums.household / totalIncome) * 100 : 0;
    const emiRatio = totalIncome > 0 ? (categorySums.emi / totalIncome) * 100 : 0;
    const savingsRatio = totalIncome > 0 ? (categorySums.savings / totalIncome) * 100 : 0;

    const expenseBreakdown = [];
    Object.entries(expenseCategories).forEach(([categoryKey, items]) => {
        Object.entries(items).forEach(([itemKey, value]) => {
            const amount = parseFloat(value) || 0;
            if (amount > 0) {
                expenseBreakdown.push({
                    name: getItemLabel(itemKey),
                    category: getCategoryLabel(categoryKey),
                    value: amount
                });
            }
        });
    });

    // Disposable Income Logic
    const totalSavings = categorySums.savings;
    const disposableIncome = surplus - totalSavings;
    const disposableIncomeRate = totalIncome > 0 ? (disposableIncome / totalIncome) * 100 : 0;

    return {
        totalIncome,
        categorySums,
        totalExpenses,
        totalSavings,
        surplus,
        disposableIncome,
        surplusRate,
        disposableIncomeRate,
        householdRatio,
        emiRatio,
        savingsRatio,
        expenseBreakdown,
        isHealthy: surplusRate >= 20,
        isCritical: surplusRate < 0 || disposableIncome < 0
    };
};

const getCategoryLabel = (key) => {
    const labels = {
        household: 'Household & Lifestyle',
        emi: 'EMIs & Insurance',
        savings: 'Savings & Investments'
    };
    return labels[key] || key;
};

const getItemLabel = (key) => {
    const labels = {
        // Household & Lifestyle
        grocery: 'Household (Grocery, LPG, Fuel etc.)',
        rent: 'House Rent',
        education: 'Children Education',
        lifestyle: 'Lifestyle (Shopping, Movies, Dinner etc.)',
        medical: 'Medical Expenses',
        travel: 'Travel',

        // EMIs & Insurance
        personalLoan: 'Personal Loan',
        homeLoan: 'Home Loan',
        educationLoan: 'Education Loan',
        otherEmi: 'Any other EMIs',
        healthInsurance: 'Health Insurance',
        carInsurance: 'Car Insurance',
        bikeInsurance: 'Two-wheeler Insurance',
        otherInsurance: 'Others (Insurance)',
        lifeInsurancePremium: 'Life Insurance Premium',

        // Savings & Investments
        rd: 'RD',
        fd: 'FD',
        lifeInsurance: 'Life Insurance',
        ppf: 'PPF',
        savingSchemes: 'Saving Schemes',
        mfSip: 'MFs – SIP',
        otherSaving: 'Other Saving'
    };
    return labels[key] || key;
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
