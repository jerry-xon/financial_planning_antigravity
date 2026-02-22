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
        
        // Group college costs by year to add them to educationExpenses
        let totalEducationExpenses = 0;
        
        // 1. School Education (Grade-by-grade)
        familyMembers.forEach(member => {
            if (member.relation === 'Child') {
                if (member.occupation === 'School' || !member.occupation) {
                    const currentStandard = member.standard || '';
                    const baseFee = parseFloat(member.annualSchoolFee) || 0;
                    const currentIndex = EDUCATION_STANDARDS.findIndex(s => 
                        s.toLowerCase().includes(currentStandard.toLowerCase()) || 
                        currentStandard.toLowerCase().includes(s.toLowerCase())
                    );
                    
                    if (currentIndex !== -1) {
                        const futureIndex = currentIndex + i;
                        if (futureIndex < EDUCATION_STANDARDS.length) {
                            totalEducationExpenses += baseFee * Math.pow(1 + (educationInflation / 100), i);
                        }
                    }
                } else if (member.occupation === 'College') {
                    const duration = parseFloat(member.courseDuration) || 1;
                    const remainingTime = parseFloat(member.remainingTime) || 0;
                    const totalCost = parseFloat(member.costOfCompleteCourse) || 0;
                    const isPaid = member.isFeePaid === 'YES';
                    
                    const annualCost = totalCost / duration;

                    if (i === 0) {
                        // Current year: Show fee only if NOT paid
                        if (!isPaid) {
                            totalEducationExpenses += annualCost;
                        }
                    } else if (i <= remainingTime) {
                        // Future years: Show fee for remaining years
                        totalEducationExpenses += annualCost;
                    }
                }
            }
        });

        // 2. Higher Education (from Goals section)
        goals.forEach(goal => {
            const isEducation = goal.name?.toLowerCase().includes('higher education');
            if (isEducation) {
                const yearsToGoal = parseFloat(goal.yearsToGoal) || 0;
                const duration = parseInt(goal.courseDuration) || 0;
                const totalCost = parseFloat(goal.totalCourseCost) || 0;
                const inflation = (parseFloat(goal.inflationRate) || educationInflation) / 100;
                
                // If this year falls within the [StartYear, duration] window of the goal
                const goalStartYear = startYear + Math.round(yearsToGoal);
                if (year >= goalStartYear && year < goalStartYear + duration) {
                    // Future cost of the entire course at the point of starting college
                    const futureTotalCost = totalCost * Math.pow(1 + inflation, yearsToGoal);
                    // Spread the cost annually (simply divided by duration as requested)
                    totalEducationExpenses += (futureTotalCost / duration);
                }
            }
        });

        const totalOutflow = annualOutflow + totalEducationExpenses;
        const surplusBeforeSaving = annualInflow - totalOutflow;
        const savingsAndInvestments = savingsMonthly * 12; // Flat as per current understanding
        const netInvestibleSurplus = surplusBeforeSaving - savingsAndInvestments;

        projections.push({
            year,
            annualInflow,
            annualOutflow,
            educationExpenses: totalEducationExpenses,
            totalOutflow,
            surplusBeforeSaving,
            savingsAndInvestments,
            netInvestibleSurplus
        });
    }

    return projections;
};
