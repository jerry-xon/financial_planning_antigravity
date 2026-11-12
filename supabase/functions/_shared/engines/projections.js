// apps/web/src/components/DetailedFlow/employmentTypeSync.js
function guessEmploymentTypeFromSummaryOccupation(occupation) {
  if (occupation === "Business / Profession") return "Business Owner";
  if (occupation === "Salaried") return "Private Sector";
  return "";
}
function resolveEmploymentType(member) {
  return member?.employmentType || guessEmploymentTypeFromSummaryOccupation(member?.occupation) || "Private Sector";
}

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
function isEducationInHouseholdBaseline(familyMembers = [], household = {}) {
  return sumChildrenMonthlyEducation(familyMembers) > 0 || parseFloat(household.education) > 0;
}

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

// apps/web/src/components/DetailedFlow/insuranceDetailSync.js
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
var STUDIO_PROTECTION_ALLOC_TYPES = [
  "Term Insurance",
  "Life Insurance",
  "Life Insurance Saving Plans",
  "Health Insurance"
];
function policyHasProjectionPremium(policy = {}) {
  const startDate = new Date(policy.startDate);
  if (Number.isNaN(startDate.getTime())) return false;
  const payTerm = parseInt(policy.paymentTerm, 10) || 0;
  const premium = parseFloat(policy.premium) || 0;
  return payTerm > 0 && premium > 0;
}
function shouldIncludeStudioInsuranceInProjections(alloc = {}, policies = []) {
  if (!STUDIO_PROTECTION_ALLOC_TYPES.includes(alloc.type)) return false;
  const allocId = alloc.id != null ? String(alloc.id) : null;
  const linked = (policies || []).filter((p) => {
    if (allocId == null) return false;
    return String(p.sourceAllocationId) === allocId || String(p.absorbedAllocationId) === allocId;
  });
  if (alloc.absorbedByPolicyId != null && alloc.absorbedByPolicyId !== "") {
    const absorbed = (policies || []).find(
      (p) => String(p.id) === String(alloc.absorbedByPolicyId)
    );
    if (absorbed && policyHasProjectionPremium(absorbed)) return false;
    if (!absorbed && linked.some(policyHasProjectionPremium)) return false;
    if (absorbed) return false;
  }
  if (linked.length === 0) return true;
  return !linked.some(policyHasProjectionPremium);
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
function hasConfiguredLoan(emi = {}) {
  return ["personalLoan", "homeLoan", "educationLoan", "carLoan", "twoWheelerLoan", "otherEmi"].some(
    (key) => emi[key] !== null && typeof emi[key] === "object" && emi[key].principal > 0
  );
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
var isGovernmentSector = (employmentType) => employmentType === "Government Sector";
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
function sumOtherIncomeAnnual(otherIncome = []) {
  return otherIncome.reduce((sum, item) => sum + parseAmount(item?.amount) * 12, 0);
}
var TAX_SLIP_MONTHLY_KEYS = ["basicPay", "dearnessAllowance", "houseRentAllowance", "allowances"];
function hasTaxSlipEarnings(detail) {
  const earnings = detail?.taxPlanning?.earnings || {};
  if (TAX_SLIP_MONTHLY_KEYS.some((key) => parseAmount(earnings[key]) > 0)) return true;
  if (parseAmount(earnings.other?.amount) > 0) return true;
  if (parseAmount(earnings.performanceBonus) > 0) return true;
  if (parseAmount(earnings.bonus) > 0) return true;
  return parseAmount(earnings.leaveEncashment) > 0;
}
function computeAnnualSalaryFromTaxSlip(detail, employmentType) {
  const earnings = detail?.taxPlanning?.earnings || {};
  const monthlyComponents = TAX_SLIP_MONTHLY_KEYS.reduce(
    (sum, key) => sum + parseAmount(earnings[key]),
    0
  );
  let annualExtras = parseAmount(earnings.other?.amount);
  if (isGovernmentSector(employmentType)) {
    annualExtras += parseAmount(earnings.bonus) + parseAmount(earnings.leaveEncashment);
  } else {
    annualExtras += parseAmount(earnings.performanceBonus);
  }
  return monthlyComponents * 12 + annualExtras;
}
var STANDARD_DEDUCTION = 75e3;
function buildTaxInput(detail, employmentType) {
  const d = { ...createEmptyIncomeDetail(), ...detail };
  const otherIncomeAnnual = sumOtherIncomeAnnual(d.otherIncome);
  if (isSalariedEmployment(employmentType)) {
    if (d.needTaxPlanning !== true) {
      return null;
    }
    const usedTaxSlip = hasTaxSlipEarnings(d);
    if (!usedTaxSlip) {
      return null;
    }
    const annualSalary = computeAnnualSalaryFromTaxSlip(d, employmentType);
    const incomeFromSalary = Math.max(0, annualSalary - STANDARD_DEDUCTION);
    const taxableIncome = incomeFromSalary + otherIncomeAnnual;
    return {
      annualSalary,
      incomeFromSalary,
      otherIncomeAnnual,
      standardDeduction: STANDARD_DEDUCTION,
      taxableIncome,
      grossTotalIncome: annualSalary + otherIncomeAnnual,
      usedTaxSlip: true,
      employmentType
    };
  }
  if (isBusinessEmployment(employmentType)) {
    const businessAnnual = (parseAmount(d.takeHomeProfit) + parseAmount(d.passiveIncome)) * 12;
    const taxableIncome = businessAnnual + otherIncomeAnnual;
    return {
      annualSalary: businessAnnual,
      incomeFromSalary: businessAnnual,
      otherIncomeAnnual,
      standardDeduction: 0,
      taxableIncome,
      grossTotalIncome: taxableIncome,
      usedTaxSlip: false,
      employmentType
    };
  }
  if (isPensionerEmployment(employmentType)) {
    const pensionAnnual = parseAmount(d.netPension) * 12;
    const incomeFromSalary = Math.max(0, pensionAnnual - STANDARD_DEDUCTION);
    const taxableIncome = incomeFromSalary + otherIncomeAnnual;
    return {
      annualSalary: pensionAnnual,
      incomeFromSalary,
      otherIncomeAnnual,
      standardDeduction: STANDARD_DEDUCTION,
      taxableIncome,
      grossTotalIncome: pensionAnnual + otherIncomeAnnual,
      usedTaxSlip: false,
      employmentType
    };
  }
  return null;
}
var scaleAmountField = (value, factor) => {
  if (factor === 1) return value ?? "";
  const amount = parseFloat(value);
  if (!amount) return value ?? "";
  return String(Math.round(amount * factor));
};
var TAX_SLIP_EARNINGS_KEYS = [
  "basicPay",
  "dearnessAllowance",
  "houseRentAllowance",
  "allowances",
  "leaveEncashment",
  "bonus",
  "performanceBonus"
];
var TAX_SLIP_DEDUCTION_KEYS = [
  "employeePF",
  "employeeNPS",
  "groupInsurance",
  "healthScheme",
  "groupPersonalAccident",
  "groupMedicalCoverage",
  "incomeTax"
];
function computeDerivedMonthlyGrossFromEarnings(detail, employmentType) {
  const earnings = detail?.taxPlanning?.earnings || {};
  const monthlyBase = TAX_SLIP_MONTHLY_KEYS.reduce(
    (sum, key) => sum + parseAmount(earnings[key]),
    0
  );
  let monthlyExtras = parseAmount(earnings.other?.amount) / 12;
  if (isGovernmentSector(employmentType)) {
    monthlyExtras += (parseAmount(earnings.bonus) + parseAmount(earnings.leaveEncashment)) / 12;
  } else {
    monthlyExtras += parseAmount(earnings.performanceBonus) / 12;
  }
  return Math.round(monthlyBase + monthlyExtras);
}
function computeDerivedMonthlyInHandFromSlip(detail, employmentType) {
  const gross = computeDerivedMonthlyGrossFromEarnings(detail, employmentType);
  const deductions = computeMonthlyDeductionsFromSalarySlip(detail);
  return Math.round(gross - deductions);
}
function prepareMemberDetailForProjection(detail, employmentType) {
  const base = { ...createEmptyIncomeDetail(), ...detail || {} };
  if (isSalariedEmployment(employmentType) && base.needTaxPlanning === true) {
    return applySalarySlipDerivedTotals(base, employmentType);
  }
  return base;
}
function applySalarySlipDerivedTotals(detail, employmentType) {
  if (detail?.needTaxPlanning !== true || !isSalariedEmployment(employmentType)) {
    return detail;
  }
  const gross = computeDerivedMonthlyGrossFromEarnings(detail, employmentType);
  const inHand = computeDerivedMonthlyInHandFromSlip(detail, employmentType);
  return {
    ...detail,
    grossSalary: gross > 0 ? String(gross) : "",
    inHandSalary: gross > 0 || inHand !== 0 ? String(inHand) : ""
  };
}
function computeMonthlyDeductionsFromSalarySlip(detail) {
  const deductions = detail?.taxPlanning?.deductions || {};
  const fixedTotal = TAX_SLIP_DEDUCTION_KEYS.reduce(
    (sum, key) => sum + parseAmount(deductions[key]),
    0
  );
  return fixedTotal + parseAmount(deductions.other?.amount);
}
function scaleIncomeDetail(detail, factor) {
  const base = { ...createEmptyIncomeDetail(), ...detail };
  if (!detail || factor === 1) return base;
  const scaled = {
    ...base,
    grossSalary: scaleAmountField(base.grossSalary, factor),
    inHandSalary: scaleAmountField(base.inHandSalary, factor),
    takeHomeProfit: scaleAmountField(base.takeHomeProfit, factor),
    netPension: scaleAmountField(base.netPension, factor),
    passiveIncome: scaleAmountField(base.passiveIncome, factor),
    otherIncome: (base.otherIncome || []).map((item) => ({
      ...item,
      amount: scaleAmountField(item?.amount, factor)
    }))
  };
  if (base.taxPlanning) {
    const earnings = base.taxPlanning.earnings || {};
    const deductions = base.taxPlanning.deductions || {};
    const scaledEarnings = { ...earnings };
    TAX_SLIP_EARNINGS_KEYS.forEach((key) => {
      if (earnings[key] !== void 0) {
        scaledEarnings[key] = scaleAmountField(earnings[key], factor);
      }
    });
    if (earnings.other) {
      scaledEarnings.other = {
        ...earnings.other,
        amount: scaleAmountField(earnings.other.amount, factor)
      };
    }
    const scaledDeductions = { ...deductions };
    TAX_SLIP_DEDUCTION_KEYS.forEach((key) => {
      if (deductions[key] !== void 0) {
        scaledDeductions[key] = scaleAmountField(deductions[key], factor);
      }
    });
    if (deductions.other) {
      scaledDeductions.other = {
        ...deductions.other,
        amount: scaleAmountField(deductions.other.amount, factor)
      };
    }
    scaled.taxPlanning = {
      ...base.taxPlanning,
      earnings: scaledEarnings,
      deductions: scaledDeductions
    };
  }
  return scaled;
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

// apps/web/src/components/IncomeTaxModule/IncomeTaxLogic.js
var REBATE_87A_MAX = 6e4;
var REBATE_87A_INCOME_LIMIT = 12e5;
var SURCHARGE_THRESHOLDS = [5e6, 1e7, 2e7];
function calculateSlabTax(taxableIncome) {
  let taxBase = taxableIncome;
  let t1 = 0;
  let t2 = 0;
  let t3 = 0;
  let t4 = 0;
  let t5 = 0;
  let t6 = 0;
  let t7 = 0;
  if (taxBase > 24e5) {
    t7 = (taxBase - 24e5) * 0.3;
    taxBase = 24e5;
  }
  if (taxBase > 2e6) {
    t6 = (taxBase - 2e6) * 0.25;
    taxBase = 2e6;
  }
  if (taxBase > 16e5) {
    t5 = (taxBase - 16e5) * 0.2;
    taxBase = 16e5;
  }
  if (taxBase > 12e5) {
    t4 = (taxBase - 12e5) * 0.15;
    taxBase = 12e5;
  }
  if (taxBase > 8e5) {
    t3 = (taxBase - 8e5) * 0.1;
    taxBase = 8e5;
  }
  if (taxBase > 4e5) {
    t2 = (taxBase - 4e5) * 0.05;
    taxBase = 4e5;
  }
  const totalTax = t1 + t2 + t3 + t4 + t5 + t6 + t7;
  return {
    totalTax,
    slabs: { t1, t2, t3, t4, t5, t6, t7 }
  };
}
function applyRebateAndMarginalRelief(normalTax, taxableIncome) {
  if (taxableIncome <= REBATE_87A_INCOME_LIMIT) {
    const rebate87A = Math.min(normalTax, REBATE_87A_MAX);
    return {
      rebate87A,
      marginalRelief: 0,
      taxAfterRebate: Math.max(0, normalTax - rebate87A)
    };
  }
  const excessIncome = taxableIncome - REBATE_87A_INCOME_LIMIT;
  if (normalTax > excessIncome) {
    return {
      rebate87A: 0,
      marginalRelief: normalTax - excessIncome,
      taxAfterRebate: excessIncome
    };
  }
  return {
    rebate87A: 0,
    marginalRelief: 0,
    taxAfterRebate: normalTax
  };
}
function calculateSurcharge(taxAfterRebate, taxableIncome) {
  if (taxableIncome <= 5e6) return 0;
  if (taxableIncome <= 1e7) return taxAfterRebate * 0.1;
  if (taxableIncome <= 2e7) return taxAfterRebate * 0.15;
  return taxAfterRebate * 0.25;
}
function getSurchargeThreshold(taxableIncome) {
  if (taxableIncome <= SURCHARGE_THRESHOLDS[0]) return null;
  if (taxableIncome <= SURCHARGE_THRESHOLDS[1]) return SURCHARGE_THRESHOLDS[0];
  if (taxableIncome <= SURCHARGE_THRESHOLDS[2]) return SURCHARGE_THRESHOLDS[1];
  return SURCHARGE_THRESHOLDS[2];
}
function computeTaxPlusSurchargeBeforeCess(taxableIncome) {
  const { totalTax } = calculateSlabTax(taxableIncome);
  const { taxAfterRebate } = applyRebateAndMarginalRelief(totalTax, taxableIncome);
  const surcharge = calculateSurcharge(taxAfterRebate, taxableIncome);
  return taxAfterRebate + surcharge;
}
function applySurchargeMarginalRelief(taxAfterRebate, taxableIncome, nominalSurcharge) {
  const threshold = getSurchargeThreshold(taxableIncome);
  if (!threshold) {
    return { surchargeMarginalRelief: 0 };
  }
  const taxAtActual = taxAfterRebate + nominalSurcharge;
  const taxAtThreshold = computeTaxPlusSurchargeBeforeCess(threshold);
  const excessIncome = taxableIncome - threshold;
  const additionalTax = taxAtActual - taxAtThreshold;
  const surchargeMarginalRelief = additionalTax > excessIncome ? additionalTax - excessIncome : 0;
  return { surchargeMarginalRelief };
}
function calculateIncomeTaxFromInput(taxInput) {
  if (!taxInput || taxInput.taxableIncome <= 0) {
    return {
      grossTotalIncome: taxInput?.grossTotalIncome || 0,
      annualSalary: taxInput?.annualSalary || 0,
      otherIncomeAnnual: taxInput?.otherIncomeAnnual || 0,
      standardDeduction: taxInput?.standardDeduction || 0,
      taxableIncome: 0,
      totalTaxBeforeRebate: 0,
      rebate87A: 0,
      marginalRelief: 0,
      taxAfterRebate: 0,
      surcharge: 0,
      surchargeMarginalRelief: 0,
      cess: 0,
      finalTax: 0,
      slabs: { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0 },
      usedTaxSlip: taxInput?.usedTaxSlip || false,
      employmentType: taxInput?.employmentType || ""
    };
  }
  const { totalTax, slabs } = calculateSlabTax(taxInput.taxableIncome);
  const { rebate87A, marginalRelief, taxAfterRebate } = applyRebateAndMarginalRelief(
    totalTax,
    taxInput.taxableIncome
  );
  const surcharge = calculateSurcharge(taxAfterRebate, taxInput.taxableIncome);
  const { surchargeMarginalRelief } = applySurchargeMarginalRelief(
    taxAfterRebate,
    taxInput.taxableIncome,
    surcharge
  );
  const taxPlusSurcharge = taxAfterRebate + surcharge - surchargeMarginalRelief;
  const cess = taxPlusSurcharge * 0.04;
  const finalTax = taxPlusSurcharge + cess;
  return {
    grossTotalIncome: taxInput.grossTotalIncome,
    annualSalary: taxInput.annualSalary,
    otherIncomeAnnual: taxInput.otherIncomeAnnual,
    standardDeduction: taxInput.standardDeduction,
    taxableIncome: taxInput.taxableIncome,
    totalTaxBeforeRebate: totalTax,
    rebate87A,
    marginalRelief,
    taxAfterRebate,
    surcharge,
    surchargeMarginalRelief,
    cess,
    finalTax,
    slabs,
    usedTaxSlip: taxInput.usedTaxSlip,
    employmentType: taxInput.employmentType
  };
}
function calculateIncomeTaxFromDetail(detail, employmentType) {
  const taxInput = buildTaxInput(detail, employmentType);
  return calculateIncomeTaxFromInput(taxInput);
}
function calculateProjectedMemberTax(detail, employmentType, yearIndex, incomeIncrementPercent = 0) {
  const factor = Math.pow(1 + incomeIncrementPercent / 100, yearIndex);
  const scaledDetail = scaleIncomeDetail(detail, factor);
  const result = calculateIncomeTaxFromDetail(scaledDetail, employmentType);
  if (!result) return calculateIncomeTaxFromInput(null);
  return result;
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
function buildSavingsBreakdownAnnual(expenseCategories = {}) {
  const savings = expenseCategories.savings || {};
  const monthly = (val) => getSavingsMonthlyAmount(val) * 12;
  if (hasConfiguredSavings(savings)) {
    const rdList = Array.isArray(savings.rd) ? savings.rd : savings.rd ? [savings.rd] : [];
    return {
      rdList,
      rdTotal: monthly(savings.rd),
      ppf: monthly(savings.ppf),
      nps: monthly(savings.nps),
      sip: monthly(savings.sip),
      otherSaving: monthly(savings.otherSaving)
    };
  }
  return {
    rdList: [],
    rdTotal: 0,
    ppf: 0,
    nps: 0,
    sip: (parseFloat(expenseCategories.summaryMonthlyInvestments) || 0) * 12,
    otherSaving: (parseFloat(expenseCategories.summaryOtherSavings) || 0) * 12
  };
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
function getMemberAnnualTdsFromSlip(detail, employmentType) {
  if (!isSalariedEmployment(employmentType)) return 0;
  const d = { ...createEmptyIncomeDetail(), ...detail };
  if (d.needTaxPlanning !== true) return 0;
  const monthlyTds = parseAmount2(d.taxPlanning?.deductions?.incomeTax);
  if (monthlyTds <= 0) return 0;
  return Math.round(monthlyTds * 12);
}
function getProjectedMemberAnnualTds(detail, employmentType, yearIndex, incomeIncrementPercent = 0) {
  const factor = Math.pow(1 + incomeIncrementPercent / 100, yearIndex);
  const scaledDetail = scaleIncomeDetail(detail, factor);
  return getMemberAnnualTdsFromSlip(scaledDetail, employmentType);
}
function computeMemberProjectedTaxReconciliation(detail, employmentType, yearIndex, incomeIncrementPercent = 0) {
  const taxResult = calculateProjectedMemberTax(detail, employmentType, yearIndex, incomeIncrementPercent);
  const computedTax = taxResult?.finalTax || 0;
  const tdsWithheld = getProjectedMemberAnnualTds(detail, employmentType, yearIndex, incomeIncrementPercent);
  return {
    computedTax,
    tdsWithheld,
    taxReconciliation: computedTax - tdsWithheld
  };
}
function computeHouseholdProjectedTaxReconciliation({
  selfDetail,
  selfEmploymentType,
  spouseDetail,
  spouseEmploymentType,
  includeSpouse,
  yearIndex,
  incomeIncrementPercent = 0,
  projectionYear,
  asOfYear = (/* @__PURE__ */ new Date()).getFullYear()
}) {
  const self = computeMemberProjectedTaxReconciliation(
    selfDetail,
    selfEmploymentType,
    yearIndex,
    incomeIncrementPercent
  );
  let computedTax = self.computedTax;
  let tdsWithheld = self.tdsWithheld;
  if (includeSpouse && spouseDetail) {
    const spouse = computeMemberProjectedTaxReconciliation(
      spouseDetail,
      spouseEmploymentType,
      yearIndex,
      incomeIncrementPercent
    );
    computedTax += spouse.computedTax;
    tdsWithheld += spouse.tdsWithheld;
  }
  const taxReconciliation = computedTax - tdsWithheld;
  const applies = projectionYear > asOfYear;
  const taxImpact = applies ? taxReconciliation : 0;
  return { computedTax, tdsWithheld, taxReconciliation, taxImpact, applies };
}

// apps/web/src/components/JourneyModule/ProjectionLogic.js
var getInsuranceFrequencyInterval = (freq = "Monthly") => {
  if (freq === "Quarterly") return 3;
  if (freq === "Half-Yearly" || freq === "Half Yearly") return 6;
  if (freq === "Annual" || freq === "Annually") return 12;
  return 1;
};
var getProtectionAllocationAnnual = (alloc = {}) => {
  const amount = parseFloat(alloc.amount) || 0;
  const type = alloc.type;
  const isInstallment = type === "Life Insurance" && !alloc.studioPlanKey || (type === "Life Insurance Saving Plans" || type === "Term Insurance") && alloc.insuredMember;
  if (isInstallment) {
    const interval2 = getInsuranceFrequencyInterval(alloc.frequency || "Monthly");
    return amount * (12 / interval2);
  }
  if ((type === "Life Insurance" || type === "Life Insurance Saving Plans") && alloc.studioPlanKey) {
    return amount;
  }
  const interval = getInsuranceFrequencyInterval(alloc.frequency || "Monthly");
  return amount * (12 / interval);
};
var getProtectionAllocationImpactForYear = (alloc = {}, year) => {
  const allocStartYear = parseInt(alloc.startYear, 10);
  const allocStartMonth = Math.min(12, Math.max(1, parseInt(alloc.startMonth, 10) || 1));
  const allocDuration = parseInt(alloc.duration, 10) || 1;
  if (!Number.isFinite(allocStartYear)) return 0;
  if (!(year >= allocStartYear && year < allocStartYear + allocDuration)) return 0;
  const yearlyAmount = getProtectionAllocationAnnual(alloc);
  if (year !== allocStartYear) return yearlyAmount;
  const isLegacyInstallmentLife = (alloc.type === "Life Insurance" || alloc.type === "Life Insurance Saving Plans" || alloc.type === "Term Insurance") && (!alloc.studioPlanKey || alloc.insuredMember);
  if (isLegacyInstallmentLife && (alloc.insuredMember || !alloc.studioPlanKey)) {
    const interval = getInsuranceFrequencyInterval(alloc.frequency || "Monthly");
    const installmentAmount = parseFloat(alloc.amount) || 0;
    let installmentsThisYear = 0;
    for (let m = allocStartMonth; m <= 12; m += interval) {
      installmentsThisYear += 1;
    }
    return installmentAmount * installmentsThisYear;
  }
  return yearlyAmount / 12 * (13 - allocStartMonth);
};
var isInsuranceColumnAllocation = (alloc = {}) => alloc.type === "Life Insurance" || alloc.type === "Life Insurance Saving Plans" && Boolean(alloc.insuredMember);
var isSurplusAllocationProtection = (alloc = {}) => alloc.type === "Term Insurance" || alloc.type === "Health Insurance";
var resolveAnnualInflowBases = ({
  income,
  selfDetail,
  spouseDetail,
  selfEmploymentType,
  spouseEmploymentType,
  includeSpouse,
  currentYearLedger
}) => {
  const activeSpouseDetail = includeSpouse && spouseDetail ? spouseDetail : null;
  const activeSpouseType = includeSpouse ? spouseEmploymentType : "";
  let selfInHandAnnual = getMemberNetInflowForLedger(selfDetail, selfEmploymentType) * 12;
  let spouseInHandAnnual = activeSpouseDetail ? getMemberNetInflowForLedger(activeSpouseDetail, activeSpouseType) * 12 : 0;
  const detailInflowAnnual = selfInHandAnnual + spouseInHandAnnual;
  const fallbackInflowAnnual = getFlatHouseholdMonthlyIncome(income) * 12;
  const ledgerMonthlyIncome = parseFloat(currentYearLedger?.income?.[11]) || 0;
  const hasActiveIncomeLedger = ledgerMonthlyIncome > 0;
  if (hasActiveIncomeLedger) {
    const baselineInflowAnnual = ledgerMonthlyIncome * 12;
    if (detailInflowAnnual > 0) {
      const ledgerScale = baselineInflowAnnual / detailInflowAnnual;
      selfInHandAnnual *= ledgerScale;
      spouseInHandAnnual *= ledgerScale;
    } else if (fallbackInflowAnnual > 0) {
      const selfFlatAnnual = getMemberFlatMonthlyIncome(income, "self") * 12;
      const selfRatio = selfFlatAnnual / fallbackInflowAnnual;
      selfInHandAnnual = baselineInflowAnnual * selfRatio;
      spouseInHandAnnual = baselineInflowAnnual * (1 - selfRatio);
    } else {
      selfInHandAnnual = baselineInflowAnnual;
      spouseInHandAnnual = 0;
    }
  } else if (detailInflowAnnual <= 0) {
    const selfFlatAnnual = getMemberFlatMonthlyIncome(income, "self") * 12;
    const selfRatio = fallbackInflowAnnual > 0 ? selfFlatAnnual / fallbackInflowAnnual : 1;
    selfInHandAnnual = fallbackInflowAnnual * selfRatio;
    spouseInHandAnnual = fallbackInflowAnnual * (1 - selfRatio);
  }
  return { selfInHandAnnual, spouseInHandAnnual };
};
var EDUCATION_STANDARDS = [
  "Play Group",
  "Nursery",
  "LKG",
  "UKG",
  "1st Standard",
  "2nd Standard",
  "3rd Standard",
  "4th Standard",
  "5th Standard",
  "6th Standard",
  "7th Standard",
  "8th Standard",
  "9th Standard",
  "10th Standard",
  "11th Standard",
  "12th Standard"
];
var generateProjections = ({
  familyMembers,
  income,
  expenseCategories,
  goals,
  inflationRates,
  startYear = (/* @__PURE__ */ new Date()).getFullYear(),
  policies = [],
  journeyAdjustments = [],
  investmentAllocations = [],
  loanProposals = [],
  currentYearLedger,
  hasSpouseIncome = false,
  planStartMonth = (/* @__PURE__ */ new Date()).getMonth()
}) => {
  let cumulativeNetInvestibleSurplus = 0;
  const {
    incomeIncrement = 0,
    householdInflation = 0,
    educationInflation = 0
  } = inflationRates;
  const selfMember = familyMembers.find((m) => m.relation?.toLowerCase() === "self");
  const spouseMember = familyMembers.find((m) => m.relation?.toLowerCase() === "spouse");
  if (!selfMember) return [];
  const birthYear = selfMember.dob ? new Date(selfMember.dob).getFullYear() : startYear - (selfMember.age || 30);
  const retirementYear = birthYear + (parseInt(selfMember.retirementAge) || 60);
  const yearsToProject = retirementYear - startYear + 1;
  if (yearsToProject <= 0) return [];
  const selfEmploymentType = resolveEmploymentType(selfMember);
  const spouseEmploymentType = spouseMember ? resolveEmploymentType(spouseMember) : "";
  const includeSpouse = shouldIncludeSpouseIncome(spouseMember, hasSpouseIncome, income);
  const selfDetail = prepareMemberDetailForProjection(
    getMemberDetailForProjection(income, "self", selfEmploymentType),
    selfEmploymentType
  );
  const spouseDetail = includeSpouse ? prepareMemberDetailForProjection(
    getMemberDetailForProjection(income, "spouse", spouseEmploymentType),
    spouseEmploymentType
  ) : null;
  const { selfInHandAnnual, spouseInHandAnnual } = resolveAnnualInflowBases({
    income,
    selfDetail,
    spouseDetail,
    selfEmploymentType,
    spouseEmploymentType,
    includeSpouse,
    currentYearLedger
  });
  const fallbackHouseholdMonthly = getEffectiveMonthlyHousehold(expenseCategories, familyMembers);
  const ledgerMonthlyHousehold = parseFloat(currentYearLedger?.household?.[11]) || 0;
  const hasActiveHouseholdLedger = ledgerMonthlyHousehold > 0;
  const householdMonthly = hasActiveHouseholdLedger ? ledgerMonthlyHousehold : fallbackHouseholdMonthly;
  const savingsMonthly = getEffectiveMonthlySavings(expenseCategories);
  const getMonthly = (item) => {
    if (!item || !item.value) return 0;
    const val = parseFloat(item.value) || 0;
    const freq = item.frequency || "Annual";
    switch (freq) {
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
        return val / 12;
    }
  };
  const genInsuranceAnnual = (getMonthly(expenseCategories.insurance?.health) + getMonthly(expenseCategories.insurance?.car) + getMonthly(expenseCategories.insurance?.bike) + getMonthly(expenseCategories.insurance?.others)) * 12;
  const cashFlowLifeAnnual = Object.values(expenseCategories.insurance?.life || {}).reduce((sum, item) => {
    return sum + getLifeMemberMonthlyTotal(item);
  }, 0) * 12;
  let detailedLifeStartYear = 0;
  policies.forEach((p) => {
    const startDate = new Date(p.startDate);
    if (isNaN(startDate.getTime())) return;
    const startY = startDate.getFullYear();
    const payTerm = parseInt(p.paymentTerm) || 0;
    const freq = p.frequency || "Annually";
    const mult = freq === "Monthly" ? 12 : freq === "Quarterly" ? 4 : freq === "Half-Yearly" ? 2 : 1;
    const annual = (parseFloat(p.premium) || 0) * mult;
    if (startY <= startYear && startY + payTerm > startYear) {
      detailedLifeStartYear += annual;
    }
  });
  const unallocatedLifeAnnual = Math.max(0, cashFlowLifeAnnual - detailedLifeStartYear);
  const projections = [];
  for (let i = 0; i < yearsToProject; i++) {
    const year = startYear + i;
    const growthFactor = Math.pow(1 + incomeIncrement / 100, i);
    const annualInflow = (selfInHandAnnual + spouseInHandAnnual) * growthFactor;
    let householdOutflow = householdMonthly * 12 * Math.pow(1 + householdInflation / 100, i);
    const {
      computedTax,
      tdsWithheld,
      taxReconciliation,
      taxImpact,
      applies: taxAdjustmentApplies
    } = computeHouseholdProjectedTaxReconciliation({
      selfDetail,
      selfEmploymentType,
      spouseDetail,
      spouseEmploymentType,
      includeSpouse,
      yearIndex: i,
      incomeIncrementPercent: incomeIncrement,
      projectionYear: year
    });
    const approxTax = taxImpact;
    const netInflowAfterTax = annualInflow - taxImpact;
    let activeCashFlowEMIThisYear = 0;
    Object.entries(expenseCategories.emi || {}).forEach(([key, val]) => {
      if (typeof val === "object" && parseFloat(val.principal) > 0) {
        const adjStartYear = parseInt(val.startYear);
        const adjStartMonth = parseInt(val.startMonth) || 1;
        const tenureMonths = parseInt(val.tenure) || 12;
        const emi = parseFloat(val.emi) || 0;
        const loanStartAbsoluteMonth = adjStartYear * 12 + adjStartMonth;
        const loanEndAbsoluteMonth = loanStartAbsoluteMonth + tenureMonths - 1;
        const yearStartAbsoluteMonth = year * 12 + 1;
        const yearEndAbsoluteMonth = year * 12 + 12;
        const overlapStart = Math.max(loanStartAbsoluteMonth, yearStartAbsoluteMonth);
        const overlapEnd = Math.min(loanEndAbsoluteMonth, yearEndAbsoluteMonth);
        const activeMonths = Math.max(0, overlapEnd - overlapStart + 1);
        if (activeMonths > 0) {
          activeCashFlowEMIThisYear += activeMonths * emi;
        }
      } else if (typeof val !== "object") {
        const primEMI = parseFloat(val) || 0;
        activeCashFlowEMIThisYear += primEMI * 12;
      }
    });
    if (!hasConfiguredLoan(expenseCategories.emi) && activeCashFlowEMIThisYear === 0) {
      const summaryMonthly = parseFloat(expenseCategories.summaryEmiTotal) || 0;
      if (summaryMonthly > 0) {
        activeCashFlowEMIThisYear = summaryMonthly * 12;
      }
    }
    const fixedOutflow = activeCashFlowEMIThisYear;
    let detailedLifeThisYear = 0;
    policies.forEach((p) => {
      const startDate = new Date(p.startDate);
      if (isNaN(startDate.getTime())) return;
      const startY = startDate.getFullYear();
      const payTerm = parseInt(p.paymentTerm) || 0;
      const freq = p.frequency || "Annually";
      const mult = freq === "Monthly" ? 12 : freq === "Quarterly" ? 4 : freq === "Half-Yearly" ? 2 : 1;
      const annual = (parseFloat(p.premium) || 0) * mult;
      if (startY <= year && startY + payTerm > year) {
        detailedLifeThisYear += annual;
      }
    });
    let futureLifeAllocationsThisYear = 0;
    investmentAllocations.forEach((alloc) => {
      if (!isInsuranceColumnAllocation(alloc)) return;
      if (!shouldIncludeStudioInsuranceInProjections(alloc, policies)) return;
      futureLifeAllocationsThisYear += getProtectionAllocationImpactForYear(alloc, year);
    });
    const totalInsuranceOutflow = genInsuranceAnnual + detailedLifeThisYear + unallocatedLifeAnnual + futureLifeAllocationsThisYear;
    const annualOutflow = householdOutflow + fixedOutflow;
    let totalEducationExpenses = 0;
    const householdEducationBaseline = isEducationInHouseholdBaseline(
      familyMembers,
      expenseCategories.household
    );
    familyMembers.forEach((member) => {
      if (member.relation === "Child") {
        if (member.occupation === "School" || !member.occupation) {
          if (getChildMonthlyEducationExpense(member) > 0 || householdEducationBaseline) return;
          const currentStandard = member.standard || "";
          const baseFee = parseFloat(member.annualSchoolFee) || (parseFloat(member.monthlyEducationExpense) || 0) * 12;
          const currentIndex = EDUCATION_STANDARDS.findIndex(
            (s) => s.toLowerCase().includes(currentStandard.toLowerCase()) || currentStandard.toLowerCase().includes(s.toLowerCase())
          );
          if (currentIndex !== -1) {
            const futureIndex = currentIndex + i;
            if (futureIndex < EDUCATION_STANDARDS.length) {
              totalEducationExpenses += baseFee * Math.pow(1 + educationInflation / 100, i);
            }
          }
        } else if (member.occupation === "College") {
          if (getChildMonthlyEducationExpense(member) > 0 || householdEducationBaseline) return;
          const duration = parseFloat(member.courseDuration) || 1;
          const remainingTime = parseFloat(member.remainingTime) || 0;
          const totalCost = parseFloat(member.costOfCompleteCourse) || 0;
          const isPaid = member.isFeePaid === "YES";
          const annualCost = totalCost / duration;
          if (i === 0) {
            if (!isPaid) totalEducationExpenses += annualCost;
          } else if (i <= remainingTime) {
            totalEducationExpenses += annualCost;
          }
        }
      }
    });
    goals.forEach((goal) => {
      const isEducation = goal.name?.toLowerCase().includes("higher education");
      if (isEducation) {
        const yearsToGoal = parseFloat(goal.yearsToGoal) || 0;
        const duration = parseInt(goal.courseDuration) || 0;
        const totalCost = parseFloat(goal.totalCourseCost) || 0;
        const inflation = (parseFloat(goal.inflationRate) || educationInflation) / 100;
        const goalStartYear = startYear + Math.round(yearsToGoal);
        if (year >= goalStartYear && year < goalStartYear + duration) {
          const futureTotalCost = totalCost * Math.pow(1 + inflation, yearsToGoal);
          totalEducationExpenses += futureTotalCost / duration;
        }
      }
    });
    let yearAdjustmentsTotal = 0;
    const activeAdjustments = [];
    const combinedAdjustments = [
      ...journeyAdjustments,
      ...loanProposals.map((lp) => ({ ...lp, type: "loan" }))
    ];
    combinedAdjustments.forEach((adj) => {
      if (adj.type === "loan") {
        const adjStartYear = parseInt(adj.startYear);
        const adjStartMonth = parseInt(adj.startMonth) || 1;
        const tenureMonths = parseInt(adj.tenure) || 12;
        const emi = parseFloat(adj.emi) || 0;
        const loanStartAbsoluteMonth = adjStartYear * 12 + adjStartMonth;
        const loanEndAbsoluteMonth = loanStartAbsoluteMonth + tenureMonths - 1;
        const yearStartAbsoluteMonth = year * 12 + 1;
        const yearEndAbsoluteMonth = year * 12 + 12;
        const overlapStart = Math.max(loanStartAbsoluteMonth, yearStartAbsoluteMonth);
        const overlapEnd = Math.min(loanEndAbsoluteMonth, yearEndAbsoluteMonth);
        const activeMonths = Math.max(0, overlapEnd - overlapStart + 1);
        if (activeMonths > 0) {
          const yearEMI = activeMonths * emi;
          yearAdjustmentsTotal += yearEMI;
          activeAdjustments.push({ name: `EMI: ${adj.name}`, amount: yearEMI });
        }
      } else {
        const adjStartYear = parseInt(adj.startYear);
        const adjAmount = parseFloat(adj.amount) || 0;
        if (year === adjStartYear) {
          yearAdjustmentsTotal += adjAmount;
          activeAdjustments.push({ name: adj.name, amount: adjAmount });
        }
      }
    });
    const totalOutflow = annualOutflow + totalEducationExpenses + yearAdjustmentsTotal;
    const surplusBeforeSaving = netInflowAfterTax - totalOutflow;
    const savingsAndInvestments = savingsMonthly * 12 + totalInsuranceOutflow;
    const netInvestibleSurplus = surplusBeforeSaving - savingsAndInvestments;
    const baselineTotalOutflow = annualOutflow + totalEducationExpenses;
    const baselineSurplusBeforeSaving = netInflowAfterTax - baselineTotalOutflow;
    const baseNetInvestibleSurplusAnnual = baselineSurplusBeforeSaving - savingsAndInvestments;
    const monthlyBaselineInflow = baseNetInvestibleSurplusAnnual / 12;
    let yearHasDeficit = false;
    let yearDeficitMonth = null;
    let lowestCumulativeSurplus = null;
    const planStartMonthAbsolute = Math.min(Math.max(planStartMonth, 0), 11) + 1;
    const startMonthLimit = i === 0 ? planStartMonthAbsolute : 1;
    for (let m = startMonthLimit; m <= 12; m++) {
      let monthlyJourneyDeduction = 0;
      let monthlyAllocationDeduction = 0;
      const currentAbsoluteMonth = year * 12 + m;
      combinedAdjustments.forEach((adj) => {
        if (adj.type === "loan") {
          const adjStartYear = parseInt(adj.startYear);
          const adjStartMonth = parseInt(adj.startMonth) || 1;
          const tenureMonths = parseInt(adj.tenure) || 12;
          const emi = parseFloat(adj.emi) || 0;
          const loanStartAbsoluteMonth = adjStartYear * 12 + adjStartMonth;
          const loanEndAbsoluteMonth = loanStartAbsoluteMonth + tenureMonths - 1;
          if (currentAbsoluteMonth >= loanStartAbsoluteMonth && currentAbsoluteMonth <= loanEndAbsoluteMonth) {
            monthlyJourneyDeduction += emi;
          }
        } else {
          const adjStartYear = parseInt(adj.startYear);
          const adjStartMonth = parseInt(adj.startMonth) || 1;
          const adjAmount = parseFloat(adj.amount) || 0;
          if (year === adjStartYear && m === adjStartMonth) {
            monthlyJourneyDeduction += adjAmount;
          }
        }
      });
      investmentAllocations.forEach((alloc) => {
        const isRecurring = ["SIP", "PPF", "NPS", "Life Insurance", "Term Insurance", "Health Insurance", "Life Insurance Saving Plans", "Recurring Deposit"].includes(alloc.type);
        if (isInsuranceColumnAllocation(alloc)) return;
        if (isSurplusAllocationProtection(alloc) && !shouldIncludeStudioInsuranceInProjections(alloc, policies)) {
          return;
        }
        const allocStartYear = parseInt(alloc.startYear);
        const allocStartMonth = parseInt(alloc.startMonth) || 1;
        const allocDuration = parseInt(alloc.duration) || 1;
        const annualAmount = parseFloat(alloc.amount) || 0;
        if (isRecurring) {
          if (year >= allocStartYear && year < allocStartYear + allocDuration) {
            if (year === allocStartYear) {
              if (m >= allocStartMonth) {
                monthlyAllocationDeduction += annualAmount / 12;
              }
            } else {
              monthlyAllocationDeduction += annualAmount / 12;
            }
          }
        } else {
          if (year === allocStartYear && m === allocStartMonth) {
            monthlyAllocationDeduction += annualAmount;
          }
        }
      });
      cumulativeNetInvestibleSurplus += monthlyBaselineInflow;
      cumulativeNetInvestibleSurplus -= monthlyJourneyDeduction;
      cumulativeNetInvestibleSurplus -= monthlyAllocationDeduction;
      if (lowestCumulativeSurplus === null || cumulativeNetInvestibleSurplus < lowestCumulativeSurplus) {
        lowestCumulativeSurplus = cumulativeNetInvestibleSurplus;
      }
      if (cumulativeNetInvestibleSurplus < 0 && !yearHasDeficit) {
        yearHasDeficit = true;
        yearDeficitMonth = m;
      }
    }
    let yearAllocationsTotal = 0;
    const activeAllocations = [];
    investmentAllocations.forEach((alloc) => {
      const allocStartYear = parseInt(alloc.startYear);
      const allocStartMonth = parseInt(alloc.startMonth) || 1;
      const allocDuration = parseInt(alloc.duration) || 1;
      const type = alloc.type;
      const isRecurring = ["SIP", "PPF", "NPS", "Life Insurance", "Term Insurance", "Health Insurance", "Life Insurance Saving Plans", "Recurring Deposit"].includes(type);
      const inInsuranceColumn = isInsuranceColumnAllocation(alloc);
      const skipSurplusProtection = isSurplusAllocationProtection(alloc) && !shouldIncludeStudioInsuranceInProjections(alloc, policies);
      let yearlyAmount = 0;
      let monthlyAmount = 0;
      if (inInsuranceColumn) {
        yearlyAmount = getProtectionAllocationAnnual(alloc);
        monthlyAmount = yearlyAmount / 12;
      } else {
        yearlyAmount = parseFloat(alloc.amount) || 0;
        monthlyAmount = isRecurring ? yearlyAmount / 12 : 0;
      }
      if (isRecurring) {
        if (year >= allocStartYear && year < allocStartYear + allocDuration) {
          let impactThisYear = yearlyAmount;
          if (year === allocStartYear) {
            if (inInsuranceColumn) {
              impactThisYear = getProtectionAllocationImpactForYear(alloc, year);
            } else {
              impactThisYear = monthlyAmount * (13 - allocStartMonth);
            }
          }
          if (!inInsuranceColumn && !skipSurplusProtection) {
            yearAllocationsTotal += impactThisYear;
          }
          if (!skipSurplusProtection || inInsuranceColumn) {
            activeAllocations.push({ ...alloc, impactThisYear });
          }
        }
      } else {
        if (year === allocStartYear) {
          yearAllocationsTotal += yearlyAmount;
          activeAllocations.push({ ...alloc, impactThisYear: yearlyAmount });
        }
      }
    });
    const unallocatedSurplus = netInvestibleSurplus - yearAllocationsTotal;
    projections.push({
      year,
      annualInflow,
      computedTax,
      tdsWithheld,
      taxReconciliation,
      taxAdjustmentApplies,
      approxTax,
      netInflowAfterTax,
      householdOutflow,
      emiOutflow: fixedOutflow,
      insurancePremium: totalInsuranceOutflow,
      educationExpenses: totalEducationExpenses,
      journeyAdjustments: activeAdjustments,
      journeyAdjustmentsTotal: yearAdjustmentsTotal,
      totalOutflow,
      surplusBeforeSaving,
      savingsAndInvestments,
      savingsBreakdown: buildSavingsBreakdownAnnual(expenseCategories),
      netInvestibleSurplus,
      yearAllocationsTotal,
      activeAllocations,
      unallocatedSurplus,
      lowestCumulativeSurplus,
      yearHasDeficit,
      yearDeficitMonth
    });
  }
  return projections;
};
export {
  EDUCATION_STANDARDS,
  generateProjections,
  getProtectionAllocationAnnual,
  getProtectionAllocationImpactForYear
};
