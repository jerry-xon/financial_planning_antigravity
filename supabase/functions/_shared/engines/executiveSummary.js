// apps/web/src/components/CashFlowModule/CashFlowUtils.js
var convertToMonthly = (value, frequency) => {
  const val = parseFloat(value) || 0;
  switch (frequency) {
    case "Annual":
    case "Annually":
      return val / 12;
    case "Half Yearly":
    case "Half-Yearly":
      return val / 6;
    case "Quarterly":
      return val / 3;
    case "Monthly":
      return val;
    default:
      return val;
  }
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
function normalizeToCashFlowFrequency(freq) {
  if (freq === "Annually") return "Annual";
  if (freq === "Half-Yearly") return "Half Yearly";
  return freq || "Annual";
}
function emptyLifeEntry() {
  return { policyCount: 0, premiums: [], value: "", frequency: "Annual" };
}
function getInsuranceMonthlyTotal(insurance = {}) {
  return Object.entries(insurance).reduce((sum, [key, item]) => {
    if (key === "life") {
      return sum + Object.values(item || {}).reduce(
        (lifeSum, lifeItem) => lifeSum + getLifeMemberMonthlyTotal(migrateLifeEntry(lifeItem)),
        0
      );
    }
    if (key === "policyDocs") return sum;
    if (!item || typeof item !== "object" || item.value === void 0) return sum;
    return sum + convertToMonthly(item.value, item.frequency);
  }, 0);
}
function getEffectiveMonthlyInsurance(expenseCategories = {}) {
  const detailed = getInsuranceMonthlyTotal(expenseCategories.insurance || {});
  if (detailed > 0) return detailed;
  return parseFloat(expenseCategories.summaryInsuranceTotal) || 0;
}
function getLifeMemberMonthlyTotal(entry) {
  if (!entry) return 0;
  if (Array.isArray(entry.premiums) && entry.premiums.length > 0) {
    return entry.premiums.reduce(
      (sum, p) => sum + convertToMonthly(p.amount, p.frequency),
      0
    );
  }
  return convertToMonthly(entry.value, entry.frequency);
}
function deriveLifeMemberTotals(entry) {
  const premiums = entry?.premiums;
  if (Array.isArray(premiums) && premiums.length > 0) {
    const active = premiums.filter((p) => parseFloat(p.amount) > 0);
    if (active.length === 0) {
      return { value: "", frequency: "Annual" };
    }
    const frequencies = [...new Set(
      active.map((p) => normalizeToCashFlowFrequency(p.frequency))
    )];
    if (frequencies.length === 1) {
      const total = active.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      return {
        value: String(Math.round(total)),
        frequency: frequencies[0]
      };
    }
    const monthly = getLifeMemberMonthlyTotal(entry);
    return { value: String(Math.round(monthly)), frequency: "Monthly" };
  }
  const val = parseFloat(entry?.value) || 0;
  if (val <= 0) {
    return { value: "", frequency: "Annual" };
  }
  return {
    value: entry.value,
    frequency: normalizeToCashFlowFrequency(entry.frequency)
  };
}
function migrateLifeEntry(entry) {
  if (!entry || typeof entry !== "object") return emptyLifeEntry();
  if (Array.isArray(entry.premiums)) {
    const premiums = entry.premiums.map((p) => ({
      amount: p.amount ?? "",
      frequency: normalizeToCashFlowFrequency(p.frequency)
    }));
    const policyCount2 = entry.policyCount ?? premiums.length;
    const derived = deriveLifeMemberTotals({ premiums });
    return { policyCount: policyCount2, premiums, ...derived };
  }
  const val = parseFloat(entry.value) || 0;
  if (val > 0) {
    const premiums = [{
      amount: entry.value,
      frequency: normalizeToCashFlowFrequency(entry.frequency)
    }];
    const policyCount2 = entry.policyCount || 1;
    const sizedPremiums = resizePremiums(premiums, policyCount2);
    const derived = deriveLifeMemberTotals({ premiums: sizedPremiums });
    return { policyCount: policyCount2, premiums: sizedPremiums, ...derived };
  }
  const policyCount = entry.policyCount || 0;
  return {
    policyCount,
    premiums: resizePremiums([], policyCount),
    value: "",
    frequency: "Annual"
  };
}
function resizePremiums(premiums, count) {
  const n = Math.max(0, parseInt(count, 10) || 0);
  const next = premiums.slice(0, n);
  while (next.length < n) {
    next.push({ amount: "", frequency: "Annual" });
  }
  return next;
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

// apps/web/src/components/DetailedFlow/employmentTypeSync.js
function guessEmploymentTypeFromSummaryOccupation(occupation) {
  if (occupation === "Business / Profession") return "Business Owner";
  if (occupation === "Salaried") return "Private Sector";
  return "";
}
function resolveEmploymentType(member) {
  return member?.employmentType || guessEmploymentTypeFromSummaryOccupation(member?.occupation) || "Private Sector";
}

// apps/web/src/components/DetailedFlow/incomeDetailSync.js
var createEmptyTaxPlanning = () => ({
  earnings: {
    basicPay: "",
    dearnessAllowance: "",
    houseRentAllowance: "",
    allowances: "",
    leaveEncashment: "",
    bonus: "",
    performanceBonus: "",
    other: { name: "", amount: "" }
  },
  deductions: {
    employeePF: "",
    employeeNPS: "",
    groupInsurance: "",
    healthScheme: "",
    groupPersonalAccident: "",
    groupMedicalCoverage: "",
    incomeTax: "",
    other: { name: "", amount: "" }
  }
});
var createEmptyIncomeDetail = () => ({
  grossSalary: "",
  inHandSalary: "",
  takeHomeProfit: "",
  netPension: "",
  passiveIncome: "",
  otherIncome: [{ name: "", amount: "" }],
  needTaxPlanning: null,
  taxPlanning: createEmptyTaxPlanning()
});
var isSalariedEmployment = (employmentType) => employmentType === "Government Sector" || employmentType === "Private Sector";
var isBusinessEmployment = (employmentType) => employmentType === "Business Owner" || employmentType === "Professional";
var isPensionerEmployment = (employmentType) => employmentType === "Pensioner";
var sumOtherIncome = (otherIncome = []) => otherIncome.reduce((sum, item) => sum + (parseFloat(item?.amount) || 0), 0);
function syncLegacyFromDetail(detail, employmentType) {
  const d = { ...createEmptyIncomeDetail(), ...detail };
  const otherTotal = sumOtherIncome(d.otherIncome);
  if (isSalariedEmployment(employmentType)) {
    return {
      primary: d.inHandSalary || "",
      bonus: "",
      passive: "",
      other: otherTotal ? String(otherTotal) : ""
    };
  }
  if (isBusinessEmployment(employmentType)) {
    return {
      primary: d.takeHomeProfit || "",
      bonus: "",
      passive: d.passiveIncome || "",
      other: otherTotal ? String(otherTotal) : ""
    };
  }
  if (isPensionerEmployment(employmentType)) {
    return {
      primary: d.netPension || "",
      bonus: "",
      passive: "",
      other: otherTotal ? String(otherTotal) : ""
    };
  }
  return {
    primary: d.inHandSalary || d.takeHomeProfit || d.netPension || "",
    bonus: "",
    passive: d.passiveIncome || "",
    other: otherTotal ? String(otherTotal) : ""
  };
}
function getMemberDetailMonthlyTotal(detail, employmentType) {
  const legacy = syncLegacyFromDetail(detail, employmentType);
  return (parseFloat(legacy.primary) || 0) + (parseFloat(legacy.bonus) || 0) + (parseFloat(legacy.passive) || 0) + (parseFloat(legacy.other) || 0);
}
function hasIncomeDetailEntered(detail, employmentType) {
  const d = { ...createEmptyIncomeDetail(), ...detail };
  if (parseFloat(d.grossSalary) > 0) return true;
  if (hasTaxSlipEarnings(d)) return true;
  if (isSalariedEmployment(employmentType) && parseFloat(d.inHandSalary) > 0) return true;
  if (isBusinessEmployment(employmentType) && (parseFloat(d.takeHomeProfit) > 0 || parseFloat(d.passiveIncome) > 0)) return true;
  if (isPensionerEmployment(employmentType) && parseFloat(d.netPension) > 0) return true;
  return sumOtherIncome(d.otherIncome) > 0;
}
function getSummaryIncomeTarget(income = {}, memberKey = "self") {
  if (memberKey === "self") {
    return income.summarySelfInHand ?? income.self ?? "";
  }
  return income.summarySpouseInHand ?? income.spouse ?? "";
}
function hasIncomeBreakdown(detail, employmentType) {
  const legacy = syncLegacyFromDetail(detail, employmentType);
  return (parseFloat(legacy.passive) || 0) > 0 || (parseFloat(legacy.other) || 0) > 0 || (parseFloat(legacy.bonus) || 0) > 0;
}
function syncSummaryAmountToDetailPrimary(detail, amount, employmentType) {
  const next = { ...createEmptyIncomeDetail(), ...detail };
  if (isSalariedEmployment(employmentType)) {
    next.inHandSalary = amount;
  } else if (isBusinessEmployment(employmentType)) {
    next.takeHomeProfit = amount;
  } else if (isPensionerEmployment(employmentType)) {
    next.netPension = amount;
  } else {
    next.inHandSalary = amount;
  }
  return next;
}
function prefillDetailFromSummaryAmount(detail, summaryAmount, employmentType) {
  const next = { ...createEmptyIncomeDetail(), ...detail };
  const amount = summaryAmount || "";
  if (!amount) return next;
  if (isSalariedEmployment(employmentType) && !next.inHandSalary) {
    next.inHandSalary = amount;
  } else if (isBusinessEmployment(employmentType)) {
    if (!next.takeHomeProfit) next.takeHomeProfit = amount;
  } else if (isPensionerEmployment(employmentType) && !next.netPension) {
    next.netPension = amount;
  } else if (!next.inHandSalary && !next.takeHomeProfit && !next.netPension) {
    next.inHandSalary = amount;
  }
  return next;
}
var parseAmount = (value) => parseFloat(value) || 0;
var TAX_SLIP_MONTHLY_KEYS = ["basicPay", "dearnessAllowance", "houseRentAllowance", "allowances"];
function hasTaxSlipEarnings(detail) {
  const earnings = detail?.taxPlanning?.earnings || {};
  if (TAX_SLIP_MONTHLY_KEYS.some((key) => parseAmount(earnings[key]) > 0)) return true;
  if (parseAmount(earnings.other?.amount) > 0) return true;
  if (parseAmount(earnings.performanceBonus) > 0) return true;
  if (parseAmount(earnings.bonus) > 0) return true;
  return parseAmount(earnings.leaveEncashment) > 0;
}
function getFlatHouseholdMonthlyIncome(income = {}) {
  return (parseFloat(income.self) || 0) + (parseFloat(income.selfBonus) || 0) + (parseFloat(income.selfPassive) || 0) + (parseFloat(income.selfOther) || 0) + (parseFloat(income.spouse) || 0) + (parseFloat(income.spouseBonus) || 0) + (parseFloat(income.spousePassive) || 0) + (parseFloat(income.spouseOther) || 0);
}
function getMemberFlatMonthlyIncome(income = {}, memberKey = "self") {
  const prefix = memberKey === "self" ? "self" : "spouse";
  return (parseFloat(income[prefix]) || 0) + (parseFloat(income[`${prefix}Bonus`]) || 0) + (parseFloat(income[`${prefix}Passive`]) || 0) + (parseFloat(income[`${prefix}Other`]) || 0);
}
function shouldIncludeSpouseIncome(spouseMember, hasSpouseIncome = false, income = {}) {
  if (hasSpouseIncome === true) return true;
  if (!spouseMember) {
    return getMemberFlatMonthlyIncome(income, "spouse") > 0 || parseFloat(income.summarySpouseInHand) > 0;
  }
  if (spouseMember.isSpouseWorking === true) return true;
  if (getMemberFlatMonthlyIncome(income, "spouse") > 0) return true;
  if (parseFloat(income.summarySpouseInHand) > 0) return true;
  return false;
}
function getHouseholdMonthlyInflow(income, familyMembers, hasSpouseIncome, resolveEmploymentType2) {
  const selfMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "self");
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  if (!selfMember) return getFlatHouseholdMonthlyIncome(income);
  const selfType = resolveEmploymentType2(selfMember);
  const spouseType = spouseMember ? resolveEmploymentType2(spouseMember) : "Private Sector";
  const includeSpouse = shouldIncludeSpouseIncome(spouseMember, hasSpouseIncome, income);
  const selfDetail = getMemberDetailForProjection(income, "self", selfType);
  let total = getMemberDetailMonthlyTotal(selfDetail, selfType);
  if (includeSpouse) {
    const spouseDetail = getMemberDetailForProjection(income, "spouse", spouseType);
    total += getMemberDetailMonthlyTotal(spouseDetail, spouseType);
  }
  if (total > 0) return total;
  return getFlatHouseholdMonthlyIncome(income);
}
function getMemberDetailForProjection(income = {}, memberKey = "self", employmentType) {
  const detailKey = memberKey === "self" ? "selfDetail" : "spouseDetail";
  let detail = { ...createEmptyIncomeDetail(), ...income[detailKey] || {} };
  const prefix = memberKey === "self" ? "self" : "spouse";
  const summaryAmount = getSummaryIncomeTarget(income, memberKey) || income[prefix] || "";
  if (!hasIncomeDetailEntered(detail, employmentType)) {
    detail = prefillDetailFromSummaryAmount(detail, summaryAmount, employmentType);
  } else if (!hasIncomeBreakdown(detail, employmentType) && summaryAmount) {
    detail = syncSummaryAmountToDetailPrimary(detail, summaryAmount, employmentType);
  }
  const passive = income[`${prefix}Passive`];
  const other = income[`${prefix}Other`];
  if (passive) detail.passiveIncome = passive;
  if (other) detail.otherIncome = [{ name: "", amount: other }];
  return detail;
}

// apps/web/src/components/DetailedFlow/savingsDetailSync.js
function getSavingsMonthlyAmount(val) {
  if (val === null || val === void 0 || val === "") return 0;
  if (Array.isArray(val)) {
    return val.reduce((sum, item) => sum + getSavingsMonthlyAmount(item), 0);
  }
  if (typeof val === "object" && val.amount !== void 0) {
    return parseFloat(val.amount) || 0;
  }
  return parseFloat(val) || 0;
}
function sumConfiguredSavings(savings = {}) {
  return ["sip", "ppf", "nps", "otherSaving"].reduce(
    (sum, key) => sum + getSavingsMonthlyAmount(savings[key]),
    getSavingsMonthlyAmount(savings.rd)
  );
}
function hasConfiguredSavings(savings = {}) {
  return sumConfiguredSavings(savings) > 0;
}
function getSummarySavingsTotal(expenseCategories = {}) {
  return (parseFloat(expenseCategories.summaryMonthlyInvestments) || 0) + (parseFloat(expenseCategories.summaryOtherSavings) || 0);
}
function getGrowthSavingsMonthly(expenseCategories = {}) {
  const savings = expenseCategories.savings || {};
  return getSavingsMonthlyAmount(savings.sip) + getSavingsMonthlyAmount(savings.ppf) + getSavingsMonthlyAmount(savings.nps);
}
function getEffectiveMonthlySavings(expenseCategories = {}) {
  const configured = sumConfiguredSavings(expenseCategories.savings);
  if (configured > 0) return configured;
  return getSummarySavingsTotal(expenseCategories);
}

// apps/web/src/components/DetailedReport/moneyFlowLedgerLogic.js
var parseAmount2 = (value) => parseFloat(value) || 0;
var sumOtherIncome2 = (otherIncome = []) => otherIncome.reduce((sum, item) => sum + parseAmount2(item?.amount), 0);
function getMemberNetInflowForLedger(detail, employmentType) {
  const d = { ...createEmptyIncomeDetail(), ...detail };
  const other = sumOtherIncome2(d.otherIncome);
  if (isSalariedEmployment(employmentType)) {
    return parseAmount2(d.inHandSalary) + other;
  }
  if (isBusinessEmployment(employmentType)) {
    return parseAmount2(d.takeHomeProfit) + parseAmount2(d.passiveIncome) + other;
  }
  if (isPensionerEmployment(employmentType)) {
    return parseAmount2(d.netPension) + other;
  }
  return parseAmount2(d.inHandSalary) + other;
}
function getLedgerNetIncomeMonthly(income, familyMembers, hasSpouseIncome, resolveEmploymentType2) {
  const selfMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "self");
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  if (!selfMember) {
    return Math.round(getHouseholdMonthlyInflow(income, familyMembers, hasSpouseIncome, resolveEmploymentType2));
  }
  const selfType = resolveEmploymentType2(selfMember);
  const spouseType = spouseMember ? resolveEmploymentType2(spouseMember) : "";
  const includeSpouse = shouldIncludeSpouseIncome(spouseMember, hasSpouseIncome, income);
  const selfDetail = getMemberDetailForProjection(income, "self", selfType);
  let total = getMemberNetInflowForLedger(selfDetail, selfType);
  if (includeSpouse) {
    const spouseDetail = getMemberDetailForProjection(
      income,
      "spouse",
      spouseMember ? spouseType : "Private Sector"
    );
    total += getMemberNetInflowForLedger(spouseDetail, spouseMember ? spouseType : "Private Sector");
  }
  if (total > 0) return Math.round(total);
  return Math.round(getHouseholdMonthlyInflow(income, familyMembers, hasSpouseIncome, resolveEmploymentType2));
}

// apps/web/src/components/CashFlowModule/CashFlowLogic.js
var calculateCashFlow = (income, expenseCategories, familyMembers = [], hasSpouseIncome) => {
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  const resolvedHasSpouseIncome = typeof hasSpouseIncome === "boolean" ? hasSpouseIncome : shouldIncludeSpouseIncome(spouseMember, false, income);
  const totalIncome = getLedgerNetIncomeMonthly(
    income,
    familyMembers,
    resolvedHasSpouseIncome,
    resolveEmploymentType
  ) + (parseFloat(income.family) || 0);
  const householdSum = getEffectiveMonthlyHousehold(expenseCategories, familyMembers);
  const emiSum = getEffectiveMonthlyEmi(expenseCategories);
  const insuranceSum = getEffectiveMonthlyInsurance(expenseCategories);
  const savingsSum = getEffectiveMonthlySavings(expenseCategories);
  const categorySums = {
    household: householdSum,
    emi: emiSum,
    insurance: insuranceSum,
    savings: savingsSum
  };
  const totalExpenses = householdSum + emiSum + insuranceSum;
  const surplus = totalIncome - totalExpenses;
  const surplusRate = totalIncome > 0 ? surplus / totalIncome * 100 : 0;
  const householdRatio = totalIncome > 0 ? householdSum / totalIncome * 100 : 0;
  const emiRatio = totalIncome > 0 ? emiSum / totalIncome * 100 : 0;
  const insuranceRatio = totalIncome > 0 ? insuranceSum / totalIncome * 100 : 0;
  const savingsRatio = totalIncome > 0 ? savingsSum / totalIncome * 100 : 0;
  const expenseBreakdown = [];
  const householdUsesSnapshot = householdSum > 0 && !hasHouseholdDetailEntered(expenseCategories, familyMembers) && parseFloat(expenseCategories.summaryHouseholdTotal) > 0;
  if (householdUsesSnapshot) {
    expenseBreakdown.push({
      name: "Household & Lifestyle (Summary)",
      category: getCategoryLabel("household"),
      value: parseFloat(expenseCategories.summaryHouseholdTotal)
    });
  }
  ["household", "emi"].forEach((cat) => {
    if (cat === "household" && householdUsesSnapshot) return;
    Object.entries(expenseCategories[cat] || {}).forEach(([itemKey, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v, idx) => {
          let amount = parseFloat(v?.amount !== void 0 ? v.amount : v) || 0;
          if (amount > 0) {
            expenseBreakdown.push({
              name: `${getItemLabel(itemKey)} #${idx + 1}`,
              category: getCategoryLabel(cat),
              value: amount
            });
          }
        });
      } else {
        let amount = 0;
        if (cat === "emi" && value !== null && typeof value === "object") {
          amount = parseFloat(value.emi) || 0;
        } else if (value !== null && typeof value === "object" && value.amount !== void 0) {
          amount = parseFloat(value.amount) || 0;
        } else {
          amount = parseFloat(value) || 0;
        }
        if (amount > 0) {
          expenseBreakdown.push({
            name: getItemLabel(itemKey),
            category: getCategoryLabel(cat),
            value: amount
          });
        }
      }
    });
  });
  const savings = expenseCategories.savings || {};
  if (hasConfiguredSavings(savings)) {
    Object.entries(savings).forEach(([itemKey, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v, idx) => {
          const amount = getSavingsMonthlyAmount(v);
          if (amount > 0) {
            expenseBreakdown.push({
              name: `${getItemLabel(itemKey)} #${idx + 1}`,
              category: getCategoryLabel("savings"),
              value: amount
            });
          }
        });
      } else {
        const amount = getSavingsMonthlyAmount(value);
        if (amount > 0) {
          expenseBreakdown.push({
            name: getItemLabel(itemKey),
            category: getCategoryLabel("savings"),
            value: amount
          });
        }
      }
    });
  } else {
    const summaryInvest = parseFloat(expenseCategories.summaryMonthlyInvestments) || 0;
    const summaryOther = parseFloat(expenseCategories.summaryOtherSavings) || 0;
    if (summaryInvest > 0) {
      expenseBreakdown.push({
        name: "Monthly Investments (Summary)",
        category: getCategoryLabel("savings"),
        value: summaryInvest
      });
    }
    if (summaryOther > 0) {
      expenseBreakdown.push({
        name: "Other Savings (Summary)",
        category: getCategoryLabel("savings"),
        value: summaryOther
      });
    }
  }
  if (emiSum > 0 && sumConfiguredEmis(expenseCategories.emi) === 0 && parseFloat(expenseCategories.summaryEmiTotal) > 0) {
    expenseBreakdown.push({
      name: "Monthly EMI (Summary)",
      category: getCategoryLabel("emi"),
      value: parseFloat(expenseCategories.summaryEmiTotal)
    });
  }
  const insuranceUsesSnapshot = insuranceSum > 0 && getInsuranceMonthlyTotal(expenseCategories.insurance || {}) === 0 && parseFloat(expenseCategories.summaryInsuranceTotal) > 0;
  if (insuranceUsesSnapshot) {
    expenseBreakdown.push({
      name: "Insurance Premiums (Summary)",
      category: getCategoryLabel("insurance"),
      value: parseFloat(expenseCategories.summaryInsuranceTotal)
    });
  } else {
    Object.entries(expenseCategories.insurance || {}).forEach(([itemKey, item]) => {
      if (itemKey === "life") {
        Object.entries(item || {}).forEach(([memberName, lItem]) => {
          const monthlyAmount = getLifeMemberMonthlyTotal(lItem);
          if (monthlyAmount > 0) {
            expenseBreakdown.push({
              name: `Life Insurance Premium (${memberName})`,
              category: getCategoryLabel("insurance"),
              value: monthlyAmount
            });
          }
        });
      } else if (itemKey !== "policyDocs" && item?.value !== void 0) {
        const monthlyAmount = convertToMonthly(item.value, item.frequency);
        if (monthlyAmount > 0) {
          expenseBreakdown.push({
            name: getItemLabel(itemKey),
            category: getCategoryLabel("insurance"),
            value: monthlyAmount
          });
        }
      }
    });
  }
  const totalSavings = savingsSum;
  const disposableIncome = surplus - totalSavings;
  const disposableIncomeRate = totalIncome > 0 ? disposableIncome / totalIncome * 100 : 0;
  return {
    totalIncome,
    categorySums,
    totalExpenses,
    totalSavings,
    surplus,
    disposableIncome,
    surplusRate,
    disposableIncomeRate,
    householdRatio,
    emiRatio,
    insuranceRatio,
    savingsRatio,
    expenseBreakdown,
    isHealthy: surplusRate >= 20,
    isCritical: surplusRate < 0 || disposableIncome < 0
  };
};
var getCategoryLabel = (key) => {
  const labels = {
    household: "Household & Lifestyle",
    emi: "EMIs",
    insurance: "Insurance Premiums",
    savings: "Savings & Investments"
  };
  return labels[key] || key;
};
var getItemLabel = (key) => {
  const labels = {
    // Household & Lifestyle
    grocery: "Household (Grocery, LPG, Fuel etc.)",
    rent: "House Rent",
    education: "Children Education",
    lifestyle: "Lifestyle (Shopping, Movies, Dinner etc.)",
    medical: "Medical Expenses",
    travel: "Travel",
    // EMIs
    personalLoan: "Personal Loan EMI",
    homeLoan: "Home Loan EMI",
    educationLoan: "Education Loan EMI",
    carLoan: "Car Loan EMI",
    twoWheelerLoan: "Two Wheeler Loan EMI",
    otherEmi: "Other EMIs",
    // Insurance
    health: "Health Insurance Premium",
    car: "Car Insurance Premium",
    bike: "Two-wheeler Insurance Premium",
    life: "Life Insurance Premium",
    others: "Other Insurance Premiums",
    // Savings & Investments
    rd: "RD",
    fd: "FD",
    lifeInsurance: "Life Insurance",
    ppf: "PPF",
    nps: "NPS",
    mfSip: "MFs \u2013 SIP",
    sip: "Mutual Fund SIPs",
    otherSaving: "Other Saving"
  };
  return labels[key] || key;
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

// apps/web/src/components/GoalModule/GoalLogic.js
var calculateFutureCost = (presentValue, years, inflationRate) => {
  const pv = parseFloat(presentValue) || 0;
  const n = parseFloat(years) || 0;
  const i = (parseFloat(inflationRate) || 0) / 100;
  const futureCost = pv * Math.pow(1 + i, n);
  return Math.round(futureCost);
};

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

// apps/web/src/components/SummaryReport/FutureSelfLogic.js
var HORIZON_YEARS = 5;
var DEFAULT_INVESTMENT_CAGR = 12;
var DEFAULT_GOAL_INFLATION = 6;
var computeRequiredMonthlySIP = (targetCorpus, annualRate = DEFAULT_INVESTMENT_CAGR, years = 1) => {
  const fv = parseFloat(targetCorpus) || 0;
  const y = Math.max(years, 1 / 12);
  if (fv <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = y * 12;
  const factor = (Math.pow(1 + r, n) - 1) / r * (1 + r);
  if (factor <= 0) return 0;
  return Math.round(fv / factor);
};
var getValidGoals = (goals) => (goals || []).filter((g) => (parseFloat(g.presentValue) || 0) > 0 && (parseFloat(g.yearsToGoal) || 0) > 0);
var getMonthlyInvestmentForProjection = (expenseCategories = {}) => {
  const growthAmount = getGrowthSavingsMonthly(expenseCategories);
  if (growthAmount > 0) {
    return { amount: growthAmount, source: "detailed_growth" };
  }
  const summaryInvest = parseFloat(expenseCategories.summaryMonthlyInvestments) || 0;
  if (summaryInvest > 0) {
    return { amount: summaryInvest, source: "summary_consolidated" };
  }
  return { amount: 0, source: "none" };
};
var buildCashFlowSnapshot = (cashFlowResults, expenseCategories) => {
  const monthlyIncome = cashFlowResults?.totalIncome || 0;
  const householdMonthly = cashFlowResults?.categorySums?.household || 0;
  const emiMonthly = cashFlowResults?.categorySums?.emi || 0;
  const insuranceMonthly = cashFlowResults?.categorySums?.insurance || 0;
  const savingsMonthly = cashFlowResults?.totalSavings || 0;
  const fixedOutflow = emiMonthly + insuranceMonthly + savingsMonthly;
  const monthlyCommitted = householdMonthly + fixedOutflow;
  const monthlySurplus = Math.max(0, monthlyIncome - monthlyCommitted);
  const { amount: currentMonthlyInvestment, source: investmentProjectionSource } = getMonthlyInvestmentForProjection(expenseCategories);
  return {
    monthlyIncome,
    householdMonthly,
    emiMonthly,
    insuranceMonthly,
    savingsMonthly,
    fixedOutflow,
    monthlyCommitted,
    monthlySurplus,
    currentMonthlyInvestment,
    investmentProjectionSource
  };
};
var enrichGoal = (goal, currentYear = (/* @__PURE__ */ new Date()).getFullYear()) => {
  const presentValue = parseFloat(goal.presentValue) || 0;
  const yearsToGoal = parseFloat(goal.yearsToGoal) || 0;
  const inflationRate = parseFloat(goal.inflationRate) || DEFAULT_GOAL_INFLATION;
  const futureCost = goal.futureValue ? Math.round(parseFloat(goal.futureValue)) : calculateFutureCost(presentValue, yearsToGoal, inflationRate);
  const inflationDelta = Math.max(0, futureCost - Math.round(presentValue));
  const yearsRounded = Math.round(yearsToGoal);
  const targetYear = currentYear + yearsRounded;
  const monthlySipNeeded = computeRequiredMonthlySIP(futureCost, DEFAULT_INVESTMENT_CAGR, yearsToGoal);
  return {
    ...goal,
    presentValueNum: presentValue,
    yearsToGoal,
    yearsRounded,
    yearsDisplay: yearsToGoal < 1 ? "<1 year" : `${yearsRounded} year${yearsRounded === 1 ? "" : "s"}`,
    targetYear,
    futureCost,
    inflationDelta,
    inflationRate,
    monthlySipNeeded
  };
};
var buildDreamsHeadline = (enrichedGoals) => {
  if (!enrichedGoals.length) return "";
  return [...enrichedGoals].sort((a, b) => a.targetYear - b.targetYear || a.yearsToGoal - b.yearsToGoal).map((g) => `${g.name} in ${g.targetYear}.`).join(" ");
};
var projectFutureSurplusFV = ({
  monthlyIncome,
  householdMonthly,
  fixedOutflow,
  yearsToGoal,
  incomeGrowthPct,
  householdInflationPct,
  cagrPct = DEFAULT_INVESTMENT_CAGR
}) => {
  const totalMonths = Math.max(1, Math.round(yearsToGoal * 12));
  const r = cagrPct / 100 / 12;
  let balance = 0;
  let monthIndex = 0;
  let yearIndex = 0;
  while (monthIndex < totalMonths) {
    const income = monthlyIncome * Math.pow(1 + incomeGrowthPct / 100, yearIndex);
    const household = householdMonthly * Math.pow(1 + householdInflationPct / 100, yearIndex);
    const surplus = Math.max(0, income - household - fixedOutflow);
    for (let m = 0; m < 12 && monthIndex < totalMonths; m++) {
      balance = balance * (1 + r) + surplus;
      monthIndex++;
    }
    yearIndex++;
  }
  return Math.round(balance);
};
var buildGoalReadiness = (enrichedGoal, cashSnapshot, inflationRates) => {
  const incomeGrowthPct = parseFloat(inflationRates?.incomeIncrement) || 10;
  const householdInflationPct = parseFloat(inflationRates?.householdInflation) || 6;
  const projectedCurrentSips = computeSIPProjection(
    cashSnapshot.currentMonthlyInvestment,
    DEFAULT_INVESTMENT_CAGR,
    enrichedGoal.yearsToGoal
  ).futureValue;
  const projectedFutureSurplus = projectFutureSurplusFV({
    monthlyIncome: cashSnapshot.monthlyIncome,
    householdMonthly: cashSnapshot.householdMonthly,
    fixedOutflow: cashSnapshot.fixedOutflow,
    yearsToGoal: enrichedGoal.yearsToGoal,
    incomeGrowthPct,
    householdInflationPct
  });
  const totalProjected = projectedCurrentSips + projectedFutureSurplus;
  const futureCost = enrichedGoal.futureCost;
  const gap = Math.max(0, futureCost - totalProjected);
  const isAchievable = totalProjected >= futureCost;
  const coveragePercent = futureCost > 0 ? Math.min(100, Math.round(totalProjected / futureCost * 100)) : 0;
  return {
    ...enrichedGoal,
    projectedCurrentSips,
    projectedFutureSurplus,
    totalProjected,
    gap,
    isAchievable,
    coveragePercent,
    incomeGrowthPct,
    householdInflationPct,
    investmentProjectionSource: cashSnapshot.investmentProjectionSource,
    comfortableMessage: "Your current financial path indicates that this goal is comfortably achievable if your savings and income trends continue as expected.",
    gapMessage: "Based on current projections, there may be a gap between the resources available and the estimated future cost of this goal."
  };
};
var buildIncomeJourney = (cashSnapshot, inflationRates, currentYear = (/* @__PURE__ */ new Date()).getFullYear()) => {
  const incomeGrowthPct = parseFloat(inflationRates?.incomeIncrement) || 10;
  const householdInflationPct = parseFloat(inflationRates?.householdInflation) || 6;
  const baseIncome = cashSnapshot.monthlyIncome;
  const points = [];
  for (let i = 0; i <= HORIZON_YEARS; i++) {
    points.push({
      index: i,
      label: i === 0 ? "Today" : String(currentYear + i),
      year: currentYear + i,
      monthlyIncome: Math.round(baseIncome * Math.pow(1 + incomeGrowthPct / 100, i))
    });
  }
  const householdAtHorizon = Math.round(
    cashSnapshot.householdMonthly * Math.pow(1 + householdInflationPct / 100, HORIZON_YEARS)
  );
  const horizonYear = currentYear + HORIZON_YEARS;
  return {
    points,
    incomeGrowthPct,
    householdInflationPct,
    householdAtHorizon,
    horizonYear,
    monthlySurplus: cashSnapshot.monthlySurplus,
    monthlyCommitted: cashSnapshot.monthlyCommitted
  };
};
var buildFutureSelfReport = ({
  goals,
  cashFlowResults,
  expenseCategories,
  inflationRates,
  currentYear = (/* @__PURE__ */ new Date()).getFullYear()
}) => {
  const cashSnapshot = buildCashFlowSnapshot(cashFlowResults, expenseCategories);
  const validGoals = getValidGoals(goals);
  const enrichedGoals = validGoals.map((g) => enrichGoal(g, currentYear));
  const goalReadiness = enrichedGoals.map((g) => buildGoalReadiness(g, cashSnapshot, inflationRates)).sort((a, b) => a.targetYear - b.targetYear || a.yearsToGoal - b.yearsToGoal);
  return {
    cashSnapshot,
    enrichedGoals,
    dreamsHeadline: buildDreamsHeadline(enrichedGoals),
    incomeJourney: buildIncomeJourney(cashSnapshot, inflationRates, currentYear),
    goalReadiness,
    hasIncomeData: cashSnapshot.monthlyIncome > 0,
    hasGoals: enrichedGoals.length > 0
  };
};

// apps/web/src/components/SummaryReport/ExecutiveSummaryLogic.js
var SCORE_BANDS = {
  overall: [
    { min: 81, label: "Financially Resilient" },
    { min: 61, label: "Strong" },
    { min: 41, label: "Stable" },
    { min: 21, label: "Developing" },
    { min: 0, label: "Vulnerable" }
  ],
  pillar: [
    { min: 16, label: "Strong" },
    { min: 11, label: "Progressing" },
    { min: 6, label: "Needs Attention" },
    { min: 0, label: "Critical" }
  ]
};
var GRADE_SCALE = {
  overall: [
    { min: 81, grade: "Grade A", label: "Financially Resilient (Honors)" },
    { min: 61, grade: "Grade B+", label: "Strong Merit" },
    { min: 41, grade: "Grade C", label: "Passing Grade" },
    { min: 21, grade: "Grade D", label: "Needs Improvement" },
    { min: 0, grade: "Grade F", label: "Critical Attention Required" }
  ],
  pillar: [
    { min: 16, grade: "Grade A", label: "Strong" },
    { min: 11, grade: "Grade B", label: "Progressing" },
    { min: 6, grade: "Grade C", label: "Needs Attention" },
    { min: 0, grade: "Grade F", label: "Critical" }
  ]
};
var pickOverallGrade = (score) => GRADE_SCALE.overall.find((g) => score >= g.min) || GRADE_SCALE.overall.at(-1);
var pickPillarGrade = (score) => GRADE_SCALE.pillar.find((g) => score >= g.min) || GRADE_SCALE.pillar.at(-1);
var toNum = (value) => parseFloat(value) || 0;
var toLakh = (amount) => toNum(amount) / 1e5;
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var pickOverallBand = (score) => SCORE_BANDS.overall.find((band) => score >= band.min) || SCORE_BANDS.overall.at(-1);
var pickPillarBand = (score) => SCORE_BANDS.pillar.find((band) => score >= band.min) || SCORE_BANDS.pillar.at(-1);
var scoreSurplusRatio = (ratio) => {
  if (ratio < 0.05) return 0;
  if (ratio < 0.1) return 5;
  if (ratio < 0.2) return 10;
  if (ratio < 0.3) return 15;
  return 20;
};
var scoreEmergencyMonths = (months) => {
  if (months < 1) return 0;
  if (months < 3) return 5;
  if (months < 6) return 10;
  if (months < 9) return 15;
  return 20;
};
var scoreLifeRatio = (ratio) => {
  if (ratio < 0.25) return 0;
  if (ratio < 0.5) return 5;
  if (ratio < 0.75) return 8;
  return 10;
};
var scoreHealthCover = (coverLakh) => {
  if (coverLakh <= 0) return 0;
  if (coverLakh < 5) return 2;
  if (coverLakh < 10) return 5;
  if (coverLakh <= 20) return 8;
  return 10;
};
var scoreInvestmentRatio = (ratio) => {
  if (ratio < 0.05) return 0;
  if (ratio < 0.1) return 5;
  if (ratio < 0.15) return 10;
  if (ratio < 0.2) return 15;
  return 20;
};
var scoreGoalCoverage = (coveragePct) => {
  if (coveragePct < 25) return 0;
  if (coveragePct < 50) return 5;
  if (coveragePct < 75) return 10;
  if (coveragePct <= 100) return 15;
  return 20;
};
var buildDailyInterpretation = (score) => {
  if (score <= 5) return "Your monthly finances feel stretched, leaving very little room for sudden shocks.";
  if (score <= 10) return "You have some breathing space, but recurring pressure can still disrupt your plans.";
  if (score <= 15) return "Your day-to-day cash flow is reasonably healthy and supports better financial control.";
  return "You have strong monthly flexibility, which gives your family confidence and decision power.";
};
var buildEmergencyInterpretation = (score) => {
  if (score <= 5) return "A prolonged income interruption could quickly put your household under stress.";
  if (score <= 10) return "You have a basic cushion, but longer uncertainty can still create financial anxiety.";
  if (score <= 15) return "Your emergency reserves can absorb short-to-medium shocks with manageable pressure.";
  return "Your emergency buffer is strong and gives your family meaningful resilience in uncertain times.";
};
var buildFamilyInterpretation = (score) => {
  if (score <= 5) return "Protection gaps are significant, and your family could face serious financial strain during a crisis.";
  if (score <= 10) return "Some protection is in place, but key risks still remain uncovered.";
  if (score <= 15) return "Your family has a fair protection base, though important coverage gaps should be closed.";
  return "Life and health protection are strong, helping secure your family through major uncertainties.";
};
var buildWealthInterpretation = (score) => {
  if (score <= 5) return "A small portion of income is currently compounding for your future wealth.";
  if (score <= 10) return "Your investing habit has started, but scale is still below long-term potential.";
  if (score <= 15) return "You are steadily converting income into future wealth through disciplined investments.";
  return "Your wealth-building discipline is strong and creates a powerful compounding runway.";
};
var buildGoalsInterpretation = (score) => {
  if (score <= 5) return "Most goals are currently underfunded, so timelines may feel uncertain.";
  if (score <= 10) return "You are making progress, but goal funding still needs stronger momentum.";
  if (score <= 15) return "Most goals are on track, with only moderate shortfalls to address.";
  return "Your goals are strongly funded and your future plans are in a confident position.";
};
var buildOverallNarrative = ({ score, category, topPillars, bottomPillars }) => {
  const strongest = topPillars.map((p) => p.shortName).join(", ");
  const weakAreas = bottomPillars.map((p) => p.shortName).join(", ");
  if (score <= 40) {
    return `Your Financial Readiness Score is ${score}/100 (${category}). This is an important moment to pause and protect your family's stability. Start by improving ${weakAreas}, and you can create a much safer foundation over the next few months.`;
  }
  if (score <= 60) {
    return `Your Financial Readiness Score is ${score}/100 (${category}). You already have a base to build on, especially in ${strongest}. Strengthening ${weakAreas} now can meaningfully improve your family's confidence and long-term resilience.`;
  }
  return `Your Financial Readiness Score is ${score}/100 (${category}). Your financial base is strong, with clear strength in ${strongest}. By continuing to improve ${weakAreas}, you can move closer to lasting financial resilience and peace of mind.`;
};
var buildWeightedConfidence = ({ monthlyIncome, monthlyNeed, coverageRequired, goalsCount, healthCover }) => {
  const pillarCompleteness = {
    "daily-stability": monthlyIncome > 0 ? 1 : 0,
    emergency: monthlyNeed > 0 ? 1 : 0,
    "family-protection": (coverageRequired > 0 ? 0.6 : 0) + (healthCover > 0 ? 0.4 : 0),
    "wealth-building": monthlyIncome > 0 ? 1 : 0,
    "goal-readiness": goalsCount > 0 ? 1 : 0
  };
  const weights = {
    "daily-stability": 20,
    emergency: 20,
    "family-protection": 20,
    "wealth-building": 20,
    "goal-readiness": 20
  };
  const weightedScore = Object.entries(weights).reduce((sum, [pillar, weight]) => {
    return sum + (pillarCompleteness[pillar] || 0) * weight;
  }, 0);
  const confidencePct = Math.round(weightedScore);
  const confidenceBand = confidencePct >= 85 ? "High confidence" : confidencePct >= 60 ? "Moderate confidence" : "Low confidence";
  return {
    confidencePct,
    confidenceBand,
    pillarCompleteness
  };
};
var buildRoadmap = (pillars) => {
  const lowPillars = [...pillars].sort((a, b) => a.score - b.score).slice(0, 3);
  const roadmap = {
    "30-day": [],
    "90-day": [],
    "1-year": []
  };
  lowPillars.forEach((pillar) => {
    if (pillar.id === "daily-stability") {
      roadmap["30-day"].push("Track discretionary spending weekly and trim high-leak categories.");
      roadmap["90-day"].push("Reduce one high-cost EMI or recurring expense to improve monthly surplus.");
      roadmap["1-year"].push("Maintain a consistent surplus ratio above 20% for sustained flexibility.");
    }
    if (pillar.id === "emergency") {
      roadmap["30-day"].push("Start a dedicated emergency account with automatic monthly transfers.");
      roadmap["90-day"].push("Build emergency reserves toward at least 3 months of expenses.");
      roadmap["1-year"].push("Reach and maintain a 6+ month emergency buffer.");
    }
    if (pillar.id === "family-protection") {
      roadmap["30-day"].push("Review life and health coverage gaps for all key family members.");
      roadmap["90-day"].push("Close high-priority protection gaps with suitable term and health cover.");
      roadmap["1-year"].push("Re-evaluate protection needs after major life events and income changes.");
    }
    if (pillar.id === "wealth-building") {
      roadmap["30-day"].push("Increase SIP allocation from surplus with an automated monthly schedule.");
      roadmap["90-day"].push("Target a stable investing ratio above 10% of monthly income.");
      roadmap["1-year"].push("Progressively increase wealth allocation to 15-20% as income grows.");
    }
    if (pillar.id === "goal-readiness") {
      roadmap["30-day"].push("Prioritize top goals and review current funding shortfalls.");
      roadmap["90-day"].push("Assign incremental monthly contributions to underfunded goals.");
      roadmap["1-year"].push("Rebalance goal funding plan annually to stay timeline-aligned.");
    }
  });
  return roadmap;
};
var buildUpliftOpportunities = ({
  monthlyIncome,
  emergencyCoverageMonths,
  surplusRatio,
  wealthRatio,
  lifeCoverageRatio,
  healthCoverLakh,
  goalsAvgCoveragePct,
  dailyScore,
  emergencyScore,
  familyScore,
  wealthScore,
  goalScore
}) => {
  const opportunities = [];
  const targetEmergencyMonths = 6;
  const improvedEmergency = scoreEmergencyMonths(targetEmergencyMonths);
  if (improvedEmergency > emergencyScore) {
    opportunities.push({
      key: "emergency-6m",
      label: "Build emergency fund to 6 months",
      uplift: improvedEmergency - emergencyScore
    });
  }
  const targetWealthRatio = Math.max(0.15, wealthRatio);
  const improvedWealth = scoreInvestmentRatio(targetWealthRatio);
  if (improvedWealth > wealthScore && monthlyIncome > 0) {
    opportunities.push({
      key: "wealth-15",
      label: "Increase investment ratio to 15%",
      uplift: improvedWealth - wealthScore
    });
  }
  const targetDailyRatio = Math.max(0.2, surplusRatio);
  const improvedDaily = scoreSurplusRatio(targetDailyRatio);
  if (improvedDaily > dailyScore && monthlyIncome > 0) {
    opportunities.push({
      key: "daily-20",
      label: "Improve surplus ratio to 20%",
      uplift: improvedDaily - dailyScore
    });
  }
  const improvedLife = scoreLifeRatio(Math.max(0.75, lifeCoverageRatio));
  const improvedHealth = scoreHealthCover(Math.max(10, healthCoverLakh));
  const improvedFamily = Math.min(20, improvedLife + improvedHealth);
  if (improvedFamily > familyScore) {
    opportunities.push({
      key: "family-coverage",
      label: "Lift life coverage to 75% and health cover to 10L",
      uplift: improvedFamily - familyScore
    });
  }
  const improvedGoal = scoreGoalCoverage(Math.max(75, goalsAvgCoveragePct));
  if (improvedGoal > goalScore) {
    opportunities.push({
      key: "goals-75",
      label: "Raise average goal readiness to 75%",
      uplift: improvedGoal - goalScore
    });
  }
  return opportunities.sort((a, b) => b.uplift - a.uplift).slice(0, 4);
};
var buildWhatIfScenario = (baseReport, scenarioInput) => {
  const {
    emergencyMonths,
    investmentRatioPct,
    surplusRatioPct,
    lifeCoverageRatioPct,
    healthCoverLakh,
    goalReadinessPct
  } = scenarioInput;
  const nextPillars = baseReport.pillars.map((pillar) => {
    if (pillar.id === "daily-stability") {
      const nextScore = scoreSurplusRatio(clamp((surplusRatioPct || 0) / 100, 0, 5));
      return { ...pillar, score: nextScore };
    }
    if (pillar.id === "emergency") {
      const nextScore = scoreEmergencyMonths(clamp(emergencyMonths || 0, 0, 24));
      return { ...pillar, score: nextScore };
    }
    if (pillar.id === "family-protection") {
      const life = scoreLifeRatio(clamp((lifeCoverageRatioPct || 0) / 100, 0, 5));
      const health = scoreHealthCover(clamp(healthCoverLakh || 0, 0, 100));
      return { ...pillar, score: Math.min(20, life + health) };
    }
    if (pillar.id === "wealth-building") {
      const nextScore = scoreInvestmentRatio(clamp((investmentRatioPct || 0) / 100, 0, 5));
      return { ...pillar, score: nextScore };
    }
    if (pillar.id === "goal-readiness") {
      const nextScore = scoreGoalCoverage(clamp(goalReadinessPct || 0, 0, 400));
      return { ...pillar, score: nextScore };
    }
    return pillar;
  });
  const nextTotal = nextPillars.reduce((sum, pillar) => sum + pillar.score, 0);
  const nextCategory = pickOverallBand(nextTotal).label;
  return {
    nextTotal,
    nextCategory,
    uplift: nextTotal - baseReport.totalScore
  };
};
var buildExecutiveSummaryReport = ({
  income,
  expenseCategories,
  assetCategories,
  summaryLifeCover,
  summaryHealthCover,
  contingencyFund,
  goals,
  inflationRates,
  familyMembers = [],
  hasSpouseIncome,
  policies = [],
  hasHealthInsurance = null,
  liabilityCategories = {},
  calculatorInputs = {}
}) => {
  const cashFlow = calculateCashFlow(income, expenseCategories, familyMembers, hasSpouseIncome);
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
  const emergencyCash = getEmergencyFundAmount(assetCategories, contingencyFund);
  const contingencyData = calculateContingencyData(expenseCategories, emergencyCash, familyMembers);
  const healthData = calculateHealthInsuranceData(
    summaryHealthCover,
    hasHealthInsurance,
    familyMembers,
    policies
  );
  const futureSelfReport = buildFutureSelfReport({
    goals,
    cashFlowResults: cashFlow,
    expenseCategories,
    inflationRates
  });
  const monthlyIncome = cashFlow.totalIncome;
  const monthlyExpenses = cashFlow.categorySums?.household || 0;
  const monthlyEmi = cashFlow.categorySums?.emi || 0;
  const monthlyInvestments = cashFlow.totalSavings || 0;
  const monthlySurplus = cashFlow.surplus;
  const surplusRatio = monthlyIncome > 0 ? monthlySurplus / monthlyIncome : 0;
  const dailyScore = monthlyIncome > 0 ? scoreSurplusRatio(Math.max(0, surplusRatio)) : 0;
  const emergencyCoverageMonths = contingencyData.monthsCoveredByFund || 0;
  const emergencyScore = contingencyData.monthlyNeed > 0 ? scoreEmergencyMonths(emergencyCoverageMonths) : 0;
  const lifeCoverageRatio = protectionData.coverageRequired > 0 ? protectionData.coverageHave / protectionData.coverageRequired : 0;
  const lifeScore = protectionData.coverageRequired > 0 ? scoreLifeRatio(Math.max(0, lifeCoverageRatio)) : 0;
  const healthCoverLakh = toLakh(healthData.coverageHave);
  const healthScore = scoreHealthCover(healthCoverLakh);
  const familyScore = Math.min(20, lifeScore + healthScore);
  const wealthRatio = monthlyIncome > 0 ? monthlyInvestments / monthlyIncome : 0;
  const wealthScore = monthlyIncome > 0 ? scoreInvestmentRatio(Math.max(0, wealthRatio)) : 0;
  const goalReadinessRows = futureSelfReport.enrichedGoals.map(
    (goal) => buildGoalReadiness(goal, futureSelfReport.cashSnapshot, inflationRates)
  );
  const goalScores = goalReadinessRows.map((goal) => scoreGoalCoverage(goal.coveragePercent || 0));
  const averageGoalCoveragePct = goalReadinessRows.length ? goalReadinessRows.reduce((sum, goal) => sum + (goal.coveragePercent || 0), 0) / goalReadinessRows.length : 0;
  const goalScore = goalScores.length ? Math.round(goalScores.reduce((sum, s) => sum + s, 0) / goalScores.length) : 0;
  const pillars = [
    {
      id: "daily-stability",
      name: "Daily Financial Stability",
      shortName: "daily stability",
      icon: "wallet",
      score: dailyScore,
      metricLabel: "Surplus ratio",
      metricValue: `${Math.round(Math.max(0, surplusRatio) * 100)}%`,
      interpretation: buildDailyInterpretation(dailyScore),
      dataNote: monthlyIncome <= 0 ? "Scored conservatively due to missing income data." : ""
    },
    {
      id: "emergency",
      name: "Emergency Preparedness",
      shortName: "emergency readiness",
      icon: "shield",
      score: emergencyScore,
      metricLabel: "Coverage",
      metricValue: `${(Math.round(emergencyCoverageMonths * 10) / 10).toFixed(1)} months`,
      interpretation: buildEmergencyInterpretation(emergencyScore),
      dataNote: contingencyData.monthlyNeed <= 0 ? "Scored conservatively due to missing expense data." : ""
    },
    {
      id: "family-protection",
      name: "Family Protection",
      shortName: "family protection",
      icon: "heart",
      score: familyScore,
      metricLabel: "Life + Health",
      metricValue: `${lifeScore}/10 + ${healthScore}/10`,
      interpretation: buildFamilyInterpretation(familyScore),
      dataNote: protectionData.coverageRequired <= 0 ? "Life score kept conservative due to limited expense inputs." : ""
    },
    {
      id: "wealth-building",
      name: "Wealth Building Capacity",
      shortName: "wealth building",
      icon: "trending-up",
      score: wealthScore,
      metricLabel: "Investment ratio",
      metricValue: `${Math.round(Math.max(0, wealthRatio) * 100)}%`,
      interpretation: buildWealthInterpretation(wealthScore),
      dataNote: monthlyIncome <= 0 ? "Scored conservatively due to missing income data." : ""
    },
    {
      id: "goal-readiness",
      name: "Goal Readiness",
      shortName: "goal readiness",
      icon: "target",
      score: goalScore,
      metricLabel: "Average goal score",
      metricValue: goalReadinessRows.length ? `${goalReadinessRows.length} goal(s)` : "No goals",
      interpretation: buildGoalsInterpretation(goalScore),
      dataNote: goalReadinessRows.length === 0 ? "Scored conservatively because goal data is unavailable." : ""
    }
  ].map((pillar) => ({
    ...pillar,
    band: pickPillarBand(pillar.score).label,
    grade: pickPillarGrade(pillar.score).grade
  }));
  const totalScore = pillars.reduce((sum, pillar) => sum + pillar.score, 0);
  const overallBand = pickOverallBand(totalScore);
  const overallGradeInfo = pickOverallGrade(totalScore);
  const ranked = [...pillars].sort((a, b) => b.score - a.score);
  const topPillars = ranked.slice(0, 2);
  const bottomPillars = [...ranked].reverse().slice(0, 3);
  const actionPriorities = [...pillars].sort((a, b) => a.score - b.score).slice(0, 3).map((pillar) => {
    if (pillar.id === "daily-stability") {
      return "Improve monthly surplus by reducing avoidable expenses or high-cost EMIs.";
    }
    if (pillar.id === "emergency") {
      return "Build liquid emergency reserves toward at least 6 months of expenses and EMIs.";
    }
    if (pillar.id === "family-protection") {
      return "Close life and health coverage gaps to protect your family against major risks.";
    }
    if (pillar.id === "wealth-building") {
      return "Increase monthly SIPs and disciplined investments to improve wealth conversion.";
    }
    return "Review each goal plan and increase funding pace for underprepared goals.";
  });
  const confidence = buildWeightedConfidence({
    monthlyIncome,
    monthlyNeed: contingencyData.monthlyNeed,
    coverageRequired: protectionData.coverageRequired,
    goalsCount: goalReadinessRows.length,
    healthCover: toNum(healthData.coverageHave)
  });
  const roadmap = buildRoadmap(pillars);
  const upliftOpportunities = buildUpliftOpportunities({
    monthlyIncome,
    emergencyCoverageMonths,
    surplusRatio: Math.max(0, surplusRatio),
    wealthRatio: Math.max(0, wealthRatio),
    lifeCoverageRatio: Math.max(0, lifeCoverageRatio),
    healthCoverLakh,
    goalsAvgCoveragePct: averageGoalCoveragePct,
    dailyScore,
    emergencyScore,
    familyScore,
    wealthScore,
    goalScore
  });
  return {
    totalScore,
    overallCategory: overallBand.label,
    overallGrade: overallGradeInfo.grade,
    overallGradeLabel: overallGradeInfo.label,
    pillars,
    topPillars,
    bottomPillars,
    actionPriorities,
    confidence,
    roadmap,
    upliftOpportunities,
    baseMetrics: {
      emergencyMonths: Math.round(emergencyCoverageMonths * 10) / 10,
      investmentRatioPct: Math.round(Math.max(0, wealthRatio) * 100),
      surplusRatioPct: Math.round(Math.max(0, surplusRatio) * 100),
      lifeCoverageRatioPct: Math.round(Math.max(0, lifeCoverageRatio) * 100),
      healthCoverLakh: Math.round(healthCoverLakh),
      goalReadinessPct: Math.round(averageGoalCoveragePct)
    },
    narrative: buildOverallNarrative({
      score: totalScore,
      category: overallBand.label,
      topPillars,
      bottomPillars
    })
  };
};
export {
  GRADE_SCALE,
  buildExecutiveSummaryReport,
  buildWhatIfScenario,
  pickOverallGrade,
  pickPillarGrade
};
