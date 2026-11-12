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
function getHouseholdMonthlyInflow(income, familyMembers, hasSpouseIncome, resolveEmploymentType) {
  const selfMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "self");
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  if (!selfMember) return getFlatHouseholdMonthlyIncome(income);
  const selfType = resolveEmploymentType(selfMember);
  const spouseType = spouseMember ? resolveEmploymentType(spouseMember) : "Private Sector";
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
function getSummarySavingsTotal(expenseCategories = {}) {
  return (parseFloat(expenseCategories.summaryMonthlyInvestments) || 0) + (parseFloat(expenseCategories.summaryOtherSavings) || 0);
}
function getEffectiveMonthlySavings(expenseCategories = {}) {
  const configured = sumConfiguredSavings(expenseCategories.savings);
  if (configured > 0) return configured;
  return getSummarySavingsTotal(expenseCategories);
}

// apps/web/src/components/DetailedReport/moneyFlowLedgerLogic.js
var MONTH_LABELS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var MONTH_LABELS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var TAX_PAYMENT_MONTH = 5;
var TAX_REFUND_MONTH = 8;
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
function getLedgerHouseholdMonthly(expenseCategories = {}, familyMembers = []) {
  return Math.round(getEffectiveMonthlyHousehold(expenseCategories, familyMembers));
}
function getLedgerNetIncomeMonthly(income, familyMembers, hasSpouseIncome, resolveEmploymentType) {
  const selfMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "self");
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  if (!selfMember) {
    return Math.round(getHouseholdMonthlyInflow(income, familyMembers, hasSpouseIncome, resolveEmploymentType));
  }
  const selfType = resolveEmploymentType(selfMember);
  const spouseType = spouseMember ? resolveEmploymentType(spouseMember) : "";
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
  return Math.round(getHouseholdMonthlyInflow(income, familyMembers, hasSpouseIncome, resolveEmploymentType));
}
function usesMarchFebruarySalaryYear(employmentType) {
  return isGovernmentSector(employmentType) || isPensionerEmployment(employmentType);
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
function computeTaxAdjustmentArray({
  income,
  familyMembers,
  hasSpouseIncome,
  resolveEmploymentType,
  calendarYear,
  asOfYear = (/* @__PURE__ */ new Date()).getFullYear()
}) {
  const empty = Array(12).fill(0);
  const baseMeta = {
    applies: false,
    actualTax: 0,
    tdsTotal: 0,
    difference: 0,
    type: null,
    paymentMonth: TAX_PAYMENT_MONTH,
    refundMonth: TAX_REFUND_MONTH
  };
  if (calendarYear <= asOfYear) {
    return {
      adjustment: empty,
      meta: {
        ...baseMeta,
        reason: "Income tax return for the prior year is assumed filed for the current calendar year. Tax adjustment applies from the next assessment cycle."
      }
    };
  }
  const selfMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "self");
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  if (!selfMember) {
    return { adjustment: empty, meta: { ...baseMeta, reason: "No profile data for tax adjustment." } };
  }
  const selfType = resolveEmploymentType(selfMember);
  const spouseType = spouseMember ? resolveEmploymentType(spouseMember) : "";
  const includeSpouse = shouldIncludeSpouseIncome(spouseMember, hasSpouseIncome, income);
  let totalActualTax = 0;
  let totalTds = 0;
  let hasTaxData = false;
  const selfDetail = getMemberDetailForProjection(income, "self", selfType);
  const selfTax = calculateIncomeTaxFromDetail(selfDetail, selfType);
  if (selfTax) {
    totalActualTax += selfTax.finalTax || 0;
    hasTaxData = true;
  }
  totalTds += getMemberAnnualTdsFromSlip(selfDetail, selfType);
  if (includeSpouse && spouseMember) {
    const spouseDetail = getMemberDetailForProjection(income, "spouse", spouseType);
    const spouseTax = calculateIncomeTaxFromDetail(spouseDetail, spouseType);
    if (spouseTax) {
      totalActualTax += spouseTax.finalTax || 0;
      hasTaxData = true;
    }
    totalTds += getMemberAnnualTdsFromSlip(spouseDetail, spouseType);
  }
  if (!hasTaxData || totalTds <= 0) {
    return {
      adjustment: empty,
      meta: {
        ...baseMeta,
        reason: "Tax adjustment requires salary-slip TDS and computed income tax from Income Tax module."
      }
    };
  }
  const difference = Math.round(totalActualTax - totalTds);
  if (Math.abs(difference) < 1) {
    return {
      adjustment: empty,
      meta: { ...baseMeta, applies: true, actualTax: totalActualTax, tdsTotal: totalTds, difference: 0, type: "balanced" }
    };
  }
  const adjustment = Array(12).fill(0);
  let type = null;
  if (difference > 0) {
    adjustment[TAX_PAYMENT_MONTH] = -difference;
    type = "additional_tax";
  } else {
    adjustment[TAX_REFUND_MONTH] = -difference;
    type = "refund";
  }
  return {
    adjustment,
    meta: {
      applies: true,
      actualTax: totalActualTax,
      tdsTotal: totalTds,
      difference,
      type,
      paymentMonth: TAX_PAYMENT_MONTH,
      refundMonth: TAX_REFUND_MONTH,
      reason: difference > 0 ? `Additional tax of \u20B9${difference.toLocaleString("en-IN")} (actual tax minus TDS deducted) assumed payable in ${MONTH_LABELS_LONG[TAX_PAYMENT_MONTH]}.` : `Refund of \u20B9${(-difference).toLocaleString("en-IN")} (TDS minus actual tax) assumed received in ${MONTH_LABELS_LONG[TAX_REFUND_MONTH]}.`
    }
  };
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
function resolveLedgerMonthlyRow(ledgerArray, fallbackMonthly = 0) {
  if (Array.isArray(ledgerArray) && ledgerArray.length === 12) {
    return ledgerArray.map(parseAmount2);
  }
  return Array(12).fill(Math.round(parseAmount2(fallbackMonthly)) || 0);
}
function getMonthlyInsuranceTotal(expenseCategories = {}) {
  return Math.round(getEffectiveMonthlyInsurance(expenseCategories));
}
function getAdjustedIncomeMonth(incomeArr, taxAdjustmentArr, monthIndex) {
  return parseAmount2(incomeArr?.[monthIndex]) + parseAmount2(taxAdjustmentArr?.[monthIndex]);
}
var VIEW_MODES = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  ANNUAL: "annual"
};
var sumArrayRange = (arr, from, to) => arr.slice(from, to + 1).reduce((s, v) => s + parseAmount2(v), 0);
function maskValuesForPlanStart(values, planStartMonth) {
  const start = Math.min(Math.max(planStartMonth, 0), 11);
  return values.map((v, idx) => idx < start ? null : parseAmount2(v));
}
function computeYtdTotal(values, planStartMonth, currentMonth) {
  const start = Math.min(Math.max(planStartMonth, 0), 11);
  const end = Math.min(Math.max(currentMonth, 0), 11);
  if (end < start) return null;
  return Math.round(sumArrayRange(values, start, end));
}
function aggregateToQuarterly(values, planStartMonth) {
  const start = Math.min(Math.max(planStartMonth, 0), 11);
  return [0, 1, 2, 3].map((q) => {
    const monthStart = q * 3;
    const monthEnd = q * 3 + 2;
    const activeStart = Math.max(monthStart, start);
    if (activeStart > monthEnd) return null;
    return Math.round(sumArrayRange(values, activeStart, monthEnd));
  });
}
function aggregateToAnnual(values, planStartMonth) {
  const start = Math.min(Math.max(planStartMonth, 0), 11);
  if (start > 11) return null;
  return Math.round(sumArrayRange(values, start, 11));
}
function getViewColumns(viewMode, currentMonth) {
  if (viewMode === VIEW_MODES.QUARTERLY) {
    const currentQuarter = Math.floor(currentMonth / 3);
    return ["Q1", "Q2", "Q3", "Q4"].map((label, idx) => ({
      label,
      idx,
      isCurrent: idx === currentQuarter
    }));
  }
  if (viewMode === VIEW_MODES.ANNUAL) {
    return [{ label: "Full Year", idx: 0, isCurrent: true }];
  }
  return MONTH_LABELS_SHORT.map((label, idx) => ({
    label,
    idx,
    isCurrent: idx === currentMonth
  }));
}
function getDisplayValues(values, viewMode, planStartMonth) {
  if (viewMode === VIEW_MODES.QUARTERLY) {
    return aggregateToQuarterly(values, planStartMonth);
  }
  if (viewMode === VIEW_MODES.ANNUAL) {
    return [aggregateToAnnual(values, planStartMonth)];
  }
  return maskValuesForPlanStart(values, planStartMonth);
}
function computeMoneyFlowInsights(report) {
  const { meta, baseline, ledger } = report;
  const { planStartMonth, currentMonth, currentMonthLabel } = meta;
  const insights = [];
  if (currentMonth >= planStartMonth) {
    const adjustedNow = ledger.adjustedIncome[currentMonth] || 0;
    const freeCashFlow = ledger.unallocatedSurplus[currentMonth] || 0;
    const householdNow = ledger.household[currentMonth] || 0;
    if (currentMonth > planStartMonth && currentMonth > 0) {
      const prevMonth = currentMonth - 1;
      if (prevMonth >= planStartMonth) {
        const householdPrev = ledger.household[prevMonth] || 0;
        if (householdPrev > 0 && householdNow !== householdPrev) {
          const pctChange = Math.round((householdNow - householdPrev) / householdPrev * 100);
          const prevLabel = MONTH_LABELS_LONG[prevMonth];
          if (pctChange !== 0) {
            const direction = pctChange > 0 ? "increased" : "decreased";
            insights.push({
              id: "household-change",
              text: `Household spending ${direction} by ${Math.abs(pctChange)}% from ${prevLabel}.`,
              tone: pctChange > 0 ? "warning" : "positive"
            });
          }
        }
      }
    }
    if (adjustedNow > 0) {
      const emiBurden = Math.round(baseline.monthlyEmi / adjustedNow * 100);
      insights.push({
        id: "emi-burden",
        text: `EMI burden is ${emiBurden}% of income.`,
        tone: emiBurden > 40 ? "warning" : "neutral"
      });
    }
    if (freeCashFlow > 0) {
      insights.push({
        id: "allocate-surplus",
        text: `Consider allocating unused surplus of ${formatInsightCurrency(freeCashFlow)}.`,
        tone: "accent",
        actionTarget: "#ius-section"
      });
    }
  } else {
    insights.push({
      id: "plan-not-started",
      text: `Your plan starts in ${meta.planStartMonthLabel}. Tracking figures will appear from that month.`,
      tone: "neutral"
    });
  }
  return insights;
}
function formatInsightCurrency(value) {
  return `\u20B9${Math.round(value || 0).toLocaleString("en-IN")}`;
}
function buildYourMoneyFlowReport({
  currentYearLedger,
  planStartMonth,
  familyMembers,
  income,
  expenseCategories,
  hasSpouseIncome,
  resolveEmploymentType,
  journeyProjections,
  calendarYear = (/* @__PURE__ */ new Date()).getFullYear(),
  currentMonth = (/* @__PURE__ */ new Date()).getMonth()
}) {
  const selfMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "self") || { name: "Self" };
  const spouseMember = familyMembers?.find((m) => m.relation?.toLowerCase() === "spouse");
  const selfType = resolveEmploymentType(selfMember);
  const salaryYearLabel = usesMarchFebruarySalaryYear(selfType) ? "March \u2013 February" : "April \u2013 March";
  const ledgerIncome = resolveLedgerMonthlyRow(currentYearLedger?.income);
  const ledgerHousehold = resolveLedgerMonthlyRow(currentYearLedger?.household);
  const taxAdjustment = currentYearLedger?.taxAdjustment || Array(12).fill(0);
  const monthlyEmi = Math.round(getEffectiveMonthlyEmi(expenseCategories));
  const monthlyInsurance = getMonthlyInsuranceTotal(expenseCategories);
  const monthlySavings = Math.round(getEffectiveMonthlySavings(expenseCategories));
  const ledgerEmi = resolveLedgerMonthlyRow(currentYearLedger?.emi, monthlyEmi);
  const ledgerInsurance = resolveLedgerMonthlyRow(currentYearLedger?.insurance, monthlyInsurance);
  const ledgerSavings = resolveLedgerMonthlyRow(currentYearLedger?.savings, monthlySavings);
  const baselineNetIncome = getLedgerNetIncomeMonthly(income, familyMembers, hasSpouseIncome, resolveEmploymentType);
  const baselineHousehold = getLedgerHouseholdMonthly(expenseCategories, familyMembers);
  const adjustedIncome = ledgerIncome.map((val, idx) => getAdjustedIncomeMonth(ledgerIncome, taxAdjustment, idx));
  const monthlySurplus = adjustedIncome.map((val, idx) => Math.round(val - ledgerHousehold[idx] - ledgerEmi[idx] - ledgerInsurance[idx]));
  const unallocatedSurplus = monthlySurplus.map((val, idx) => Math.round(val - ledgerSavings[idx]));
  const sumRange = (arr, from, to) => arr.slice(from, to + 1).reduce((s, v) => s + parseAmount2(v), 0);
  const ytdEnd = currentMonth;
  const proratedStart = Math.min(Math.max(planStartMonth, 0), 11);
  const proratedEnd = 11;
  const year1Projection = journeyProjections?.find((p) => p.year === calendarYear);
  const year1NetInvestibleSurplus = year1Projection?.netInvestibleSurplus || 0;
  const remainingMonths = Math.max(1, 12 - proratedStart);
  const proratedNetInvestibleSurplus = year1NetInvestibleSurplus / 12 * remainingMonths;
  const { meta: taxMeta } = computeTaxAdjustmentArray({
    income,
    familyMembers,
    hasSpouseIncome,
    resolveEmploymentType,
    calendarYear
  });
  return {
    meta: {
      calendarYear,
      planStartMonth: proratedStart,
      planStartMonthLabel: MONTH_LABELS_LONG[proratedStart],
      currentMonth,
      currentMonthLabel: MONTH_LABELS_LONG[currentMonth],
      remainingMonths,
      salaryYearLabel,
      assessmentNote: "In FY 2026-27, income of PY 2025-26 is assessed. Tax adjustment applies from the next calendar year after your current ITR is filed."
    },
    members: {
      selfName: selfMember.name || "Self",
      spouseName: spouseMember?.name || "Spouse"
    },
    baseline: {
      monthlyNetIncome: baselineNetIncome,
      monthlyHousehold: baselineHousehold,
      monthlyEmi,
      monthlyInsurance,
      monthlySavings
    },
    taxAdjustmentMeta: taxMeta,
    ledger: {
      months: MONTH_LABELS_SHORT,
      income: ledgerIncome,
      taxAdjustment: taxAdjustment.map(parseAmount2),
      adjustedIncome: adjustedIncome.map(Math.round),
      household: ledgerHousehold,
      emi: ledgerEmi,
      insurance: ledgerInsurance,
      monthlySurplus,
      savings: ledgerSavings,
      unallocatedSurplus
    },
    totals: {
      ytdAdjustedIncome: sumRange(adjustedIncome, 0, ytdEnd),
      ytdHousehold: sumRange(ledgerHousehold, 0, ytdEnd),
      ytdSurplus: sumRange(monthlySurplus, 0, ytdEnd),
      ytdUnallocated: sumRange(unallocatedSurplus, 0, ytdEnd),
      proratedAdjustedIncome: sumRange(adjustedIncome, proratedStart, proratedEnd),
      proratedHousehold: sumRange(ledgerHousehold, proratedStart, proratedEnd),
      proratedSurplus: sumRange(monthlySurplus, proratedStart, proratedEnd),
      proratedUnallocated: sumRange(unallocatedSurplus, proratedStart, proratedEnd),
      fullYearSurplus: sumRange(monthlySurplus, 0, 11),
      fullYearUnallocated: sumRange(unallocatedSurplus, 0, 11)
    },
    journeyLink: {
      year1NetInvestibleSurplus,
      proratedNetInvestibleSurplus: Math.round(proratedNetInvestibleSurplus)
    }
  };
}
export {
  MONTH_LABELS_LONG,
  MONTH_LABELS_SHORT,
  TAX_PAYMENT_MONTH,
  TAX_REFUND_MONTH,
  VIEW_MODES,
  aggregateToAnnual,
  aggregateToQuarterly,
  buildYourMoneyFlowReport,
  computeHouseholdProjectedTaxReconciliation,
  computeMemberProjectedTaxReconciliation,
  computeMoneyFlowInsights,
  computeTaxAdjustmentArray,
  computeYtdTotal,
  getAdjustedIncomeMonth,
  getDisplayValues,
  getLedgerHouseholdMonthly,
  getLedgerNetIncomeMonthly,
  getMemberAnnualTdsFromSlip,
  getMemberNetInflowForLedger,
  getMonthlyInsuranceTotal,
  getProjectedMemberAnnualTds,
  getViewColumns,
  maskValuesForPlanStart,
  resolveLedgerMonthlyRow,
  syncLedgerFromMonthlyTotals,
  usesMarchFebruarySalaryYear
};
