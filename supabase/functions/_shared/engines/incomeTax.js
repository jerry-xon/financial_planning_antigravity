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

// apps/web/src/components/IncomeTaxModule/IncomeTaxLogic.js
var REBATE_87A_MAX = 6e4;
var REBATE_87A_INCOME_LIMIT = 12e5;
var SURCHARGE_THRESHOLDS = [5e6, 1e7, 2e7];
var SLAB_DEFINITIONS = [
  {
    key: "t1",
    min: 0,
    max: 4e5,
    rate: 0,
    rangeLabel: "Up to \u20B94 lakh",
    plainExplanation: "The first \u20B94 lakh of taxable income is tax-free under the new regime."
  },
  {
    key: "t2",
    min: 4e5,
    max: 8e5,
    rate: 0.05,
    rangeLabel: "\u20B94 lakh \u2013 \u20B98 lakh",
    plainExplanation: "Income in this band is taxed at 5%."
  },
  {
    key: "t3",
    min: 8e5,
    max: 12e5,
    rate: 0.1,
    rangeLabel: "\u20B98 lakh \u2013 \u20B912 lakh",
    plainExplanation: "Income in this band is taxed at 10%."
  },
  {
    key: "t4",
    min: 12e5,
    max: 16e5,
    rate: 0.15,
    rangeLabel: "\u20B912 lakh \u2013 \u20B916 lakh",
    plainExplanation: "Income in this band is taxed at 15%."
  },
  {
    key: "t5",
    min: 16e5,
    max: 2e6,
    rate: 0.2,
    rangeLabel: "\u20B916 lakh \u2013 \u20B920 lakh",
    plainExplanation: "Income in this band is taxed at 20%."
  },
  {
    key: "t6",
    min: 2e6,
    max: 24e5,
    rate: 0.25,
    rangeLabel: "\u20B920 lakh \u2013 \u20B924 lakh",
    plainExplanation: "Income in this band is taxed at 25%."
  },
  {
    key: "t7",
    min: 24e5,
    max: Infinity,
    rate: 0.3,
    rangeLabel: "Above \u20B924 lakh",
    plainExplanation: "Income above \u20B924 lakh is taxed at 30%."
  }
];
var TAX_BREAKDOWN_COPY = {
  progressiveTax: "India taxes income in slices. Only the income above each limit is taxed at the higher rate\u2014not your entire salary.",
  rebate87A: "If taxable income is up to \u20B912 lakh, the government reduces your tax by up to \u20B960,000\u2014often bringing it to zero.",
  marginalRelief: "When income is slightly above \u20B912 lakh, tax cannot exceed the extra income above \u20B912 lakh. This avoids a sudden tax spike.",
  surcharge: "An extra charge on high incomes: 10%, 15%, or 25% of tax depending on your income level (above \u20B950 lakh).",
  surchargeMarginalRelief: "When income is just above a surcharge threshold, this relief caps the extra tax so it does not exceed the income above that threshold.",
  cess: "4% Health & Education Cess is added on tax (after rebate and surcharge) to fund public health and education programs.",
  standardDeduction: "A fixed amount subtracted from salary or pension before tax is calculated (\u20B975,000 for salaried employees and pensioners).",
  zeroTaxRebate: "Your taxable income qualifies for the Section 87A rebate, so your slab tax is fully offset and you pay no income tax.",
  zeroTaxNoIncome: "No taxable income was calculated from your inputs, so no tax is due."
};
function getIncomeInSlab(taxableIncome, min, max) {
  if (taxableIncome <= min) return 0;
  const capped = max === Infinity ? taxableIncome : Math.min(taxableIncome, max);
  return capped - min;
}
function formatBreakdownAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(amount));
}
function buildSlabFormula(incomeInSlab, rate, taxAmount) {
  if (incomeInSlab <= 0) return "";
  if (rate === 0) return `${formatBreakdownAmount(incomeInSlab)} \xD7 0% = ${formatBreakdownAmount(taxAmount)}`;
  const ratePct = `${Math.round(rate * 100)}%`;
  return `${formatBreakdownAmount(incomeInSlab)} \xD7 ${ratePct} = ${formatBreakdownAmount(taxAmount)}`;
}
function buildTaxBreakdownPresentation(results) {
  if (!results) {
    return {
      slabBreakdown: [],
      calculationSteps: [],
      adjustments: [],
      insights: {
        effectiveTaxRate: 0,
        marginalRate: 0,
        monthlyTax: 0,
        summaryNote: ""
      }
    };
  }
  const { taxableIncome = 0, slabs = {}, grossTotalIncome = 0, finalTax = 0 } = results;
  const incomeLabel = getIncomeLabelForEmployment(results.employmentType);
  const slabBreakdown = SLAB_DEFINITIONS.map((def) => {
    const incomeInSlab = getIncomeInSlab(taxableIncome, def.min, def.max);
    const taxAmount = slabs[def.key] || 0;
    return {
      ...def,
      incomeInSlab,
      taxAmount,
      formulaText: buildSlabFormula(incomeInSlab, def.rate, taxAmount)
    };
  }).filter((row) => row.incomeInSlab > 0 || row.taxAmount > 0);
  let marginalRate = 0;
  for (let i = slabBreakdown.length - 1; i >= 0; i -= 1) {
    if (slabBreakdown[i].incomeInSlab > 0 && slabBreakdown[i].rate > 0) {
      marginalRate = slabBreakdown[i].rate;
      break;
    }
  }
  const effectiveTaxRate = grossTotalIncome > 0 ? finalTax / grossTotalIncome : 0;
  const monthlyTax = finalTax / 12;
  const calculationSteps = [];
  if (results.annualSalary > 0) {
    calculationSteps.push({
      title: incomeLabel,
      amount: results.annualSalary,
      note: "Your main annual income from salary, pension, or business."
    });
  }
  if (results.otherIncomeAnnual > 0) {
    calculationSteps.push({
      title: "Other income",
      amount: results.otherIncomeAnnual,
      note: "Additional annual income such as rent, interest, or freelance earnings."
    });
  }
  if (results.standardDeduction > 0) {
    calculationSteps.push({
      title: "Standard deduction",
      amount: -results.standardDeduction,
      note: TAX_BREAKDOWN_COPY.standardDeduction
    });
  }
  if (taxableIncome > 0 || grossTotalIncome > 0) {
    calculationSteps.push({
      title: "Taxable income",
      amount: taxableIncome,
      note: "The amount on which income tax slabs are applied.",
      isSubtotal: true
    });
  }
  if (taxableIncome > 0) {
    calculationSteps.push({
      title: "Tax from income slabs",
      amount: results.totalTaxBeforeRebate,
      note: "Tax calculated step-by-step across each income band below."
    });
  }
  if (results.rebate87A > 0) {
    calculationSteps.push({
      title: "Section 87A rebate",
      amount: -results.rebate87A,
      note: TAX_BREAKDOWN_COPY.rebate87A,
      isSaving: true
    });
  }
  if (results.marginalRelief > 0) {
    calculationSteps.push({
      title: "Marginal relief",
      amount: -results.marginalRelief,
      note: TAX_BREAKDOWN_COPY.marginalRelief,
      isSaving: true
    });
  }
  if (results.rebate87A > 0 || results.marginalRelief > 0) {
    calculationSteps.push({
      title: "Tax after rebate / relief",
      amount: results.taxAfterRebate,
      note: "Tax remaining after government rebate or marginal relief.",
      isSubtotal: true
    });
  }
  if (results.surcharge > 0) {
    calculationSteps.push({
      title: "Surcharge",
      amount: results.surcharge,
      note: TAX_BREAKDOWN_COPY.surcharge
    });
  }
  if (results.surchargeMarginalRelief > 0) {
    calculationSteps.push({
      title: "Marginal relief on surcharge",
      amount: -results.surchargeMarginalRelief,
      note: TAX_BREAKDOWN_COPY.surchargeMarginalRelief,
      isSaving: true
    });
  }
  if (results.cess > 0) {
    calculationSteps.push({
      title: "Health & Education Cess (4%)",
      amount: results.cess,
      note: TAX_BREAKDOWN_COPY.cess
    });
  }
  calculationSteps.push({
    title: "Final tax payable",
    amount: finalTax,
    note: "Your estimated annual income tax for FY 2025-26 (new regime).",
    isTotal: true
  });
  const adjustments = [];
  if (results.rebate87A > 0) {
    adjustments.push({
      title: "Section 87A rebate",
      amount: -results.rebate87A,
      note: TAX_BREAKDOWN_COPY.rebate87A
    });
  }
  if (results.marginalRelief > 0) {
    adjustments.push({
      title: "Marginal relief (above \u20B912 lakh)",
      amount: -results.marginalRelief,
      note: TAX_BREAKDOWN_COPY.marginalRelief
    });
  }
  if (results.surcharge > 0) {
    adjustments.push({
      title: "Surcharge",
      amount: results.surcharge,
      note: TAX_BREAKDOWN_COPY.surcharge
    });
  }
  if (results.surchargeMarginalRelief > 0) {
    adjustments.push({
      title: "Marginal relief on surcharge",
      amount: -results.surchargeMarginalRelief,
      note: TAX_BREAKDOWN_COPY.surchargeMarginalRelief
    });
  }
  if (results.cess > 0) {
    adjustments.push({
      title: "Health & Education Cess (4%)",
      amount: results.cess,
      note: TAX_BREAKDOWN_COPY.cess
    });
  }
  let summaryNote = "";
  if (taxableIncome <= 0 && grossTotalIncome <= 0) {
    summaryNote = TAX_BREAKDOWN_COPY.zeroTaxNoIncome;
  } else if (finalTax === 0 && results.rebate87A > 0) {
    summaryNote = TAX_BREAKDOWN_COPY.zeroTaxRebate;
  } else if (finalTax === 0) {
    summaryNote = "Based on your inputs, no income tax is payable under the new regime.";
  } else if (results.marginalRelief > 0) {
    summaryNote = "Marginal relief limited your tax because your income is just above \u20B912 lakh.";
  } else if (effectiveTaxRate < 0.05) {
    summaryNote = `You pay about ${(effectiveTaxRate * 100).toFixed(1)}% of your total income as tax\u2014your effective rate is low because of slab-based taxation and rebates.`;
  }
  return {
    slabBreakdown,
    calculationSteps,
    adjustments,
    insights: {
      effectiveTaxRate,
      marginalRate,
      monthlyTax,
      summaryNote
    }
  };
}
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
function calculateIncomeTax(monthlyIncomeObj, occupation) {
  const isSalaried = occupation?.toLowerCase() === "salaried";
  const employmentType = isSalaried ? "Private Sector" : "Business Owner";
  const detail = {
    ...createEmptyIncomeDetail(),
    inHandSalary: isSalaried ? monthlyIncomeObj.salary : "",
    takeHomeProfit: isSalaried ? "" : monthlyIncomeObj.salary,
    passiveIncome: monthlyIncomeObj.passive || "",
    otherIncome: [{ amount: monthlyIncomeObj.other || "" }],
    needTaxPlanning: false
  };
  return calculateIncomeTaxFromDetail(detail, employmentType);
}
var PENSIONER_STANDARD_DEDUCTION_NOTE = "We assume your pension is from a former employer (Central/State Government, PSU, or private sector), taxed under Salaries, and eligible for the \u20B975,000 standard deduction.";
var IN_HAND_SALARY_ESTIMATE_NOTE = "Estimated from in-hand salary only. Enable tax planning in Income Details and fill your salary slip for a gross-based calculation.";
var TAX_PLANNING_DISABLED_NOTE = "Income tax is not estimated because tax planning is disabled. Choose Yes under Tax planning in Income Details and fill your salary slip to calculate tax.";
var TAX_SLIP_REQUIRED_NOTE = "Fill your salary slip under Income Details to calculate income tax from your gross earnings and deductions.";
function showPensionerTaxNote(employmentType) {
  return isPensionerEmployment(employmentType);
}
function showInHandSalaryEstimateNote(detail, employmentType) {
  return false;
}
function showTaxPlanningDisabledNote(detail, employmentType) {
  return isSalariedEmployment(employmentType) && detail?.needTaxPlanning !== true;
}
function showTaxSlipRequiredNote(detail, employmentType) {
  return isSalariedEmployment(employmentType) && detail?.needTaxPlanning === true && !hasTaxSlipEarnings(detail);
}
function getIncomeLabelForEmployment(employmentType) {
  if (isSalariedEmployment(employmentType)) return "Annual Salary";
  if (isPensionerEmployment(employmentType)) return "Annual Pension";
  return "Gross Annual Income";
}
export {
  IN_HAND_SALARY_ESTIMATE_NOTE,
  PENSIONER_STANDARD_DEDUCTION_NOTE,
  REBATE_87A_INCOME_LIMIT,
  REBATE_87A_MAX,
  SLAB_DEFINITIONS,
  SURCHARGE_THRESHOLDS,
  TAX_BREAKDOWN_COPY,
  TAX_PLANNING_DISABLED_NOTE,
  TAX_SLIP_REQUIRED_NOTE,
  applyRebateAndMarginalRelief,
  applySurchargeMarginalRelief,
  buildTaxBreakdownPresentation,
  calculateIncomeTax,
  calculateIncomeTaxFromDetail,
  calculateIncomeTaxFromInput,
  calculateProjectedMemberTax,
  calculateSlabTax,
  calculateSurcharge,
  computeTaxPlusSurchargeBeforeCess,
  getIncomeLabelForEmployment,
  getSurchargeThreshold,
  showInHandSalaryEstimateNote,
  showPensionerTaxNote,
  showTaxPlanningDisabledNote,
  showTaxSlipRequiredNote
};
