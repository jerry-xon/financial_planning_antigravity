import { describe, it, expect } from 'vitest';
import { calculateAge, calculateProfile } from './ProfileLogic';

describe('ProfileLogic', () => {
    it('calculates age correctly from DOB', () => {
        const dob = '1990-01-01';
        const age = calculateAge(dob);
        const expectedAge = new Date().getFullYear() - 1990;
        // Account for current date in case birthday hasn't happened yet this year
        expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
        expect(age).toBeLessThanOrEqual(expectedAge);
    });

    it('calculates retirement year and window correctly', () => {
        const member = {
            dob: '1990-01-01',
            retirementAge: 60,
            relation: 'Self'
        };
        const results = calculateProfile(member);
        const age = calculateAge(member.dob);
        expect(results.yearsToRetire).toBe(60 - age);
        expect(results.retirementYear).toBe(new Date().getFullYear() + (60 - age));
    });

    it('identifies life stage correctly', () => {
        const youngMember = { dob: '2005-01-01', retirementAge: 60 };
        const middleMember = { dob: '1995-01-01', retirementAge: 65 };

        expect(calculateProfile(youngMember).lifeStage).toBe('Early Career / Foundation');
        expect(calculateProfile(middleMember).lifeStage).toBe('Wealth Accumulation / Family Building');
    });
});
