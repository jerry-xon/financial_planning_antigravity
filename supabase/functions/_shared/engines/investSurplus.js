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
function getEmergencyFundAmount(assetCategories = {}, contingencyFund = "") {
  const fromDetail = getAssetAmount(assetCategories.cash?.savings);
  if (fromDetail > 0) return fromDetail;
  const fromSummary = getAssetAmount(assetCategories.summaryLiquidCash);
  if (fromSummary > 0) return fromSummary;
  return parseFloat(contingencyFund) || 0;
}

// apps/web/src/components/SummaryReport/MoneyStoryLogic.js
var computeSIPProjection = (monthlyAmount, annualRate = 12, years = 10) => {
  if (monthlyAmount <= 0 || years <= 0) return { futureValue: 0, totalInvested: 0, wealthGained: 0 };
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const totalInvested = monthlyAmount * n;
  const futureValue = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r * (1 + r));
  const wealthGained = futureValue - totalInvested;
  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    wealthGained: Math.round(wealthGained),
    monthlyAmount,
    annualRate,
    years
  };
};

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
function isLifeCoverPolicy(policy = {}) {
  const type = (policy.planType || "").toLowerCase();
  if (!type) return true;
  if (type.includes("health") || type.includes("medical")) return false;
  return true;
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

// apps/web/src/components/DetailedReport/investSurplusLogic.js
var parseAmount = (value) => parseFloat(value) || 0;
var RECURRING_ALLOC_TYPES = [
  "SIP",
  "PPF",
  "NPS",
  "Life Insurance",
  "Term Insurance",
  "Health Insurance",
  "Life Insurance Saving Plans",
  "Recurring Deposit"
];
function getSummaryMonthlyAmount(alloc) {
  const rawAmount = parseAmount(alloc.amount);
  const isMonthly = RECURRING_ALLOC_TYPES.includes(alloc.type);
  if (!isMonthly) return 0;
  const isInstallment = alloc.type === "Life Insurance" && !alloc.studioPlanKey || (alloc.type === "Life Insurance Saving Plans" || alloc.type === "Term Insurance") && alloc.insuredMember;
  if (isInstallment) {
    const freq = String(alloc.frequency || "Monthly").toLowerCase();
    if (freq === "quarterly") return rawAmount / 3;
    if (freq === "half-yearly" || freq === "half yearly") return rawAmount / 6;
    if (freq === "annual" || freq === "annually") return rawAmount / 12;
    return rawAmount;
  }
  return rawAmount / 12;
}
function summarizeInvestmentAllocations(allocations = []) {
  const items = allocations.map((a) => {
    const rawAmount = parseAmount(a.amount);
    const isMonthly = RECURRING_ALLOC_TYPES.includes(a.type);
    const monthlyAmount = isMonthly ? getSummaryMonthlyAmount(a) : 0;
    return {
      id: a.id,
      type: a.type,
      name: a.name || a.type,
      amount: isMonthly ? monthlyAmount : rawAmount,
      isMonthly,
      annualImpact: isMonthly ? monthlyAmount * 12 : rawAmount,
      studioPlanKey: a.studioPlanKey || null,
      startMonth: a.startMonth || null,
      startYear: a.startYear || null,
      insuredMember: a.insuredMember || null,
      frequency: a.frequency || null
    };
  }).filter((item) => Math.round(item.amount || 0) > 0);
  const monthlyCommitted = items.filter((i) => i.isMonthly).reduce((sum, i) => sum + i.amount, 0);
  return { items, monthlyCommitted, count: items.length };
}
function buildDeploymentSlices(monthlyFreeCash, protectionData, contingencyData = {}) {
  const monthly = Math.max(0, monthlyFreeCash);
  if (monthly <= 0) return [];
  const slices = [];
  let remaining = monthly;
  const emergencyGapMonthly = contingencyData?.gap > 0 ? Math.ceil(contingencyData.gap / 12) : 0;
  const emergencySlice = Math.min(remaining, emergencyGapMonthly || (contingencyData?.isHealthy ? 0 : Math.round(monthly * 0.2)));
  if (emergencySlice > 0) {
    slices.push({ name: "Emergency fund", value: Math.round(emergencySlice), fill: "#F59E0B" });
    remaining -= emergencySlice;
  }
  if (protectionData?.hasGap && remaining > 0) {
    const protectionSlice = Math.min(
      remaining,
      protectionData.suggestedMonthly > 0 ? protectionData.suggestedMonthly : Math.round(remaining * 0.2)
    );
    slices.push({ name: "Family protection", value: Math.round(protectionSlice), fill: "#6366F1" });
    remaining -= protectionSlice;
  }
  if (remaining > 0) {
    slices.push({ name: "Wealth building", value: Math.round(remaining), fill: "#10B981" });
  }
  return slices;
}
function buildInvestSurplusReport({
  moneyFlowReport,
  familyMembers = [],
  expenseCategories = {},
  assetCategories = {},
  contingencyFund = "",
  summaryLifeCover = "",
  investmentAllocations = [],
  policies = [],
  liabilityCategories = {},
  income = {},
  inflationRates = {},
  calculatorInputs = {},
  goals = []
}) {
  if (!moneyFlowReport) {
    return { meta: { hasData: false } };
  }
  const { meta, ledger, totals, journeyLink, members } = moneyFlowReport;
  const selfMember = familyMembers.find((m) => m.relation?.toLowerCase() === "self");
  const currentAge = selfMember?.dob ? calculateAge(selfMember.dob) : selfMember?.age || 30;
  const retirementAge = parseInt(selfMember?.retirementAge, 10) || 60;
  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const monthlyFreeCash = meta.currentMonth >= meta.planStartMonth ? ledger.unallocatedSurplus[meta.currentMonth] || 0 : 0;
  const protectionData = calculateProtectionData(
    expenseCategories,
    summaryLifeCover,
    familyMembers,
    policies,
    income,
    inflationRates,
    calculatorInputs,
    goals,
    assetCategories,
    liabilityCategories
  );
  const contingencyData = calculateContingencyData(
    expenseCategories,
    getEmergencyFundAmount(assetCategories, contingencyFund),
    familyMembers
  );
  const allocationsSummary = summarizeInvestmentAllocations(investmentAllocations);
  const deployableMonthly = Math.max(0, monthlyFreeCash - allocationsSummary.monthlyCommitted);
  const deploymentSlices = buildDeploymentSlices(deployableMonthly, protectionData, contingencyData);
  const wealthMonthly = deploymentSlices.find((s) => s.name === "Wealth building")?.value || deployableMonthly;
  const sipProjection = computeSIPProjection(Math.max(0, wealthMonthly), 12, yearsToRetirement);
  const suggestions = [];
  if (wealthMonthly > 0) {
    suggestions.push({
      id: "wealth-sip",
      title: "Wealth building via SIP",
      description: `Direct ${formatInr(wealthMonthly)}/month into disciplined investments.`,
      highlight: formatInr(sipProjection.futureValue),
      highlightLabel: `could grow to by retirement (${yearsToRetirement} yrs at 12% p.a.)`,
      tone: "primary"
    });
  }
  if (contingencyData.gap > 0) {
    suggestions.push({
      id: "emergency-fund",
      title: "Strengthen your emergency buffer",
      description: `Your fund covers ~${Math.round(contingencyData.monthsCoveredByFund * 10) / 10} months; ideal is ${contingencyData.contingencyPeriod} months.`,
      highlight: formatInr(contingencyData.gap),
      highlightLabel: "gap to ideal emergency fund",
      tone: "warning"
    });
  }
  if (protectionData.hasGap) {
    suggestions.push({
      id: "protection",
      title: "Close the protection gap",
      description: "Life cover helps your family maintain lifestyle if income stops unexpectedly.",
      highlight: formatInr(protectionData.protectionGap),
      highlightLabel: "additional cover suggested (HLV method)",
      tone: "accent"
    });
  }
  return {
    meta: {
      hasData: true,
      calendarYear: meta.calendarYear,
      userName: members?.selfName?.split(" ")[0] || "there",
      yearsToRetirement
    },
    hero: {
      monthlyFreeCash,
      ytdUnallocated: totals.ytdUnallocated,
      proratedUnallocated: totals.proratedUnallocated,
      yearlyPotential: totals.fullYearUnallocated,
      journeyYearSurplus: journeyLink?.proratedNetInvestibleSurplus || 0,
      deployableMonthly
    },
    allocationsSummary,
    deploymentSlices,
    sipProjection,
    suggestions,
    protectionData,
    contingencyData
  };
}
function formatInr(value) {
  return `\u20B9${Math.round(value || 0).toLocaleString("en-IN")}`;
}
function computeInvestSurplusInsights(report) {
  if (!report.meta?.hasData) {
    return [{ id: "no-data", text: "Complete Your Money Flow to see surplus deployment options.", tone: "warning" }];
  }
  const insights = [];
  const { hero, allocationsSummary, meta } = report;
  if (hero.monthlyFreeCash <= 0) {
    insights.push({
      id: "no-surplus",
      text: "No free cash flow this month \u2014 review expenses or income before allocating new investments.",
      tone: "warning"
    });
    return insights;
  }
  insights.push({
    id: "monthly-surplus",
    text: `You have \u20B9${Math.round(hero.monthlyFreeCash).toLocaleString("en-IN")}/month ready to deploy after savings.`,
    tone: "positive"
  });
  if (hero.proratedUnallocated > 0) {
    insights.push({
      id: "year-surplus",
      text: `~\u20B9${Math.round(hero.proratedUnallocated).toLocaleString("en-IN")} unallocated surplus projected through year-end.`,
      tone: "neutral"
    });
  }
  if (allocationsSummary.count > 0) {
    insights.push({
      id: "existing-allocations",
      text: `${allocationsSummary.count} investment allocation${allocationsSummary.count > 1 ? "s" : ""} already planned (\u20B9${Math.round(allocationsSummary.monthlyCommitted).toLocaleString("en-IN")}/month committed).`,
      tone: "accent"
    });
  } else {
    insights.push({
      id: "no-allocations",
      text: "No investment allocations planned yet \u2014 open the full allocation planner.",
      tone: "accent"
    });
  }
  if (hero.deployableMonthly > 0 && meta.yearsToRetirement) {
    insights.push({
      id: "retirement-horizon",
      text: `${meta.yearsToRetirement} years to retirement \u2014 consistent deployment now compounds over your full horizon.`,
      tone: "neutral"
    });
  }
  return insights;
}
function buildSipGrowthSeries(monthlyAmount, years, annualRate = 12) {
  if (monthlyAmount <= 0 || years <= 0) return [];
  const r = annualRate / 100 / 12;
  const series = [];
  for (let y = 1; y <= years; y += Math.max(1, Math.floor(years / 12))) {
    const n = y * 12;
    const fv = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r * (1 + r));
    series.push({ year: y, label: `Yr ${y}`, value: Math.round(fv), invested: monthlyAmount * n });
  }
  if (series[series.length - 1]?.year !== years) {
    const n = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r * (1 + r));
    series.push({ year: years, label: `Yr ${years}`, value: Math.round(fv), invested: monthlyAmount * n });
  }
  return series;
}
export {
  buildDeploymentSlices,
  buildInvestSurplusReport,
  buildSipGrowthSeries,
  computeInvestSurplusInsights,
  summarizeInvestmentAllocations
};
