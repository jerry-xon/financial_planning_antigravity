import { describe, it, expect } from 'vitest';
import { calculateContingencyFund } from './ContingencyLogic';

describe('ContingencyLogic', () => {
    const mockExpenseCategories = {
        household: { grocery: 20000, rent: 10000 },
        emi: { personalLoan: 5000, healthInsurance: 2000 },
        savings: { rd: 5000 }
    };

    it('calculates ideal emergency buffer correctly (6 months of Exp + EMIs)', () => {
        // Total = 37,000. Buffer = 37,000 * 6 = 222,000.
        const results = calculateContingencyFund(mockExpenseCategories, 0);
        expect(results.monthlyTotal).toBe(37000);
        expect(results.idealFundsRequired).toBe(222000);
    });

    it('identifies shortfall correctly and provides appropriate suggestion', () => {
        const results = calculateContingencyFund(mockExpenseCategories, 100000);
        expect(results.netShortfall).toBe(122000);
        expect(results.isHealthy).toBe(false);
        expect(results.suggestion).toContain('shortfall');
    });

    it('identifies healthy surplus and suggests investment', () => {
        const results = calculateContingencyFund(mockExpenseCategories, 300000);
        expect(results.isHealthy).toBe(true);
        expect(results.suggestion).toContain('Mutual Funds');
    });
});
