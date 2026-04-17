export const calculateProtectionGap = (expenseCategories, policies, familyMembers) => {
    // A. Monthly Expenditure (Household)
    const householdTotal = Object.values(expenseCategories.household || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    // B. EMIs & Insurance
    const emiTotal = Object.values(expenseCategories.emi || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const monthlyExpenditure = householdTotal + emiTotal;
    const multiplier = 200;
    const protectionNeed = monthlyExpenditure * multiplier;

    // Find names for Self and Spouse
    const selfMember = familyMembers.find(m => m.relation === 'Self');
    const spouseMember = familyMembers.find(m => m.relation === 'Spouse');

    const calculateIndividualGap = (memberName) => {
        if (!memberName) return null;

        const individualCoverage = policies
            .filter(p => p.insuredName === memberName)
            .reduce((sum, p) => sum + (parseFloat(p.sumAssured) || 0), 0);

        const gap = protectionNeed - individualCoverage;

        return {
            name: memberName,
            coverage: individualCoverage,
            need: protectionNeed,
            gap: gap,
            isGap: gap > 0
        };
    };

    return {
        monthlyExpenditure,
        multiplier,
        protectionNeed,
        self: calculateIndividualGap(selfMember?.name || 'Self'),
        spouse: (spouseMember && spouseMember.occupation?.toLowerCase() !== 'housewife') ? calculateIndividualGap(spouseMember.name) : null
    };
};
