import { describe, it, expect } from 'vitest';
import { calculateNetWorth } from './AssetLogic';

describe('AssetLogic', () => {
    it('calculates Net Worth correctly', () => {
        const assetCategories = {
            equity: { stocks: 100000, mfEquity: 50000 },
            debt: { ppf: 50000 },
            realEstate: { residence: 5000000 },
            others: { gold: 200000 }
        };
        const liabilityCategories = {
            loans: { home: 1000000, car: 200000 }
        };

        const results = calculateNetWorth(assetCategories, liabilityCategories);

        expect(results.totalAssets).toBe(5400000);
        expect(results.totalLiabilities).toBe(1200000);
        expect(results.netWorth).toBe(4200000);
    });

    it('calculates asset allocation percentages correctly', () => {
        const assetCategories = {
            equity: { stocks: 30000 },
            debt: { fd: 70000 }
        };
        const liabilityCategories = { loans: {} };

        const results = calculateNetWorth(assetCategories, liabilityCategories);

        expect(results.allocation).toContainEqual({ name: 'Equity Assets', value: 30000, percentage: 30 });
        expect(results.allocation).toContainEqual({ name: 'Fixed Income / Debt', value: 70000, percentage: 70 });
    });
});
