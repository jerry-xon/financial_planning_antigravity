import { describe, it, expect } from 'vitest';
import { calculateNetWorth } from './AssetLogic';

describe('AssetLogic', () => {
    it('calculates Net Worth correctly', () => {
        const assetCategories = {
            investments: { equity: 100000, mutualFunds: 50000 },
            retirement: { ppf: 50000 },
            realEstate: { residential: 5000000 },
            valuables: { gold: 200000 }
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
            investments: { equity: 30000, fixedDeposit: 70000 }
        };
        const liabilityCategories = { loans: {} };

        const results = calculateNetWorth(assetCategories, liabilityCategories);

        // All fields are in 'investments' category now, so one slice in allocation
        expect(results.allocation).toContainEqual({ name: 'Investments', value: 100000, percentage: 100 });
    });
});
