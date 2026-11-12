// apps/web/src/components/GoalModule/GoalLogic.js
var calculateFutureCost = (presentValue, years, inflationRate) => {
  const pv = parseFloat(presentValue) || 0;
  const n = parseFloat(years) || 0;
  const i = (parseFloat(inflationRate) || 0) / 100;
  const futureCost = pv * Math.pow(1 + i, n);
  return Math.round(futureCost);
};
var categorizeGoals = (goals) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const categorized = {
    short: [],
    medium: [],
    long: []
  };
  goals.forEach((goal) => {
    const years = parseFloat(goal.yearsToGoal) || 0;
    const targetYear = currentYear + Math.round(years);
    const inflation = parseFloat(goal.inflationRate) || 8;
    let futureCost = calculateFutureCost(goal.presentValue, years, goal.inflationRate);
    let presentValue = goal.presentValue;
    if (goal.futureValue) {
      futureCost = Math.round(parseFloat(goal.futureValue));
      if (!presentValue || parseFloat(presentValue) === 0) {
        presentValue = Math.round(futureCost / Math.pow(1 + inflation / 100, years));
      }
    }
    const goalData = {
      ...goal,
      targetYear,
      presentValue,
      futureCost
    };
    if (years <= 3) categorized.short.push(goalData);
    else if (years <= 7) categorized.medium.push(goalData);
    else categorized.long.push(goalData);
  });
  return categorized;
};
var getPredefinedGoals = (familyMembers) => {
  const children = familyMembers.filter((m) => m.relation === "Child");
  const goals = [];
  children.forEach((child, index) => {
    const childName = child.name || `Child ${index + 1}`;
    if (child.occupation !== "College") {
      goals.push({
        id: `edu_${index}`,
        name: `Higher Education - ${childName}`,
        isPredefined: true,
        profession: "",
        courseDuration: "",
        totalCourseCost: "",
        yearsToGoal: "",
        presentValue: "",
        inflationRate: 8
        // Default for education
      });
    }
  });
  goals.push({ id: "construction", name: "Constructing new house", isPredefined: true });
  goals.push({ id: "flat", name: "Buying a Flat", isPredefined: true });
  goals.push({ id: "renovation", name: "House Renovation", isPredefined: true });
  children.forEach((child, index) => {
    const childName = child.name || `Child ${index + 1}`;
    goals.push({
      id: `marriage_${index}`,
      name: `Marriage - ${childName}`,
      isPredefined: true
    });
  });
  goals.push({ id: "car", name: "Buying Car", isPredefined: true });
  goals.push({ id: "bike", name: "Buying Bike", isPredefined: true });
  goals.push({ id: "domestic_tour", name: "Domestic Tour", isPredefined: true });
  goals.push({ id: "foreign_tour", name: "Foreign Tour", isPredefined: true });
  goals.push({ id: "retirement", name: "Retirement Corpus", isPredefined: true });
  return goals;
};
export {
  calculateFutureCost,
  categorizeGoals,
  getPredefinedGoals
};
