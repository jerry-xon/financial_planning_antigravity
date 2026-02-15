import { formatCurrency } from '../CashFlowModule/CashFlowLogic';

export const calculateNetWorth = (assetCategories, liabilityCategories) => {
    let totalAssets = 0;
    const assetBreakdown = [];

    Object.entries(assetCategories).forEach(([catKey, items]) => {
        Object.entries(items).forEach(([itemKey, value]) => {
            const amount = parseFloat(value) || 0;
            totalAssets += amount;
            if (amount > 0) {
                assetBreakdown.push({
                    name: getItemLabel(itemKey),
                    category: getCategoryLabel(catKey),
                    value: amount
                });
            }
        });
    });

    let totalLiabilities = 0;
    Object.values(liabilityCategories).forEach(items => {
        Object.values(items).forEach(value => {
            totalLiabilities += parseFloat(value) || 0;
        });
    });

    const netWorth = totalAssets - totalLiabilities;

    return {
        totalAssets,
        totalLiabilities,
        netWorth,
        assetBreakdown,
        allocation: calculateAllocation(assetBreakdown, totalAssets)
    };
};

const calculateAllocation = (breakdown, total) => {
    if (total === 0) return [];
    // Group by category for high-level allocation
    const grouped = breakdown.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.value;
        return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
        percentage: (value / total) * 100
    }));
};

const getCategoryLabel = (key) => {
    const labels = {
        equity: 'Equity Assets',
        debt: 'Fixed Income / Debt',
        realEstate: 'Real Estate',
        liquid: 'Cash & Cash Equivalents',
        others: 'Other Assets'
    };
    return labels[key] || key;
};

const getItemLabel = (key) => {
    const labels = {
        stocks: 'Direct Stocks',
        mfEquity: 'Equity Mutual Funds',
        ppf: 'PPF',
        epf: 'EPF / VPF',
        fd: 'Fixed Deposits',
        bonds: 'Bonds / NCDs',
        residence: 'Self-Occupied Property',
        investmentProp: 'Investment Property',
        cash: 'Savings Account / Cash',
        gold: 'Gold / Silver',
        others: 'Other Assets'
    };
    return labels[key] || key;
};
