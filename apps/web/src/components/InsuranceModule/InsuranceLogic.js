export const calculatePolicyEndDate = (startDate, policyTerm) => {
    if (!startDate || !policyTerm) return '';
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + parseInt(policyTerm));
    return date.toISOString().split('T')[0];
};

export const calculateYearlyInsuranceSummary = (policies) => {
    const summary = {};

    policies.forEach(policy => {
        let startDate = new Date(policy.startDate);
        // If unconfigured or invalid, default to Jan 1st of current year so it appears in projections
        if (isNaN(startDate.getTime())) {
            startDate = new Date(new Date().getFullYear(), 0, 1);
        }

        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth(); // 0-indexed (Jan = 0)

        const premium = parseFloat(policy.premium) || 0;
        // Default to a 10-year term if premium exists but term is unconfigured
        const paymentTerm = parseInt(policy.paymentTerm) || (premium > 0 ? 10 : 0);
        const policyTerm = parseInt(policy.policyTerm) || paymentTerm;
        const freq = policy.frequency || 'Annually';

        // Frequency Multiplier and Interval
        let intervalMonths = 12; // Annually
        let multiplier = 1;
        if (freq === 'Monthly') { intervalMonths = 1; multiplier = 12; }
        else if (freq === 'Quarterly') { intervalMonths = 3; multiplier = 4; }
        else if (freq === 'Half-Yearly') { intervalMonths = 6; multiplier = 2; }
        
        const policyId = policy.id;
        const insuredName = policy.insuredName || 'Unspecified';
        const planName = policy.planName || 'Plan';

        // 1. Premium Summary (Year-wise)
        const totalPayments = paymentTerm * multiplier;
        for (let i = 0; i < totalPayments; i++) {
            // Absolute month offset from start of the starting year
            const paymentMonthTotal = startMonth + (i * intervalMonths);
            const year = startYear + Math.floor(paymentMonthTotal / 12);

            if (!summary[year]) summary[year] = { year, totalPremium: 0, policyPremiums: {}, coverage: {}, maturities: [] };

            summary[year].totalPremium += premium;
            if (!summary[year].policyPremiums[policyId]) summary[year].policyPremiums[policyId] = 0;
            summary[year].policyPremiums[policyId] += premium;
        }

        // 2. Coverage Summary (Year-wise per Insured)
        const sumAssured = parseFloat(policy.sumAssured) || 0;
        for (let i = 0; i < policyTerm; i++) {
            const year = startYear + i;
            if (!summary[year]) summary[year] = { year, totalPremium: 0, policyPremiums: {}, coverage: {}, maturities: [] };
            if (!summary[year].coverage[insuredName]) summary[year].coverage[insuredName] = 0;
            summary[year].coverage[insuredName] += sumAssured;
        }

        // 3. Maturity (Specific Year)
        const maturityYear = startYear + policyTerm;
        const maturityAmount = parseFloat(policy.maturityAmount) || 0;
        if (maturityAmount > 0) {
            if (!summary[maturityYear]) summary[maturityYear] = { year: maturityYear, totalPremium: 0, policyPremiums: {}, coverage: {}, maturities: [] };
            summary[maturityYear].maturities.push({
                planName: policy.planName,
                amount: maturityAmount,
                insuredName
            });
        }
    });

    // Convert to sorted array
    return Object.values(summary).sort((a, b) => a.year - b.year);
};

export const getInsuredNamesList = (policies) => {
    const names = new Set();
    policies.forEach(p => {
        if (p.insuredName) names.add(p.insuredName);
    });
    return Array.from(names);
};

export const getPolicyColumns = (policies) => {
    return policies.map(p => ({
        id: p.id,
        label: `${p.insuredName || 'Member'} - ${p.planName || 'Policy'}`
    }));
};
