import { calculateIncomeTax } from '../IncomeTaxModule/IncomeTaxLogic';

export const EDUCATION_STANDARDS = [
    "Play Group",
    "Nursery",
    "LKG",
    "UKG",
    "1st Standard",
    "2nd Standard",
    "3rd Standard",
    "4th Standard",
    "5th Standard",
    "6th Standard",
    "7th Standard",
    "8th Standard",
    "9th Standard",
    "10th Standard",
    "11th Standard",
    "12th Standard"
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
    const selfMember = familyMembers.find(m => m.relation?.toLowerCase() === 'self');
    const spouseMember = familyMembers.find(m => m.relation?.toLowerCase() === 'spouse');
    
    if (!selfMember) return [];
    
    const birthYear = selfMember.dob ? new Date(selfMember.dob).getFullYear() : (startYear - (selfMember.age || 30));
    const retirementYear = birthYear + (parseInt(selfMember.retirementAge) || 60);
    
    const yearsToProject = retirementYear - startYear + 1;
    if (yearsToProject <= 0) return [];

    // 2. Initial Annual Figures (Per Person)
    const selfAnnualBase = (
        (parseFloat(income.self) || 0) + 
        (parseFloat(income.selfBonus) || 0) + 
        (parseFloat(income.selfPassive) || 0) + 
        (parseFloat(income.selfOther) || 0)
    ) * 12;

    const spouseAnnualBase = (
        (parseFloat(income.spouse) || 0) + 
        (parseFloat(income.spouseBonus) || 0) + 
        (parseFloat(income.spousePassive) || 0) + 
        (parseFloat(income.spouseOther) || 0)
    ) * 12;

    const householdMonthly = Object.values(expenseCategories.household || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const emiMonthly = Object.values(expenseCategories.emi || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const savingsMonthly = Object.values(expenseCategories.savings || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const projections = [];

    for (let i = 0; i < yearsToProject; i++) {
        const year = startYear + i;
        
        // Income with Increment (Calculated separately for per-person tax)
        const selfInflated = selfAnnualBase * Math.pow(1 + (incomeIncrement / 100), i);
        const spouseInflated = spouseAnnualBase * Math.pow(1 + (incomeIncrement / 100), i);
        const annualInflow = selfInflated + spouseInflated;

        // --- NEW: Income Tax Calculation ---
        // We mock the monthly structure for calculateIncomeTax
        const selfTaxRes = calculateIncomeTax({ salary: selfInflated / 12, bonus: 0, passive: 0, other: 0 }, selfMember.occupation);
        
        let spouseTax = 0;
        if (spouseMember && spouseMember.occupation?.toLowerCase() !== 'housewife') {
            const spouseTaxRes = calculateIncomeTax({ salary: spouseInflated / 12, bonus: 0, passive: 0, other: 0 }, spouseMember.occupation);
            spouseTax = spouseTaxRes.finalTax;
        }

        const approxTax = selfTaxRes.finalTax + spouseTax;
        const netInflowAfterTax = annualInflow - approxTax;

        // Outflows logic
        const householdOutflow = (householdMonthly * 12) * Math.pow(1 + (householdInflation / 100), i);
        const fixedOutflow = (emiMonthly * 12); 
        const annualOutflow = householdOutflow + fixedOutflow;
        
        let totalEducationExpenses = 0;
        
        // 1. School Education
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
                        if (!isPaid) totalEducationExpenses += annualCost;
                    } else if (i <= remainingTime) {
                        totalEducationExpenses += annualCost;
                    }
                }
            }
        });

        // 2. Higher Education
        goals.forEach(goal => {
            const isEducation = goal.name?.toLowerCase().includes('higher education');
            if (isEducation) {
                const yearsToGoal = parseFloat(goal.yearsToGoal) || 0;
                const duration = parseInt(goal.courseDuration) || 0;
                const totalCost = parseFloat(goal.totalCourseCost) || 0;
                const inflation = (parseFloat(goal.inflationRate) || educationInflation) / 100;
                
                const goalStartYear = startYear + Math.round(yearsToGoal);
                if (year >= goalStartYear && year < goalStartYear + duration) {
                    const futureTotalCost = totalCost * Math.pow(1 + inflation, yearsToGoal);
                    totalEducationExpenses += (futureTotalCost / duration);
                }
            }
        });

        const totalOutflow = annualOutflow + totalEducationExpenses;
        const surplusBeforeSaving = netInflowAfterTax - totalOutflow;
        const savingsAndInvestments = savingsMonthly * 12; 
        const netInvestibleSurplus = surplusBeforeSaving - savingsAndInvestments;

        projections.push({
            year,
            annualInflow,
            approxTax,
            netInflowAfterTax,
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
