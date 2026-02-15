import { describe, it, expect } from 'vitest';
import { calculateFutureCost, categorizeGoals, getPredefinedGoals } from './GoalLogic';

describe('GoalLogic', () => {
    it('calculates future cost correctly with inflation', () => {
        // FV = 1000 * (1.06)^10 = 1790.8...
        const futureCost = calculateFutureCost(1000, 10, 6);
        expect(futureCost).toBe(1791);
    });

    it('categorizes goals into short, medium, and long terms', () => {
        const goals = [
            { id: '1', name: 'Short', yearsToGoal: 2, presentValue: 1000, inflationRate: 6 },
            { id: '2', name: 'Medium', yearsToGoal: 5, presentValue: 1000, inflationRate: 6 },
            { id: '3', name: 'Long', yearsToGoal: 10, presentValue: 1000, inflationRate: 6 }
        ];

        const categorized = categorizeGoals(goals);
        expect(categorized.short).toHaveLength(1);
        expect(categorized.medium).toHaveLength(1);
        expect(categorized.long).toHaveLength(1);
    });

    it('generates predefined goals including slots for children and maintains at least 11 goals', () => {
        const familyMembers = [
            { name: 'Self', relation: 'Self' },
            { name: 'Aarav', relation: 'Child' }
        ];
        const goals = getPredefinedGoals(familyMembers);

        expect(goals.some(g => g.name === 'Higher Education - Aarav')).toBe(true);
        expect(goals.some(g => g.name === 'Marriage - Aarav')).toBe(true);
        expect(goals.some(g => g.name === 'Retirement Corpus')).toBe(true);

        // Assert at least 11 goals
        expect(goals.length).toBeGreaterThanOrEqual(11);
    });

    it('maintains exactly 11 goals when no children are present', () => {
        const familyMembers = [{ name: 'Self', relation: 'Self' }];
        const goals = getPredefinedGoals(familyMembers);
        expect(goals).toHaveLength(11);
    });
});
