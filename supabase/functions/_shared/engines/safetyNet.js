// apps/web/src/components/DetailedFlow/educationExpenseSync.js
function getChildMonthlyEducationExpense(child) {
  const manual = parseFloat(child.monthlyEducationExpense);
  if (manual > 0) return manual;
  if (child.occupation === "School" && child.annualSchoolFee) {
    return parseFloat(child.annualSchoolFee) / 12;
  }
  if (child.occupation === "College" && child.costOfCompleteCourse && child.courseDuration) {
    const years = parseFloat(child.courseDuration) || 1;
    return parseFloat(child.costOfCompleteCourse) / (years * 12);
  }
  return 0;
}
function sumChildrenMonthlyEducation(familyMembers = []) {
  return familyMembers.filter((m) => m.relation === "Child").reduce((sum, c) => sum + getChildMonthlyEducationExpense(c), 0);
}

// apps/web/src/components/DetailedFlow/insuranceDetailSync.js
function getMemberInsuranceKey(member) {
  return member?.name || member?.relation || "Member";
}
function sumPolicySumAssured(policies = [], { lifeOnly = true } = {}) {
  return policies.filter((p) => !p.isProposed).filter((p) => lifeOnly ? isLifeCoverPolicy(p) : true).reduce((sum, p) => sum + (parseFloat(p.sumAssured) || 0), 0);
}
function sumMemberLifeCover(policies = [], memberName = "") {
  if (!memberName) return 0;
  return policies.filter((p) => !p.isProposed).filter((p) => isLifeCoverPolicy(p)).filter((p) => p.insuredName === memberName).reduce((sum, p) => sum + (parseFloat(p.sumAssured) || 0), 0);
}
function sumHealthPolicyCover(policies = []) {
  return policies.filter((p) => !p.isProposed).filter((p) => isHealthCoverPolicy(p)).reduce((sum, p) => sum + (parseFloat(p.sumAssured) || 0), 0);
}
function isLifeCoverPolicy(policy = {}) {
  const type = (policy.planType || "").toLowerCase();
  if (!type) return true;
  if (type.includes("health") || type.includes("medical")) return false;
  return true;
}
function isHealthCoverPolicy(policy = {}) {
  const type = (policy.planType || "").toLowerCase();
  return type.includes("health") || type.includes("medical");
}
function getEffectiveHealthCover(summaryHealthCover, hasHealthInsurance = null, policies = []) {
  const detailed = sumHealthPolicyCover(policies);
  if (detailed > 0) return detailed;
  if (hasHealthInsurance === false) return 0;
  return parseFloat(summaryHealthCover) || 0;
}

// apps/web/src/components/DetailedFlow/expenseDetailSync.js
function sumUserEducationFromChildren(familyMembers = []) {
  return sumChildrenMonthlyEducation(familyMembers);
}
function sumHouseholdExceptEducation(household = {}) {
  return ["grocery", "rent", "lifestyle", "medical", "travel"].reduce(
    (sum, key) => sum + (parseFloat(household[key]) || 0),
    0
  );
}
function sumHouseholdIncludingEducation(household = {}, educationMonthly = 0) {
  const education = educationMonthly || parseFloat(household.education) || 0;
  return sumHouseholdExceptEducation(household) + education;
}
function getEmiMonthlyAmount(val) {
  if (val !== null && typeof val === "object" && val.emi) {
    return parseFloat(val.emi) || 0;
  }
  return parseFloat(val) || 0;
}
function sumConfiguredEmis(emi = {}) {
  const keys = ["personalLoan", "homeLoan", "educationLoan", "carLoan", "twoWheelerLoan", "otherEmi"];
  return keys.reduce((sum, key) => sum + getEmiMonthlyAmount(emi[key]), 0);
}
function isLikelySummaryInLifestyle(household = {}, summaryHouseholdTotal = "") {
  const lifestyle = parseFloat(household.lifestyle) || 0;
  if (lifestyle <= 0) return false;
  const othersEmpty = ["grocery", "rent", "medical", "travel"].every(
    (k) => !household[k] || parseFloat(household[k]) <= 0
  );
  if (!othersEmpty) return false;
  if (!summaryHouseholdTotal) return true;
  return String(lifestyle) === String(parseFloat(summaryHouseholdTotal));
}
function hasHouseholdBreakdown(household = {}, summaryHouseholdTotal = "") {
  if (["grocery", "rent", "medical", "travel"].some(
    (k) => household[k] && parseFloat(household[k]) > 0
  )) {
    return true;
  }
  const lifestyle = parseFloat(household.lifestyle) || 0;
  if (lifestyle <= 0) return false;
  return !isLikelySummaryInLifestyle(household, summaryHouseholdTotal);
}
function getEffectiveMonthlyEmi(expenseCategories = {}) {
  const configured = sumConfiguredEmis(expenseCategories.emi);
  if (configured > 0) return configured;
  return parseFloat(expenseCategories.summaryEmiTotal) || 0;
}
function getHouseholdBreakdownTotal(expenseCategories = {}, familyMembers = []) {
  const household = expenseCategories.household || {};
  const educationMonthly = sumUserEducationFromChildren(familyMembers);
  return sumHouseholdIncludingEducation(household, educationMonthly);
}
function hasHouseholdDetailEntered(expenseCategories = {}, familyMembers = []) {
  const household = expenseCategories.household || {};
  const summaryHouseholdTotal = expenseCategories.summaryHouseholdTotal ?? "";
  const educationMonthly = sumUserEducationFromChildren(familyMembers);
  if (educationMonthly > 0) return true;
  return hasHouseholdBreakdown(household, summaryHouseholdTotal);
}
function getEffectiveMonthlyHousehold(expenseCategories = {}, familyMembers = []) {
  if (hasHouseholdDetailEntered(expenseCategories, familyMembers)) {
    return getHouseholdBreakdownTotal(expenseCategories, familyMembers);
  }
  return parseFloat(expenseCategories.summaryHouseholdTotal) || 0;
}

// apps/web/src/components/DetailedFlow/wealthDetailSync.js
function getAssetAmount(val) {
  if (val === null || val === void 0 || val === "") return 0;
  if (Array.isArray(val)) {
    return val.reduce((sum, item) => sum + getAssetAmount(item), 0);
  }
  if (typeof val === "object" && val.amount !== void 0) {
    return parseFloat(val.amount) || 0;
  }
  return parseFloat(val) || 0;
}
function isOnlyLegacySummaryLiabilities(liabilityCategories = {}) {
  const loans = liabilityCategories.loans || {};
  const hasSummaryScalars = getAssetAmount(loans.home) > 0 || getAssetAmount(loans.creditCard) > 0 || getAssetAmount(loans.personal) > 0;
  if (!hasSummaryScalars) return false;
  return ["car", "twoWheeler", "education", "otherEmis"].every((key) => getAssetAmount(loans[key]) <= 0) && !(Array.isArray(liabilityCategories.custom) && liabilityCategories.custom.length > 0);
}
function hasLiabilityDetailEntered(liabilityCategories = {}) {
  if (Array.isArray(liabilityCategories.custom) && liabilityCategories.custom.some((c) => getAssetAmount(c?.value) > 0 || c?.label)) {
    return true;
  }
  const loans = liabilityCategories.loans || {};
  if (["car", "twoWheeler", "education", "otherEmis"].some((key) => getAssetAmount(loans[key]) > 0)) {
    return true;
  }
  const hasScalar = ["home", "personal", "creditCard"].some((key) => getAssetAmount(loans[key]) > 0);
  return hasScalar && !isOnlyLegacySummaryLiabilities(liabilityCategories);
}

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

// apps/web/src/components/ProtectionGapModule/ProtectionGapLogic.js
function shouldAssessSpouseProtection(spouseMember) {
  if (!spouseMember) return false;
  if (spouseMember.isSpouseWorking === false) return false;
  if (spouseMember.isSpouseWorking === true) return true;
  return spouseMember.occupation?.toLowerCase() !== "housewife";
}
var INCOME_MULTIPLE_TABLE = [
  { minAge: 18, maxAge: 35, multiple: 25 },
  { minAge: 36, maxAge: 45, multiple: 20 },
  { minAge: 46, maxAge: 50, multiple: 15 },
  { minAge: 51, maxAge: 60, multiple: 10 },
  { minAge: 61, maxAge: 99, multiple: 5 }
];
function getIncomeMultiple(age) {
  const band = INCOME_MULTIPLE_TABLE.find((b) => age >= b.minAge && age <= b.maxAge);
  return band ? band.multiple : 5;
}
function incomeEligibilityCap(annualIncome, age) {
  return annualIncome * getIncomeMultiple(age);
}
var getEmiVal = (val) => {
  if (val !== null && typeof val === "object") {
    return parseFloat(val.emi) || 0;
  }
  return parseFloat(val) || 0;
};
var getNonEmiLiabilities = (liabilityCategories, expenseCategories) => {
  const hasDetail = hasLiabilityDetailEntered(liabilityCategories);
  let nonEmiTotal = 0;
  if (!hasDetail) {
    nonEmiTotal = (parseFloat(liabilityCategories?.summaryCreditCardDues) || 0) + (parseFloat(liabilityCategories?.summaryOtherPayables) || 0);
  }
  const loans = liabilityCategories?.loans || {};
  const emi = expenseCategories?.emi || {};
  if (parseFloat(loans.home) > 0 && !(getEmiVal(emi.homeLoan) > 0)) {
    nonEmiTotal += parseFloat(loans.home);
  }
  if (parseFloat(loans.car) > 0 && !(getEmiVal(emi.carLoan) > 0)) {
    nonEmiTotal += parseFloat(loans.car);
  }
  if (parseFloat(loans.twoWheeler) > 0 && !(getEmiVal(emi.twoWheelerLoan) > 0)) {
    nonEmiTotal += parseFloat(loans.twoWheeler);
  }
  if (parseFloat(loans.personal) > 0 && !(getEmiVal(emi.personalLoan) > 0)) {
    nonEmiTotal += parseFloat(loans.personal);
  }
  if (parseFloat(loans.education) > 0 && !(getEmiVal(emi.educationLoan) > 0)) {
    nonEmiTotal += parseFloat(loans.education);
  }
  if (parseFloat(loans.creditCard) > 0) {
    nonEmiTotal += parseFloat(loans.creditCard);
  }
  if (parseFloat(loans.otherEmis) > 0 && !(getEmiVal(emi.otherEmi) > 0)) {
    nonEmiTotal += parseFloat(loans.otherEmis);
  }
  if (Array.isArray(liabilityCategories?.custom)) {
    liabilityCategories.custom.forEach((item) => {
      nonEmiTotal += parseFloat(item.value) || 0;
    });
  }
  return nonEmiTotal;
};
var getAnnualIncome = (incomeObj, prefix) => {
  const detailKey = prefix === "self" ? "selfDetail" : "spouseDetail";
  const detail = incomeObj?.[detailKey];
  if (detail && (parseFloat(detail.inHandSalary) > 0 || parseFloat(detail.takeHomeProfit) > 0 || parseFloat(detail.netPension) > 0)) {
    const primary = parseFloat(detail.inHandSalary || detail.takeHomeProfit || detail.netPension || 0);
    const passive = parseFloat(detail.passiveIncome || 0);
    const other = (detail.otherIncome || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const monthlyTotal = primary + passive + other;
    if (monthlyTotal > 0) {
      return monthlyTotal * 12;
    }
  }
  const mainIncome = parseFloat(incomeObj?.[prefix === "self" ? "summarySelfInHand" : "summarySpouseInHand"] || incomeObj?.[prefix] || 0);
  return (mainIncome + parseFloat(incomeObj?.[`${prefix}Bonus`] || 0) + parseFloat(incomeObj?.[`${prefix}Passive`] || 0) + parseFloat(incomeObj?.[`${prefix}Other`] || 0)) * 12 || 0;
};
var calculateProtectionGap = (expenseCategories, policies, familyMembers, income, inflationRates, calculatorInputs, goals = [], assetCategories, liabilityCategories) => {
  let householdTotal = Object.values(expenseCategories?.household || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  if (householdTotal === 0) {
    householdTotal = parseFloat(expenseCategories?.summaryHouseholdTotal || 0);
  }
  let emiTotal = Object.values(expenseCategories?.emi || {}).reduce((sum, val) => sum + getEmiVal(val), 0);
  if (emiTotal === 0) {
    emiTotal = parseFloat(expenseCategories?.summaryEmiTotal || 0);
  }
  const continuingExpenses = householdTotal + emiTotal;
  const detailedInvestments = Object.values(assetCategories?.investments || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const investmentsVal = detailedInvestments > 0 ? detailedInvestments : parseFloat(assetCategories?.summaryPortfolioValue) || 0;
  const detailedBank = Object.values(assetCategories?.bank || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0) + Object.values(assetCategories?.cash || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const bankVal = detailedBank > 0 ? detailedBank : parseFloat(assetCategories?.summaryLiquidCash) || 0;
  const physicalVal = Object.values(assetCategories?.physical || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const liquidAssets = investmentsVal + bankVal + physicalVal;
  const nonEmiLiabilities = getNonEmiLiabilities(liabilityCategories, expenseCategories);
  const selfMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "self") || { name: "Self", relation: "Self", age: 35, retirementAge: 60 };
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  const selfAnnualIncome = getAnnualIncome(income, "self");
  const spouseAnnualIncome = spouseMember && shouldAssessSpouseProtection(spouseMember) ? getAnnualIncome(income, "spouse") : 0;
  const calculateIndividualGap = (member, annualIncome, otherSpouseAnnualIncome) => {
    if (!member) return null;
    const memberName = getMemberInsuranceKey(member);
    const individualCoverage = sumMemberLifeCover(policies, memberName);
    const age = member.dob ? calculateAge(member.dob) : parseInt(member.age) || 35;
    const survivingIncomeMonthly = otherSpouseAnnualIncome / 12;
    const monthlyShortfall = Math.max(continuingExpenses - survivingIncomeMonthly, 0);
    const annualShortfall = monthlyShortfall * 12;
    const multiplier = getIncomeMultiple(age);
    const hlvNeed = annualShortfall * multiplier;
    const grossNeed = hlvNeed + nonEmiLiabilities;
    const deductions = individualCoverage + liquidAssets;
    const gap = Math.max(grossNeed - deductions, 0);
    return {
      name: memberName,
      coverage: individualCoverage,
      need: grossNeed,
      gap,
      isGap: gap > 0,
      idealCover: grossNeed,
      insurabilityCap: incomeEligibilityCap(annualIncome, age),
      shortfall: Math.max(grossNeed - incomeEligibilityCap(annualIncome, age), 0),
      isCapped: grossNeed > incomeEligibilityCap(annualIncome, age),
      hlv: hlvNeed,
      needsCorpus: grossNeed,
      needsBreakdown: {
        expenses: hlvNeed,
        liabilities: nonEmiLiabilities,
        deductions,
        continuingExpenses,
        survivingIncomeMonthly,
        monthlyShortfall,
        multiplier,
        liquidAssets,
        coverage: individualCoverage,
        survivingSpouseName: memberName?.toLowerCase() === "self" || member.relation?.toLowerCase() === "self" ? spouseMember?.name || "Spouse" : selfMember?.name || "Self"
      }
    };
  };
  const selfRes = calculateIndividualGap(selfMember, selfAnnualIncome, spouseAnnualIncome);
  const spouseRes = shouldAssessSpouseProtection(spouseMember) ? calculateIndividualGap(spouseMember, spouseAnnualIncome, selfAnnualIncome) : null;
  if (selfRes && spouseRes) {
    console.assert(
      selfRes.hlv !== spouseRes.hlv || selfRes.hlv === 0 || selfAnnualIncome === spouseAnnualIncome,
      "self/spouse HLV need identical despite different incomes \u2014 check binding"
    );
  }
  return {
    monthlyExpenditure: continuingExpenses,
    multiplier: 200,
    protectionNeed: continuingExpenses * 200,
    self: selfRes,
    spouse: spouseRes
  };
};

// apps/web/src/components/SummaryReport/SafetyNetLogic.js
var MIN_HEALTH_COVER = 1e6;
function getEffectiveMonthlyNeed(expenseCategories = {}, familyMembers = []) {
  return getEffectiveMonthlyHousehold(expenseCategories, familyMembers) + getEffectiveMonthlyEmi(expenseCategories);
}
var calculateProtectionData = (expenseCategories, summaryLifeCover, familyMembers = [], policies = [], income, inflationRates, calculatorInputs, goals, assetCategories, liabilityCategories) => {
  const monthlyNeed = getEffectiveMonthlyNeed(expenseCategories, familyMembers);
  const annualNeed = monthlyNeed * 12;
  const gapData = calculateProtectionGap(
    expenseCategories,
    policies,
    familyMembers,
    income,
    inflationRates,
    calculatorInputs,
    goals,
    assetCategories,
    liabilityCategories
  );
  const detailedLifeTotal = sumPolicySumAssured(policies);
  let self = null;
  let spouse = null;
  if (gapData.self) {
    let selfCoverage = gapData.self.coverage;
    if (detailedLifeTotal === 0 && parseFloat(summaryLifeCover) > 0) {
      selfCoverage = parseFloat(summaryLifeCover);
    }
    const liquidAssets = gapData.self.needsBreakdown?.liquidAssets || 0;
    const gap = Math.max(0, gapData.self.need - selfCoverage - liquidAssets);
    const coveredPercent = gapData.self.need > 0 ? Math.min(100, Math.round((selfCoverage + liquidAssets) / gapData.self.need * 100)) : 0;
    const yearsCovered = annualNeed > 0 ? selfCoverage / annualNeed : 0;
    const selfMember = familyMembers.find((m) => m.relation?.toLowerCase() === "self");
    self = {
      ...gapData.self,
      role: "self",
      name: selfMember?.name || gapData.self.name || "Self",
      coverage: selfCoverage,
      gap,
      isGap: gap > 0,
      coveredPercent,
      yearsCovered: Math.round(yearsCovered * 100) / 100,
      monthsCovered: Math.round(yearsCovered * 12),
      needsBreakdown: {
        ...gapData.self.needsBreakdown,
        coverage: selfCoverage,
        deductions: selfCoverage + liquidAssets
      }
    };
  }
  if (gapData.spouse) {
    const spouseCoverage = gapData.spouse.coverage;
    const liquidAssets = gapData.spouse.needsBreakdown?.liquidAssets || 0;
    const gap = Math.max(0, gapData.spouse.need - spouseCoverage - liquidAssets);
    const coveredPercent = gapData.spouse.need > 0 ? Math.min(100, Math.round((spouseCoverage + liquidAssets) / gapData.spouse.need * 100)) : 0;
    const yearsCovered = annualNeed > 0 ? spouseCoverage / annualNeed : 0;
    const spouseMember = familyMembers.find((m) => m.relation?.toLowerCase() === "spouse");
    spouse = {
      ...gapData.spouse,
      role: "spouse",
      name: spouseMember?.name || gapData.spouse.name || "Spouse",
      coverage: spouseCoverage,
      gap,
      isGap: gap > 0,
      coveredPercent,
      yearsCovered: Math.round(yearsCovered * 100) / 100,
      monthsCovered: Math.round(yearsCovered * 12),
      needsBreakdown: {
        ...gapData.spouse.needsBreakdown,
        coverage: spouseCoverage,
        deductions: spouseCoverage + liquidAssets
      }
    };
  }
  const assessedMembers = [self, spouse].filter(Boolean);
  const weakest = assessedMembers.reduce(
    (worst, member) => member.coveredPercent < worst.coveredPercent ? member : worst,
    assessedMembers[0]
  );
  const protectionGap = assessedMembers.reduce((sum, member) => sum + member.gap, 0);
  return {
    monthlyNeed,
    annualNeed,
    multiplier: gapData.multiplier,
    coverageRequired: weakest?.need ?? gapData.protectionNeed,
    coverageHave: weakest?.coverage ?? 0,
    protectionGap,
    coveredPercent: weakest?.coveredPercent ?? 0,
    yearsCovered: weakest?.yearsCovered ?? 0,
    monthsCovered: weakest?.monthsCovered ?? 0,
    hasGap: protectionGap > 0,
    hasData: monthlyNeed > 0,
    self,
    spouse,
    assessedMembers,
    weakestRole: weakest?.role ?? "self",
    weakestName: weakest?.name ?? (self?.name || "Self")
  };
};
var calculateContingencyData = (expenseCategories, contingencyFund, familyMembers = []) => {
  const monthlyNeed = getEffectiveMonthlyNeed(expenseCategories, familyMembers);
  const contingencyPeriod = 6;
  const emergencyFundNeeded = monthlyNeed * contingencyPeriod;
  const emergencyFundHave = parseFloat(contingencyFund) || 0;
  const gap = Math.max(0, emergencyFundNeeded - emergencyFundHave);
  const monthsCoveredByFund = monthlyNeed > 0 ? emergencyFundHave / monthlyNeed : 0;
  const daysCovered = Math.round(monthsCoveredByFund * 30);
  return {
    monthlyNeed,
    contingencyPeriod,
    emergencyFundNeeded,
    emergencyFundHave,
    gap,
    monthsCoveredByFund: Math.round(monthsCoveredByFund * 100) / 100,
    daysCovered,
    isHealthy: emergencyFundHave >= emergencyFundNeeded,
    hasData: monthlyNeed > 0
  };
};
var calculateHealthInsuranceData = (summaryHealthCover, hasHealthInsurance, familyMembers = [], policies = []) => {
  const minimumRequired = MIN_HEALTH_COVER;
  const coverageHave = getEffectiveHealthCover(summaryHealthCover, hasHealthInsurance, policies);
  const healthGap = Math.max(0, minimumRequired - coverageHave);
  const coveredPercent = minimumRequired > 0 ? Math.min(100, Math.round(coverageHave / minimumRequired * 100)) : 0;
  let status = "adequate";
  if (coverageHave === 0) {
    status = "none";
  } else if (healthGap > 0) {
    status = "partial";
  }
  return {
    minimumRequired,
    coverageHave,
    healthGap,
    coveredPercent,
    hasGap: healthGap > 0,
    status,
    familySize: familyMembers.length
  };
};
var buildCrisisTimeline = (contingencyData, protectionData, memberRole = null) => {
  const emergencyMonths = contingencyData.monthsCoveredByFund;
  let insuranceYears = protectionData.yearsCovered;
  if (memberRole === "self" && protectionData.self) {
    insuranceYears = protectionData.self.yearsCovered;
  } else if (memberRole === "spouse" && protectionData.spouse) {
    insuranceYears = protectionData.spouse.yearsCovered;
  }
  const fmtMonths = (m) => {
    if (m < 1) return `${Math.round(m * 30)} days`;
    if (m === 1) return "1 month";
    return `${Math.round(m * 10) / 10} months`;
  };
  const fmtYears = (y) => {
    if (y < 1) return `${Math.round(y * 12)} months`;
    return `${Math.round(y * 100) / 100} years`;
  };
  return [
    {
      id: "stage-1",
      stage: 1,
      duration: `Till ${fmtMonths(emergencyMonths)}`,
      title: "Emergency Fund Supports Expenses",
      status: "Financially Comfortable",
      statusColor: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      icon: "shield-check"
    },
    {
      id: "stage-2",
      stage: 2,
      duration: `After ${fmtMonths(emergencyMonths)}`,
      title: "Additional Funds May Be Required",
      status: "Financial Flexibility Starts Reducing",
      statusColor: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.08)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      icon: "alert-triangle"
    },
    {
      id: "stage-3",
      stage: 3,
      duration: `Up to ${fmtYears(insuranceYears)}`,
      title: "Life Insurance Proceeds Support Expenses",
      status: "Basic Financial Needs Remain Supported",
      statusColor: "#00A9F2",
      bgColor: "rgba(0, 169, 242, 0.08)",
      borderColor: "rgba(0, 169, 242, 0.3)",
      icon: "umbrella"
    },
    {
      id: "stage-4",
      stage: 4,
      duration: `After ${fmtYears(insuranceYears)}`,
      title: "Existing Resources May Be Exhausted",
      status: "Long-Term Financial Security May Be At Risk",
      statusColor: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.08)",
      borderColor: "rgba(239, 68, 68, 0.3)",
      icon: "alert-octagon"
    }
  ];
};
var buildRecoverySteps = (protectionData, healthData, contingencyData) => {
  const steps = [];
  const self = protectionData.self;
  const spouse = protectionData.spouse;
  if (self?.isGap) {
    steps.push({
      id: "step-protection-self",
      step: steps.length + 1,
      urgency: "Immediate",
      title: `Fill ${self.name}'s Protection Gap`,
      description: `Buy term cover of ${formatCompactSN(self.gap)} on ${self.name}. Life cover pays only on that person's absence \u2014 underinsurance here leaves the household exposed.`,
      amount: self.gap,
      icon: "shield",
      color: "#6366F1",
      memberRole: "self"
    });
  } else if (protectionData.hasGap && !self && !spouse) {
    steps.push({
      id: "step-protection",
      step: steps.length + 1,
      urgency: "Immediate",
      title: "Fill Protection Gap",
      description: `Buy term cover of ${formatCompactSN(protectionData.protectionGap)} to secure your family's future.`,
      amount: protectionData.protectionGap,
      icon: "shield",
      color: "#6366F1"
    });
  }
  if (spouse?.isGap) {
    steps.push({
      id: "step-protection-spouse",
      step: steps.length + 1,
      urgency: "Immediate",
      title: `Fill ${spouse.name}'s Protection Gap`,
      description: `Buy term cover of ${formatCompactSN(spouse.gap)} on ${spouse.name}. If they are not with us, only their sum insured supports household expenses \u2014 not cover held on other members.`,
      amount: spouse.gap,
      icon: "shield",
      color: "#6366F1",
      memberRole: "spouse"
    });
  }
  if (healthData.hasGap) {
    const healthAmount = healthData.coverageHave === 0 ? healthData.minimumRequired : healthData.healthGap;
    const healthTitle = healthData.coverageHave === 0 ? "Get Family Health Cover" : "Strengthen Health Cover";
    const healthDesc = healthData.coverageHave === 0 ? `Get family health insurance with at least ${formatCompactSN(healthData.minimumRequired)} sum insured.` : `Increase health cover by ${formatCompactSN(healthData.healthGap)} to reach the ${formatCompactSN(healthData.minimumRequired)} minimum.`;
    steps.push({
      id: "step-health",
      step: steps.length + 1,
      urgency: "High",
      title: healthTitle,
      description: healthDesc,
      amount: healthAmount,
      icon: "heart",
      color: "#00A9F2"
    });
  }
  if (contingencyData.gap > 0) {
    steps.push({
      id: "step-contingency",
      step: steps.length + 1,
      urgency: "Immediate",
      title: "Build Emergency Fund",
      description: `Assign remaining funds for emergency reserves of ${formatCompactSN(contingencyData.gap)}.`,
      amount: contingencyData.gap,
      icon: "wallet",
      color: "#F59E0B"
    });
  }
  return steps;
};
var formatCompactSN = (amount) => {
  if (amount === 0) return "\u20B90";
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (absAmount >= 1e7) {
    return `${sign}\u20B9${(absAmount / 1e7).toFixed(2)} Cr`;
  } else if (absAmount >= 1e5) {
    return `${sign}\u20B9${(absAmount / 1e5).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};
export {
  MIN_HEALTH_COVER,
  buildCrisisTimeline,
  buildRecoverySteps,
  calculateContingencyData,
  calculateHealthInsuranceData,
  calculateProtectionData,
  formatCompactSN
};
