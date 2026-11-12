// apps/web/src/components/DetailedReport/allocationEngine/lifeStageEngine.js
var parseAmount = (value) => parseFloat(value) || 0;
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
function buildLifeStageContext({
  familyMembers = [],
  age,
  retirementAge,
  surplusRate,
  netWorth,
  emiRatio,
  hasStableIncome
} = {}) {
  const self = familyMembers.find((m) => String(m.relation || "").toLowerCase() === "self") || familyMembers[0] || {};
  const resolvedAge = Number.isFinite(age) ? age : parseAmount(self.age) || 0;
  const resolvedRetireAge = parseAmount(retirementAge) || parseAmount(self.retirementAge) || 60;
  const yearsToRetirement = Math.max(0, resolvedRetireAge - resolvedAge);
  const hasSpouse = familyMembers.some((m) => {
    const rel = String(m.relation || "").toLowerCase();
    return rel === "spouse" || rel === "wife" || rel === "husband";
  });
  const children = familyMembers.filter((m) => String(m.relation || "").toLowerCase() === "child");
  const childAges = children.map((c) => parseAmount(c.age)).filter((a) => a > 0);
  return {
    age: resolvedAge,
    retirementAge: resolvedRetireAge,
    yearsToRetirement,
    hasSpouse,
    childrenCount: children.length,
    childAges,
    youngestChildAge: childAges.length ? Math.min(...childAges) : null,
    surplusRate: parseAmount(surplusRate),
    netWorth: parseAmount(netWorth),
    emiRatio: parseAmount(emiRatio),
    hasStableIncome: hasStableIncome !== false
  };
}
function determineLifeStage(rawContext = {}) {
  const ctx = rawContext.age != null || rawContext.familyMembers ? rawContext.yearsToRetirement != null && rawContext.childrenCount != null ? rawContext : buildLifeStageContext(rawContext) : buildLifeStageContext(rawContext);
  const {
    age = 0,
    yearsToRetirement = 30,
    hasSpouse = false,
    childrenCount = 0,
    youngestChildAge = null,
    surplusRate = 0,
    netWorth = 0,
    emiRatio = 0,
    hasStableIncome = true
  } = ctx;
  let lifeStageId = LIFE_STAGE_IDS.YOUNG_SINGLE;
  if (yearsToRetirement <= 5 || age >= 60) {
    lifeStageId = LIFE_STAGE_IDS.WISDOM_YEARS;
  } else if (yearsToRetirement <= 12 || age >= 55) {
    lifeStageId = LIFE_STAGE_IDS.PRE_RETIREMENT;
  } else if (childrenCount >= 2 || childrenCount >= 1 && youngestChildAge != null && youngestChildAge < 12) {
    lifeStageId = LIFE_STAGE_IDS.GROWING_FAMILY;
  } else if (hasSpouse || childrenCount === 1) {
    lifeStageId = age < 40 ? LIFE_STAGE_IDS.EARLY_FAMILY : LIFE_STAGE_IDS.PEAK_EARNER;
  } else if (age >= 40 && age < 55) {
    lifeStageId = LIFE_STAGE_IDS.PEAK_EARNER;
  } else if (age >= 25 && age < 40) {
    lifeStageId = hasSpouse ? LIFE_STAGE_IDS.EARLY_FAMILY : LIFE_STAGE_IDS.CAREER_BUILDING;
    if (!hasSpouse && age >= 32 && (surplusRate >= 20 || netWorth > 2e6)) {
      lifeStageId = LIFE_STAGE_IDS.PEAK_EARNER;
    }
  } else if (age < 25) {
    lifeStageId = LIFE_STAGE_IDS.YOUNG_SINGLE;
  } else {
    lifeStageId = LIFE_STAGE_IDS.PEAK_EARNER;
  }
  const dependencyLoad = (hasSpouse ? 1 : 0) + childrenCount;
  const horizonPressure = yearsToRetirement <= 12 ? "high" : yearsToRetirement <= 20 ? "medium" : "low";
  const liquidityBias = emiRatio >= 40 || youngestChildAge != null && youngestChildAge < 5 ? "high" : yearsToRetirement <= 10 ? "medium" : "low";
  const stageSignals = {
    dependencyLoad,
    horizonPressure,
    liquidityBias,
    protectionTilt: dependencyLoad >= 1,
    educationTilt: childrenCount >= 1,
    retirementTilt: yearsToRetirement <= 15,
    wealthTilt: dependencyLoad === 0 && yearsToRetirement > 15,
    incomeStability: hasStableIncome ? "stable" : "variable",
    surplusRate,
    netWorth,
    emiRatio
  };
  const lifeStage = LIFE_STAGE_LABELS[lifeStageId] || LIFE_STAGE_LABELS[LIFE_STAGE_IDS.YOUNG_SINGLE];
  const stageSummary = buildStageSummary(lifeStageId, ctx, stageSignals);
  return {
    lifeStageId,
    lifeStage,
    stageSignals,
    stageSummary,
    context: ctx
  };
}
function buildStageSummary(lifeStageId, ctx, signals) {
  const age = ctx.age || 0;
  const ytr = ctx.yearsToRetirement || 0;
  const kids = ctx.childrenCount || 0;
  switch (lifeStageId) {
    case LIFE_STAGE_IDS.YOUNG_SINGLE:
      return `At ${age} with ${ytr} years to retirement, you are building foundations \u2014 emergency buffer and habits matter most.`;
    case LIFE_STAGE_IDS.CAREER_BUILDING:
      return `Career-building years at ${age} \u2014 grow surplus steadily while keeping emergency and protection foundations solid.`;
    case LIFE_STAGE_IDS.EARLY_FAMILY:
      return `Early family stage: protection and a solid emergency fund should lead before aggressive wealth creation.`;
    case LIFE_STAGE_IDS.GROWING_FAMILY:
      return `Growing family with ${kids} child${kids === 1 ? "" : "ren"} \u2014 education, protection, and liquidity outrank pure wealth chasing.`;
    case LIFE_STAGE_IDS.PEAK_EARNER:
      return `Peak earning years with ${ytr} years to retirement \u2014 balance growth with retirement catch-up and tax efficiency.`;
    case LIFE_STAGE_IDS.PRE_RETIREMENT:
      return `Pre-retirement (${ytr} years left) \u2014 de-risk near-term needs and close the retirement gap first.`;
    case LIFE_STAGE_IDS.WISDOM_YEARS:
      return `Wisdom years \u2014 capital preservation, healthcare, and income stability take priority.`;
    default:
      return signals.protectionTilt ? "Protect the household first, then fund life goals with what remains." : "Build buffers, then put surplus to work toward your life goals.";
  }
}

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
var calculateProfile = (member, householdContext = {}) => {
  const age = member.dob ? calculateAge(member.dob) : parseFloat(member.age) || 0;
  const retirementAge = parseInt(member.retirementAge, 10) || 60;
  const yearsToRetire = retirementAge - age;
  const retirementYear = member.dob ? calculateRetirementYear(member.dob, retirementAge) : "";
  const familyMembers = householdContext.familyMembers?.length ? householdContext.familyMembers : [member];
  const stage = determineLifeStage({
    familyMembers,
    age,
    retirementAge,
    surplusRate: householdContext.surplusRate,
    netWorth: householdContext.netWorth,
    emiRatio: householdContext.emiRatio,
    hasStableIncome: householdContext.hasStableIncome
  });
  return {
    ...member,
    age,
    yearsToRetire,
    retirementYear,
    lifeStage: stage.lifeStage,
    lifeStageId: stage.lifeStageId,
    stageSignals: stage.stageSignals,
    stageSummary: stage.stageSummary,
    isLateStart: age > 40 && yearsToRetire < 15
  };
};
var calculateFamilyProfile = (members, householdContext = {}) => {
  const familyMembers = members || [];
  return familyMembers.map((member) => calculateProfile(member, {
    ...householdContext,
    familyMembers
  }));
};
export {
  buildLifeStageContext,
  calculateAge,
  calculateFamilyProfile,
  calculateProfile,
  calculateRetirementYear,
  determineLifeStage
};
