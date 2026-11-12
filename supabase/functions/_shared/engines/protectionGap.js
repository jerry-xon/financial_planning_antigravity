// apps/web/src/components/DetailedFlow/insuranceDetailSync.js
function getMemberInsuranceKey(member) {
  return member?.name || member?.relation || "Member";
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
export {
  calculateProtectionGap,
  getIncomeMultiple,
  incomeEligibilityCap,
  shouldAssessSpouseProtection
};
