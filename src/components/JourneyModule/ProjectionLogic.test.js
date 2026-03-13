import { describe, it, expect } from 'vitest';
import { generateProjections, EDUCATION_STANDARDS } from './ProjectionLogic';

describe('ProjectionLogic', () => {
    const mockParams = {
        familyMembers: [
            { relation: 'Self', age: 30, retirementAge: 60, dob: '1996-01-01' },
            { 
                relation: 'Child', 
                name: 'Junior', 
                standard: '5th standard', 
                annualSchoolFee: 50000 
            }
        ],
        income: { self: 100000 }, // 12L per year
        expenseCategories: {
            household: { rent: 20000, education: 5000 }, // 2.4L per year (excluding education)
            insurance: {
                life: { 'Self': { value: 1000, frequency: 'Monthly' } } // 12k per year
            },
            emi: { car: 10000 }, // 1.2L per year
            savings: { sip: 10000 } // 1.2L per year
        },
        goals: [],
        inflationRates: {
            incomeIncrement: 10,
            householdInflation: 5,
            educationInflation: 8
        },
        startYear: 2026
    };

    it('calculates the correct retirement year for Self', () => {
        const projections = generateProjections(mockParams);
        // Birth 1996 + 60 = 2056
        expect(projections[projections.length - 1].year).toBe(2056);
        expect(projections.length).toBe(31); // 2026 to 2056 inclusive
    });

    it('applies income increments correctly', () => {
        const projections = generateProjections(mockParams);
        const year1Inflow = projections[0].annualInflow;
        const year2Inflow = projections[1].annualInflow;
        
        expect(year1Inflow).toBe(1200000);
        expect(year2Inflow).toBe(1320000); // 10% increase
    });

    it('compounds household inflation and keeps EMI flat', () => {
        const projections = generateProjections(mockParams);
        // Year 1: (20k rent (education ignored)) * 12 = 2.4L
        // EMI: 10k * 12 = 1.2L
        expect(projections[0].householdOutflow).toBe(240000);
        expect(projections[0].emiOutflow).toBe(120000);
        
        // Year 2: (2.4L * 1.05) = 2.52L
        expect(projections[1].householdOutflow).toBe(252000);
    });

    it('progresses education fees and stops after 12th standard', () => {
        const projections = generateProjections(mockParams);
        // Junior is in 5th standard.
        // Index of 5th is 7 (0: Play, 1: LKG, 2: UKG, 3: 1st, 4: 2nd, 5: 3rd, 6: 4th, 7: 5th)
        // Progression: 5th (2026), 6th (2027), ..., 12th (2033)
        // Standard count to finish: 15 - 7 = 8 years of school left.
        
        expect(projections[0].educationExpenses).toBe(50000);
        expect(projections[7].educationExpenses).toBeGreaterThan(0); // 12th standard year
        expect(projections[8].educationExpenses).toBe(0); // Finished school
    });

    it('calculates net investible surplus correctly', () => {
        const projections = generateProjections(mockParams);
        const p = projections[0];
        // Inflow: 12L
        // Household Outflow: 2.4L (rent)
        // EMI: 1.2L
        // Edu (from child details): 50k
        // Insurance: 0 (not in mock)
        // Total Outflow: 2.4 + 1.2 + 0.05 = 3.65L
        
        // Income Tax (mocked in ProjectionLogic calls actual logic)
        // For 12L salary: Approx tax needs calculation. 
        // We'll calculate it relative to what the code returns.
        const surplusBeforeSaving = p.netInflowAfterTax - p.totalOutflow;
        expect(p.surplusBeforeSaving).toBeCloseTo(surplusBeforeSaving, 1);
        
        const netInvestibleSurplus = p.surplusBeforeSaving - p.savingsAndInvestments;
        expect(p.netInvestibleSurplus).toBeCloseTo(netInvestibleSurplus, 1);
    });
});
