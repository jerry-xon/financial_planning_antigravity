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
    const goals = [
        { id: 'tour', name: 'Foreign/Domestic Tour', isPredefined: true },
        { id: 'renovation', name: 'House Renovation', isPredefined: true },
        { id: 'vehicle', name: 'Buying Bike/Car', isPredefined: true },
    ];

    // Add Child Education and Marriage based on family members
    // Filtering for children specifically
    const children = familyMembers.filter(m => m.relation === 'Child');

    children.forEach((child, index) => {
        const childName = child.name || `Child ${index + 1}`;
        
        // Only add Higher Education goal if child is not currently in College
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

        goals.push({
            id: `marriage_${index}`,
            name: `Marriage - ${childName}`,
            isPredefined: true
        });
    });

    goals.push({ id: 'retirement', name: 'Retirement Corpus', isPredefined: true });

    // Custom slots to reach exactly 11 or more if children count is high
    // The user wants a specific list of 11 goals.
    const currentCount = goals.length;
    const customNeeded = Math.max(0, 11 - currentCount);

    for (let i = 1; i <= customNeeded; i++) {
        goals.push({ id: `custom_${i}`, name: '', isPredefined: false, placeholder: `Any other goal` });
    }

    return goals;
};
