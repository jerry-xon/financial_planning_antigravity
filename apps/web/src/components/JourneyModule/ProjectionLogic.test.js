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
        income: { self: 100000 },
        expenseCategories: {
            household: { rent: 20000, education: 5000 },
            insurance: {
                life: { 'Self': { value: 1000, frequency: 'Monthly' } }
            },
            emi: { car: 10000 },
            savings: { sip: 10000 }
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
        expect(projections[projections.length - 1].year).toBe(2056);
    });

    it('calculates first year impact correctly for Monthly frequency starting in Dec', () => {
        const params = {
            ...mockParams,
            expenseCategories: { ...mockParams.expenseCategories, insurance: { life: {} } },
            investmentAllocations: [
                {
                    type: 'Life Insurance',
                    amount: 10000, // Monthly premium
                    startMonth: 12,
                    startYear: 2026,
                    duration: 1,
                    frequency: 'Monthly'
                }
            ]
        };
        const results = generateProjections(params);
        expect(results[0].insurancePremium).toBe(10000);
    });

    it('calculates first year impact correctly for Annual frequency starting in Dec', () => {
        const params = {
            ...mockParams,
            expenseCategories: { ...mockParams.expenseCategories, insurance: { life: {} } },
            investmentAllocations: [
                {
                    type: 'Life Insurance',
                    amount: 120000, // Annual premium
                    startMonth: 12,
                    startYear: 2026,
                    duration: 1,
                    frequency: 'Annual'
                }
            ]
        };
        const results = generateProjections(params);
        expect(results[0].insurancePremium).toBe(120000);
    });

    it('includes future life insurance allocations in savingsAndInvestments', () => {
        const params = {
            ...mockParams,
            investmentAllocations: [
                {
                    type: 'Life Insurance',
                    amount: 10000,
                    startMonth: 1,
                    startYear: 2026,
                    duration: 10,
                    frequency: 'Monthly'
                }
            ]
        };
        const results = generateProjections(params);
        // 12k base + 120k future (12 months * 10k) = 132k
        expect(results[0].insurancePremium).toBe(132000);
        // 120k savings (10k sip * 12) + 132k insurance = 252k
        expect(results[0].savingsAndInvestments).toBe(252000);
        // Total outflow no longer involves insurance premium.
        // household 20k*12 = 240k, emi 10k*12 = 120k, education 50k = 410k. total = 410k.
        expect(results[0].totalOutflow).toBe(410000);
    });
});
