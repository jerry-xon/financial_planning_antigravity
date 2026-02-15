import { describe, it, expect } from 'vitest';
import { calculateCashFlow } from './CashFlowLogic';

describe('CashFlowLogic', () => {
    it('calculates total income and categorized expenses correctly', () => {
        const income = { family: 100000, bonus: 20000 };
        const expenseCategories = {
            household: { grocery: 30000, rent: 10000 },
            emi: { homeLoan: 20000 },
            savings: { rd: 5000 }
        };

        const results = calculateCashFlow(income, expenseCategories);

        expect(results.totalIncome).toBe(120000);
        expect(results.totalExpenses).toBe(60000); // 30k+10k+20k (Savings 5k excluded)
        expect(results.totalSavings).toBe(5000);
        expect(results.surplus).toBe(60000); // 120k - 60k
        expect(results.disposableIncome).toBe(55000); // 60k - 5k
        expect(results.surplusRate).toBe(50);
        expect(results.disposableIncomeRate).toBeCloseTo(45.83, 2);
        expect(results.householdRatio).toBeCloseTo(33.33, 2);
        expect(results.emiRatio).toBeCloseTo(16.67, 2);
        expect(results.savingsRatio).toBeCloseTo(4.17, 2);
    });

    it('identifies healthy vs critical financial state', () => {
        const healthyIncome = { family: 100000 };
        const healthyExpenses = { household: { grocery: 20000 } }; // 80% savings

        const criticalIncome = { family: 50000 };
        const criticalExpenses = { emi: { homeLoan: 60000 } }; // -20% savings

        expect(calculateCashFlow(healthyIncome, healthyExpenses).isHealthy).toBe(true);
        expect(calculateCashFlow(criticalIncome, criticalExpenses).isCritical).toBe(true);
    });

    it('formats expense breakdown labels with categories', () => {
        const income = { family: 100000 };
        const expenses = {
            household: { grocery: 30000 },
            emi: { homeLoan: 20000 }
        };

        const results = calculateCashFlow(income, expenses);

        expect(results.expenseBreakdown).toContainEqual(expect.objectContaining({
            name: 'Household (Grocery, LPG, Fuel etc.)',
            category: 'Household & Lifestyle'
        }));
        expect(results.expenseBreakdown).toContainEqual(expect.objectContaining({
            name: 'Home Loan',
            category: 'EMIs & Insurance'
        }));
    });
});
