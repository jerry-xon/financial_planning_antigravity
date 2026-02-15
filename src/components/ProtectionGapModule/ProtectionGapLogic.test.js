import { describe, it, expect } from 'vitest';
import { calculateProtectionGap } from './ProtectionGapLogic';

describe('ProtectionGapLogic', () => {
    const mockExpenseCategories = {
        household: { grocery: 20000, rent: 10000 },
        emi: { personalLoan: 5000, healthInsurance: 2000 },
        savings: { rd: 5000 }
    };

    const mockFamilyMembers = [
        { name: 'John', relation: 'Self' },
        { name: 'Jane', relation: 'Spouse' },
        { name: 'Aarav', relation: 'Child' }
    ];

    const mockPolicies = [
        { insuredName: 'John', sumAssured: 1000000 },
        { insuredName: 'Jane', sumAssured: 500000 },
        { insuredName: 'Aarav', sumAssured: 200000 } // Should be ignored in gap calculations
    ];

    it('calculates protection need correctly (Multiplier 200 of Exp + EMIs)', () => {
        // Household = 30000, EMI = 7000. Total = 37000.
        // Need = 37000 * 200 = 7,400,000
        const results = calculateProtectionGap(mockExpenseCategories, mockPolicies, mockFamilyMembers);
        expect(results.monthlyExpenditure).toBe(37000);
        expect(results.protectionNeed).toBe(7400000);
    });

    it('calculates separate gaps for Self and Spouse and excludes Children', () => {
        const results = calculateProtectionGap(mockExpenseCategories, mockPolicies, mockFamilyMembers);

        // Self (John): Need 7.4M, Coverage 1M, Gap 6.4M
        expect(results.self.name).toBe('John');
        expect(results.self.coverage).toBe(1000000);
        expect(results.self.gap).toBe(6400000);
        expect(results.self.isGap).toBe(true);

        // Spouse (Jane): Need 7.4M, Coverage 0.5M, Gap 6.9M
        expect(results.spouse.name).toBe('Jane');
        expect(results.spouse.coverage).toBe(500000);
        expect(results.spouse.gap).toBe(6900000);
        expect(results.spouse.isGap).toBe(true);
    });

    it('handles cases where Spouse is not present', () => {
        const singleFamily = [{ name: 'John', relation: 'Self' }];
        const results = calculateProtectionGap(mockExpenseCategories, mockPolicies, singleFamily);

        expect(results.self.name).toBe('John');
        expect(results.spouse).toBe(null);
    });
});
