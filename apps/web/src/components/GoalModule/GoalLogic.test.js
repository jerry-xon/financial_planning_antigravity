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

    it('generates predefined goals including slots for children in correct sequence', () => {
        const familyMembers = [
            { name: 'Self', relation: 'Self' },
            { name: 'Aarav', relation: 'Child' }
        ];
        const goals = getPredefinedGoals(familyMembers);

        // Check sequence
        expect(goals[0].name).toBe('Higher Education - Aarav');
        expect(goals[1].name).toBe('Constructing new house');
        expect(goals[2].name).toBe('Buying a Flat');
        expect(goals[3].name).toBe('House Renovation');
        expect(goals[4].name).toBe('Marriage - Aarav');
        expect(goals[5].name).toBe('Buying Car');
        expect(goals[6].name).toBe('Buying Bike');
        expect(goals[7].name).toBe('Domestic Tour');
        expect(goals[8].name).toBe('Foreign Tour');
        expect(goals[9].name).toBe('Retirement Corpus');

        expect(goals.some(g => g.id === 'retirement')).toBe(true);
    });

    it('returns only predefined goals when no custom goals are added and no padding', () => {
        const familyMembers = [{ name: 'Self', relation: 'Self' }];
        const goals = getPredefinedGoals(familyMembers);
        // 8 goals if no children (Higher Education and Marriage are per-child)
        // Let's count them:
        // 1. Construction
        // 2. Flat
        // 3. Renovation
        // 4. Car
        // 5. Bike
        // 6. Domestic
        // 7. Foreign
        // 8. Retirement
        expect(goals).toHaveLength(8); 
    });
});
