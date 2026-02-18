export const EDUCATION_STANDARDS = [
    'Play Group',
    'LKG',
    'UKG',
    '1st standard',
    '2nd Standard',
    '3rd Standard',
    '4th standard',
    '5th standard',
    '6th standard',
    '7th standard',
    '8th standard',
    '9th standard',
    '10th standard',
    '11th standard',
    '12th standard'
];

export const generateProjections = (params) => {
    const {
        familyMembers,
        income,
        expenseCategories,
        goals,
        inflationRates,
        startYear = new Date().getFullYear()
    } = params;

    const {
        incomeIncrement = 0,
        householdInflation = 0,
        educationInflation = 0
    } = inflationRates;

    // 1. Determine End Year (Retirement Year of 'Self')
    const self = familyMembers.find(m => m.relation === 'Self');
    if (!self) return [];
    
    // Calculate birth year from DOB if available, or assume current age
    const birthYear = self.dob ? new Date(self.dob).getFullYear() : (startYear - (self.age || 30));
    const retirementYear = birthYear + (parseInt(self.retirementAge) || 60);
    
    const yearsToProject = retirementYear - startYear + 1;
    if (yearsToProject <= 0) return [];

    // 2. Initial Annual Figures (from Monthly)
    const annualIncomeBase = Object.values(income).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) * 12;
    
    const householdMonthly = Object.values(expenseCategories.household || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const emiMonthly = Object.values(expenseCategories.emi || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const savingsMonthly = Object.values(expenseCategories.savings || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const projections = [];

    for (let i = 0; i < yearsToProject; i++) {
        const year = startYear + i;
        
        // Income with Increment
        const annualInflow = annualIncomeBase * Math.pow(1 + (incomeIncrement / 100), i);
        
        // Outflows logic
        const householdOutflow = (householdMonthly * 12) * Math.pow(1 + (householdInflation / 100), i);
        const fixedOutflow = (emiMonthly * 12); // Flat
        const annualOutflow = householdOutflow + fixedOutflow;
        
        // Education logic for each child
        let totalEducationExpenses = 0;
        familyMembers.forEach(member => {
            if (member.relation === 'Child') {
                const currentStandard = member.standard || '';
                const baseFee = parseFloat(member.annualSchoolFee) || 0;
                
                // Find current index in progression
                const currentIndex = EDUCATION_STANDARDS.findIndex(s => 
                    s.toLowerCase().includes(currentStandard.toLowerCase()) || 
                    currentStandard.toLowerCase().includes(s.toLowerCase())
                );
                
                // If standard is found and hasn't exceeded 12th
                if (currentIndex !== -1) {
                    const yearsSinceStart = i;
                    const futureIndex = currentIndex + yearsSinceStart;
                    
                    if (futureIndex < EDUCATION_STANDARDS.length) {
                        // Fee with inflation
                        totalEducationExpenses += baseFee * Math.pow(1 + (educationInflation / 100), i);
                    }
                }
            }
        });

        const totalOutflow = annualOutflow + totalEducationExpenses;
        const surplusBeforeSaving = annualInflow - totalOutflow;
        const savingsAndInvestments = savingsMonthly * 12; // Flat as per current understanding
        const netInvestibleSurplus = surplusBeforeSaving - savingsAndInvestments;

        // Goals fall in this year
        const goalsInYear = goals.filter(g => {
            const yearsToGoal = parseFloat(g.yearsToGoal) || 0;
            const targetYear = startYear + Math.round(yearsToGoal);
            return targetYear === year;
        }).map(g => g.name);

        projections.push({
            year,
            annualInflow,
            annualOutflow,
            educationExpenses: totalEducationExpenses,
            totalOutflow,
            surplusBeforeSaving,
            savingsAndInvestments,
            netInvestibleSurplus,
            goalsInYear
        });
    }

    return projections;
};
