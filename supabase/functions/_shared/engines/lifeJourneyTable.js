// apps/web/src/components/CashFlowModule/CashFlowLogic.js
var formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

// apps/web/src/components/GoalModule/GoalLogic.js
var calculateFutureCost = (presentValue, years, inflationRate) => {
  const pv = parseFloat(presentValue) || 0;
  const n = parseFloat(years) || 0;
  const i = (parseFloat(inflationRate) || 0) / 100;
  const futureCost = pv * Math.pow(1 + i, n);
  return Math.round(futureCost);
};

// apps/web/src/components/DetailedReport/allocationEngine/lifeStageEngine.js
var LIFE_STAGE_IDS = {
  YOUNG_SINGLE: "young_single",
  CAREER_BUILDING: "career_building",
  EARLY_FAMILY: "early_family",
  GROWING_FAMILY: "growing_family",
  PEAK_EARNER: "peak_earner",
  PRE_RETIREMENT: "pre_retirement",
  WISDOM_YEARS: "wisdom_years"
};
var LIFE_STAGE_LABELS = {
  [LIFE_STAGE_IDS.YOUNG_SINGLE]: "Early Career / Foundation",
  [LIFE_STAGE_IDS.CAREER_BUILDING]: "Wealth Accumulation / Family Building",
  [LIFE_STAGE_IDS.EARLY_FAMILY]: "Wealth Accumulation / Family Building",
  [LIFE_STAGE_IDS.GROWING_FAMILY]: "Wealth Accumulation / Family Building",
  [LIFE_STAGE_IDS.PEAK_EARNER]: "Peak Earnings / Maturity",
  [LIFE_STAGE_IDS.PRE_RETIREMENT]: "Transition to Wisdom Years",
  [LIFE_STAGE_IDS.WISDOM_YEARS]: "Transition to Wisdom Years"
};

// apps/web/src/components/ProfileModule/ProfileLogic.js
var calculateAge = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = /* @__PURE__ */ new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) {
    age--;
  }
  return age;
};
var calculateRetirementYear = (dob, retirementAge) => {
  if (!dob || !retirementAge) return "";
  const birthDate = new Date(dob);
  const birthYear = birthDate.getFullYear();
  return birthYear + parseInt(retirementAge);
};

// apps/web/src/components/DetailedFlow/goalsDetailSync.js
function isConfiguredGoal(goal) {
  return Boolean(goal?.yearsToGoal && goal?.presentValue);
}
function getActiveGoals(goals = []) {
  return goals.filter(isConfiguredGoal);
}

// apps/web/src/components/DetailedReport/lifeJourneyTableLogic.js
var JOURNEY_TABLE_ROWS = [
  { key: "annualInflow", label: "Annual Inflows", sign: "(+)", role: "detail" },
  { key: "approxTax", label: "Tax Adjustment", sign: "(\xB1)", role: "detail", highlightNonZero: true },
  { key: "netInflowAfterTax", label: "Net Inflow (After Tax)", sign: "(=)", role: "subtotal" },
  { key: "totalOutflow", label: "Total Outflow", sign: "(\u2212)", role: "detail", breakdown: "outflow" },
  { key: "surplusBeforeSaving", label: "Surplus (Pre-Saving)", sign: "(=)", role: "subtotal" },
  { key: "savingsAndInvestments", label: "Savings & Investments", sign: "(\u2212)", role: "detail", breakdown: "savings" },
  { key: "netInvestibleSurplus", label: "Net Investible Surplus", sign: "(=)", role: "result" }
];
var formatInsightCurrency = (value) => formatCurrency(Math.round(value || 0));
function getGoalTargetYear(goal, currentYear = (/* @__PURE__ */ new Date()).getFullYear()) {
  const years = parseFloat(goal?.yearsToGoal);
  if (!years || years <= 0) return null;
  return currentYear + Math.round(years);
}
function mapGoalsByYear(goals = [], currentYear = (/* @__PURE__ */ new Date()).getFullYear()) {
  const byYear = {};
  goals.forEach((goal) => {
    const targetYear = getGoalTargetYear(goal, currentYear);
    if (!targetYear) return;
    const futureCost = goal.totalCourseCost ? Math.round(parseFloat(goal.totalCourseCost) || 0) : calculateFutureCost(goal.presentValue, goal.yearsToGoal, goal.inflationRate);
    if (!byYear[targetYear]) byYear[targetYear] = [];
    byYear[targetYear].push({
      id: goal.id,
      name: goal.name,
      targetYear,
      futureCost
    });
  });
  return byYear;
}
function buildLifeJourneyReport({
  familyMembers = [],
  journeyProjections = [],
  goals = [],
  inflationRates = {}
}) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const selfMember = familyMembers.find((m) => m.relation?.toLowerCase() === "self");
  if (!selfMember?.dob) {
    return {
      meta: { hasProfile: false, currentYear },
      hero: null,
      projections: [],
      years: [],
      goalsByYear: {}
    };
  }
  const currentAge = calculateAge(selfMember.dob);
  const birthYear = new Date(selfMember.dob).getFullYear();
  const retirementAge = parseInt(selfMember.retirementAge, 10) || 60;
  const retirementYear = calculateRetirementYear(selfMember.dob, retirementAge);
  const yearsToGoldenPeriod = Math.max(0, retirementAge - currentAge);
  const projections = journeyProjections.filter(
    (p) => p.year > currentYear && retirementYear && p.year <= retirementYear
  );
  const goalsByYear = mapGoalsByYear(getActiveGoals(goals), currentYear);
  const latestGoalYear = Object.keys(goalsByYear).reduce(
    (max, year) => Math.max(max, parseInt(year, 10) || 0),
    0
  );
  const constellationEndYear = Math.max(retirementYear || 0, latestGoalYear);
  return {
    meta: {
      hasProfile: true,
      currentYear,
      retirementYear,
      constellationEndYear: constellationEndYear || retirementYear,
      inflationRates
    },
    hero: {
      currentAge,
      birthYear,
      retirementAge,
      yearsToGoldenPeriod,
      retirementYear
    },
    projections,
    years: projections.map((p) => p.year),
    goalsByYear
  };
}
function computeLifeJourneyInsights(report) {
  const { meta, projections, goalsByYear } = report;
  const insights = [];
  if (!meta.hasProfile) {
    insights.push({
      id: "no-profile",
      text: "Complete your profile to see your life journey projection.",
      tone: "warning"
    });
    return insights;
  }
  if (!projections.length) {
    insights.push({
      id: "no-projections",
      text: "Unable to build yearly projections \u2014 check your retirement age and profile details.",
      tone: "warning"
    });
    return insights;
  }
  const deficitYears = projections.filter(
    (p) => p.yearHasDeficit || p.netInvestibleSurplus < 0
  );
  if (deficitYears.length > 0) {
    insights.push({
      id: "deficit-years",
      text: `${deficitYears.length} year${deficitYears.length > 1 ? "s" : ""} show a negative investible surplus \u2014 review planned expenses in those years.`,
      tone: "warning"
    });
  } else {
    insights.push({
      id: "surplus-positive",
      text: "All projected years through retirement show a non-negative investible surplus.",
      tone: "positive"
    });
  }
  const peak = projections.reduce(
    (best, p) => p.netInvestibleSurplus > (best?.netInvestibleSurplus ?? -Infinity) ? p : best,
    null
  );
  if (peak && peak.netInvestibleSurplus > 0) {
    insights.push({
      id: "peak-surplus",
      text: `Peak investible surplus of ${formatInsightCurrency(peak.netInvestibleSurplus)} projected in ${peak.year}.`,
      tone: "positive"
    });
  }
  const nextFiveEnd = meta.currentYear + 5;
  let nearTermGoalCount = 0;
  Object.entries(goalsByYear).forEach(([year, yearGoals]) => {
    const y = parseInt(year, 10);
    if (y > meta.currentYear && y <= nextFiveEnd) {
      nearTermGoalCount += yearGoals.length;
    }
  });
  if (nearTermGoalCount > 0) {
    insights.push({
      id: "near-term-goals",
      text: `${nearTermGoalCount} life goal${nearTermGoalCount > 1 ? "s" : ""} planned in the next 5 years.`,
      tone: "accent"
    });
  }
  return insights;
}
export {
  JOURNEY_TABLE_ROWS,
  buildLifeJourneyReport,
  computeLifeJourneyInsights,
  getGoalTargetYear,
  mapGoalsByYear
};
