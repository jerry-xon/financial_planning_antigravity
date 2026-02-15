import { describe, it, expect } from 'vitest';
import { calculateYearlyInsuranceSummary, calculatePolicyEndDate, getInsuredNamesList } from './InsuranceLogic';

describe('InsuranceLogic', () => {
    const mockPolicies = [
        {
            id: 'p1',
            insuredName: 'Amit',
            planName: 'Term Plan 1',
            startDate: '2020-01-01',
            premium: '1000',
            frequency: 'Annually',
            paymentTerm: '10',
            policyTerm: '20',
            sumAssured: '500000',
            maturityAmount: '0'
        },
        {
            id: 'p2',
            insuredName: 'Neha',
            planName: 'Saving Plan 2',
            startDate: '2022-01-01',
            premium: '500',
            frequency: 'Monthly',
            paymentTerm: '5',
            policyTerm: '10',
            sumAssured: '200000',
            maturityAmount: '300000'
        }
    ];

    it('calculates yearly summary with policy-wise breakdowns', () => {
        const results = calculateYearlyInsuranceSummary(mockPolicies);

        // Year 2020
        const year2020 = results.find(r => r.year === 2020);
        expect(year2020.totalPremium).toBe(1000);
        expect(year2020.policyPremiums['p1']).toBe(1000);
        expect(year2020.coverage['Amit']).toBe(500000);

        // Year 2022 (Both policies active for premium)
        const year2022 = results.find(r => r.year === 2022);
        expect(year2022.totalPremium).toBe(1000 + (500 * 12));
        expect(year2022.policyPremiums['p1']).toBe(1000);
        expect(year2022.policyPremiums['p2']).toBe(6000);
        expect(year2022.coverage['Amit']).toBe(500000);
        expect(year2022.coverage['Neha']).toBe(200000);
    });

    it('calculates policy end date correctly', () => {
        expect(calculatePolicyEndDate('2020-01-01', '20')).toBe('2040-01-01');
        expect(calculatePolicyEndDate('2022-05-15', '5')).toBe('2027-05-15');
    });

    it('handles maturity schedule', () => {
        const results = calculateYearlyInsuranceSummary(mockPolicies);
        const maturityYear = 2022 + 10;
        const year2032 = results.find(r => r.year === maturityYear);
        expect(year2032.maturities).toHaveLength(1);
        expect(year2032.maturities[0].amount).toBe(300000);
        expect(year2032.maturities[0].insuredName).toBe('Neha');
    });

    it('extracts unique insured names', () => {
        const names = getInsuredNamesList(mockPolicies);
        expect(names).toContain('Amit');
        expect(names).toContain('Neha');
        expect(names).toHaveLength(2);
    });
});
