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
var LEDGER_SYNC_KEYS = ["income", "household", "emi", "insurance", "savings"];
function syncLedgerFromMonthlyTotals(ledger, totals = {}) {
  const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
  const prev = ledger || {};
  const monthlyTotals = {
    income: 0,
    household: 0,
    emi: 0,
    insurance: 0,
    savings: 0,
    ...totals
  };
  let changed = false;
  const next = { ...prev };
  LEDGER_SYNC_KEYS.forEach((key) => {
    const sum = Math.round(monthlyTotals[key]) || 0;
    const prevArr = prev[key] || Array(12).fill(0);
    const newArr = [...prevArr];
    for (let i = currentMonth; i < 12; i++) {
      if (newArr[i] !== sum) {
        newArr[i] = sum;
        changed = true;
      }
    }
    next[key] = newArr;
  });
  const nextAdjustment = monthlyTotals.taxAdjustment ?? prev.taxAdjustment ?? Array(12).fill(0);
  const adjustmentChanged = JSON.stringify(nextAdjustment) !== JSON.stringify(prev.taxAdjustment || Array(12).fill(0));
  if (!changed && !adjustmentChanged) return prev;
  return {
    ...next,
    taxAdjustment: nextAdjustment
  };
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
var formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};
export {
  calculateCashFlow,
  formatCurrency,
  syncLedgerFromMonthlyTotals
};
