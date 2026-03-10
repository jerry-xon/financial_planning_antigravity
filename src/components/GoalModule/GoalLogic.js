export const calculateFutureCost = (presentValue, years, inflationRate) => {
    const pv = parseFloat(presentValue) || 0;
    const n = parseFloat(years) || 0;
    const i = (parseFloat(inflationRate) || 0) / 100;

    const futureCost = pv * Math.pow(1 + i, n);
    return Math.round(futureCost);
};

export const categorizeGoals = (goals) => {
    const currentYear = new Date().getFullYear();

    const categorized = {
        short: [],
        medium: [],
        long: []
    };

    goals.forEach(goal => {
        const years = parseFloat(goal.yearsToGoal) || 0;
        const targetYear = currentYear + Math.round(years);
        const futureCost = calculateFutureCost(goal.presentValue, years, goal.inflationRate);

        const goalData = {
            ...goal,
            targetYear,
            futureCost
        };

        if (years <= 3) categorized.short.push(goalData);
        else if (years <= 7) categorized.medium.push(goalData);
        else categorized.long.push(goalData);
    });

    return categorized;
};

export const getPredefinedGoals = (familyMembers) => {
    const children = familyMembers.filter(m => m.relation === 'Child');
    const goals = [];

    // 1. Higher Education - [Child Name]
    children.forEach((child, index) => {
        const childName = child.name || `Child ${index + 1}`;
        if (child.occupation !== 'College') {
            goals.push({
                id: `edu_${index}`,
                name: `Higher Education - ${childName}`,
                isPredefined: true,
                profession: '',
                courseDuration: '',
                totalCourseCost: '',
                yearsToGoal: '',
                presentValue: '',
                inflationRate: 8 // Default for education
            });
        }
    });

    // 2. Constructing new house
    goals.push({ id: 'construction', name: 'Constructing new house', isPredefined: true });

    // 3. Buying a Flat
    goals.push({ id: 'flat', name: 'Buying a Flat', isPredefined: true });

    // 4. House Renovation
    goals.push({ id: 'renovation', name: 'House Renovation', isPredefined: true });

    // 5. Marriage - [Child Name]
    children.forEach((child, index) => {
        const childName = child.name || `Child ${index + 1}`;
        goals.push({
            id: `marriage_${index}`,
            name: `Marriage - ${childName}`,
            isPredefined: true
        });
    });

    // 6. Buying Car
    goals.push({ id: 'car', name: 'Buying Car', isPredefined: true });

    // 7. Buying Bike
    goals.push({ id: 'bike', name: 'Buying Bike', isPredefined: true });

    // 8. Domestic Tour
    goals.push({ id: 'domestic_tour', name: 'Domestic Tour', isPredefined: true });

    // 9. Foreign Tour
    goals.push({ id: 'foreign_tour', name: 'Foreign Tour', isPredefined: true });

    // 10. Retirement Corpus
    goals.push({ id: 'retirement', name: 'Retirement Corpus', isPredefined: true });

    return goals;
};
