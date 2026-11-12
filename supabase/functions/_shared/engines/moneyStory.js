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
function sumFixedDeposits(fixedDeposit) {
  return getAssetAmount(fixedDeposit);
}
var NON_SNAPSHOT_DETAIL_KEYS = [
  ["realEstate", "secondProperty"],
  ["realEstate", "landPlot"],
  ["vehicles", "idv"],
  ["valuables", "gold"],
  ["valuables", "art"],
  ["cash", "cashInHand"],
  ["investments", "equity"],
  ["investments", "fixedDeposit"],
  ["insurance", "ulip"],
  ["retirement", "epf"],
  ["retirement", "ppf"],
  ["retirement", "nps"]
];
var SUMMARY_ALIAS_DETAIL_KEYS = [
  ["investments", "mutualFunds"],
  ["cash", "savings"],
  ["realEstate", "residential"]
];
function hasWealthDetailEntered(assetCategories = {}) {
  if (Array.isArray(assetCategories.custom) && assetCategories.custom.some((c) => getAssetAmount(c?.value) > 0 || c?.label)) {
    return true;
  }
  if (NON_SNAPSHOT_DETAIL_KEYS.some(([cat, key]) => getAssetAmount(assetCategories[cat]?.[key]) > 0)) {
    return true;
  }
  return SUMMARY_ALIAS_DETAIL_KEYS.some(([cat, key]) => getAssetAmount(assetCategories[cat]?.[key]) > 0) && !isOnlyLegacySummaryScalars(assetCategories);
}
function isOnlyLegacySummaryScalars(assetCategories = {}) {
  const hasAlias = SUMMARY_ALIAS_DETAIL_KEYS.some(([cat, key]) => getAssetAmount(assetCategories[cat]?.[key]) > 0);
  if (!hasAlias) return false;
  if (NON_SNAPSHOT_DETAIL_KEYS.some(([cat, key]) => getAssetAmount(assetCategories[cat]?.[key]) > 0)) {
    return false;
  }
  if (Array.isArray(assetCategories.custom) && assetCategories.custom.length > 0) {
    return false;
  }
  return true;
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
function classifyWealthSnapshot(assetCategories = {}) {
  if (!hasWealthDetailEntered(assetCategories)) {
    const portfolio = getAssetAmount(assetCategories.summaryPortfolioValue);
    const liquid = getAssetAmount(assetCategories.summaryLiquidCash);
    const realEstate = getAssetAmount(assetCategories.summaryRealEstateAssets);
    const summaryTotal = portfolio + liquid + realEstate;
    if (summaryTotal > 0) {
      return {
        legacyTotal: realEstate,
        incomeTotal: portfolio + liquid,
        retirementTotal: 0,
        grandTotal: summaryTotal,
        legacyPercent: realEstate / summaryTotal * 100,
        incomePercent: (portfolio + liquid) / summaryTotal * 100,
        retirementPercent: 0
      };
    }
  }
  let legacy = [
    getAssetAmount(assetCategories.realEstate?.residential),
    getAssetAmount(assetCategories.realEstate?.secondProperty),
    getAssetAmount(assetCategories.vehicles?.idv),
    getAssetAmount(assetCategories.valuables?.gold),
    getAssetAmount(assetCategories.valuables?.art),
    ...Array.isArray(assetCategories.custom) ? assetCategories.custom.map((c) => getAssetAmount(c?.value)) : []
  ].reduce((s, v) => s + v, 0);
  let income = [
    getAssetAmount(assetCategories.realEstate?.landPlot),
    getAssetAmount(assetCategories.cash?.savings),
    getAssetAmount(assetCategories.cash?.cashInHand),
    getAssetAmount(assetCategories.investments?.equity),
    getAssetAmount(assetCategories.investments?.mutualFunds),
    sumFixedDeposits(assetCategories.investments?.fixedDeposit),
    getAssetAmount(assetCategories.insurance?.ulip)
  ].reduce((s, v) => s + v, 0);
  let retirement = [
    getAssetAmount(assetCategories.retirement?.epf),
    getAssetAmount(assetCategories.retirement?.ppf),
    getAssetAmount(assetCategories.retirement?.nps)
  ].reduce((s, v) => s + v, 0);
  if (legacy === 0) {
    legacy = getAssetAmount(assetCategories.summaryRealEstateAssets);
  }
  if (income === 0) {
    income = getAssetAmount(assetCategories.summaryPortfolioValue) + getAssetAmount(assetCategories.summaryLiquidCash);
  }
  const grandTotal = legacy + income + retirement;
  return {
    legacyTotal: legacy,
    incomeTotal: income,
    retirementTotal: retirement,
    grandTotal,
    legacyPercent: grandTotal > 0 ? legacy / grandTotal * 100 : 0,
    incomePercent: grandTotal > 0 ? income / grandTotal * 100 : 0,
    retirementPercent: grandTotal > 0 ? retirement / grandTotal * 100 : 0
  };
}

// apps/web/src/components/SummaryReport/MoneyStoryLogic.js
var classifyAssets = (assetCategories) => {
  const { legacyTotal, incomeTotal, retirementTotal, grandTotal, legacyPercent, incomePercent, retirementPercent } = classifyWealthSnapshot(assetCategories);
  const incomeBreakdown = [];
  const legacyBreakdown = [];
  if (incomeTotal > 0) incomeBreakdown.push({ category: "Income Assets", value: incomeTotal });
  if (legacyTotal > 0) legacyBreakdown.push({ category: "Legacy Assets", value: legacyTotal });
  if (retirementTotal > 0) incomeBreakdown.push({ category: "Retirement Accounts", value: retirementTotal });
  return {
    incomeTotal: incomeTotal + retirementTotal,
    legacyTotal,
    retirementTotal,
    grandTotal,
    incomePercent: grandTotal > 0 ? (incomeTotal + retirementTotal) / grandTotal * 100 : 0,
    legacyPercent,
    retirementPercent,
    incomeBreakdown,
    legacyBreakdown
  };
};
var calculateUnallocatedSurplus = (cashFlowResults) => {
  const surplus = cashFlowResults.surplus || 0;
  const totalSavings = cashFlowResults.totalSavings || 0;
  const unallocated = surplus - totalSavings;
  return {
    surplus,
    totalSavings,
    unallocated,
    yearlyUnallocated: unallocated * 12
  };
};
var calculateOwnedVsFinanced = (totalAssets, totalLiabilities) => {
  const total = totalAssets + totalLiabilities;
  if (total === 0) return { ownedPercent: 100, financedPercent: 0 };
  const ownedPercent = totalAssets / (totalAssets + totalLiabilities) * 100;
  const financedPercent = 100 - ownedPercent;
  return { ownedPercent, financedPercent };
};
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
var buildWaterfallData = (cashFlowResults) => {
  const income = cashFlowResults.totalIncome || 0;
  const household = cashFlowResults.categorySums?.household || 0;
  const emi = cashFlowResults.categorySums?.emi || 0;
  const insurance = cashFlowResults.categorySums?.insurance || 0;
  const savings = cashFlowResults.totalSavings || 0;
  const unallocated = income - household - emi - insurance - savings;
  return [
    {
      name: "Income",
      value: income,
      fill: "#10B981",
      base: 0,
      top: income
    },
    {
      name: "Household",
      value: household,
      fill: "#EF4444",
      base: income - household,
      top: income
    },
    {
      name: "EMIs",
      value: emi,
      fill: "#F59E0B",
      base: income - household - emi,
      top: income - household
    },
    {
      name: "Insurance",
      value: insurance,
      fill: "#8B5CF6",
      base: income - household - emi - insurance,
      top: income - household - emi
    },
    {
      name: "Savings",
      value: savings,
      fill: "#6366F1",
      base: income - household - emi - insurance - savings,
      top: income - household - emi - insurance
    },
    {
      name: "Surplus",
      value: Math.max(0, unallocated),
      fill: "#00A9F2",
      base: 0,
      top: Math.max(0, unallocated)
    }
  ];
};
var buildDetailAssetBreakdownData = (assetCategories, totalAssets) => {
  const categories = [
    { key: "realEstate", label: "Real Estate", color: "#6366F1" },
    { key: "cash", label: "Bank Savings", color: "#10B981" },
    { key: "investments", label: "Investments", color: "#00A9F2" },
    { key: "retirement", label: "Retirement", color: "#F59E0B" },
    { key: "insurance", label: "Insurance", color: "#8B5CF6" },
    { key: "valuables", label: "Gold & Valuables", color: "#EC4899" },
    { key: "vehicles", label: "Vehicles", color: "#64748B" },
    { key: "others", label: "Others", color: "#94A3B8" }
  ];
  return categories.map((cat) => {
    const items = assetCategories[cat.key];
    if (!items || typeof items !== "object") return null;
    const total = Array.isArray(items) ? items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) : Object.values(items).reduce((sum, val) => sum + getAssetAmount(val), 0);
    if (total <= 0) return null;
    return {
      name: cat.label,
      value: total,
      percentage: Math.round(total / totalAssets * 100),
      color: cat.color
    };
  }).filter(Boolean).sort((a, b) => b.value - a.value);
};
function buildSummaryAssetBreakdownData(assetCategories, totalAssets) {
  const snapshots = [
    { key: "summaryPortfolioValue", label: "Investments", color: "#00A9F2" },
    { key: "summaryLiquidCash", label: "Bank Savings", color: "#10B981" },
    { key: "summaryRealEstateAssets", label: "Real Estate", color: "#6366F1" }
  ];
  return snapshots.map((snap) => {
    const value = getAssetAmount(assetCategories[snap.key]);
    if (value <= 0) return null;
    return {
      name: snap.label,
      value,
      percentage: Math.round(value / totalAssets * 100),
      color: snap.color
    };
  }).filter(Boolean).sort((a, b) => b.value - a.value);
}
var buildAssetBreakdownData = (assetCategories, totalAssets) => {
  if (totalAssets <= 0) return [];
  if (!hasWealthDetailEntered(assetCategories)) {
    const summaryData = buildSummaryAssetBreakdownData(assetCategories, totalAssets);
    if (summaryData.length > 0) return summaryData;
  }
  const detailBreakdown = buildDetailAssetBreakdownData(assetCategories, totalAssets);
  if (detailBreakdown.length > 0) return detailBreakdown;
  return buildSummaryAssetBreakdownData(assetCategories, totalAssets);
};
var buildLiabilityBreakdownData = (liabilityCategories, totalLiabilities) => {
  if (totalLiabilities <= 0) return [];
  const labels = {
    home: "Outstanding Loans",
    personal: "Other Payables",
    car: "Car Loan",
    education: "Education Loan",
    otherEmis: "Other EMIs",
    creditCard: "Credit Card Dues"
  };
  const result = [];
  const loans = liabilityCategories.loans || {};
  Object.entries(loans).forEach(([key, value]) => {
    const amount = getAssetAmount(value);
    if (amount > 0) {
      result.push({
        name: labels[key] || key,
        value: amount,
        percentage: Math.round(amount / totalLiabilities * 100)
      });
    }
  });
  if (Array.isArray(liabilityCategories.custom)) {
    liabilityCategories.custom.forEach((item) => {
      const amount = parseFloat(item.value) || 0;
      if (amount > 0) {
        result.push({
          name: item.label || "Other",
          value: amount,
          percentage: Math.round(amount / totalLiabilities * 100)
        });
      }
    });
  }
  if (result.length > 0) return result.sort((a, b) => b.value - a.value);
  if (!hasLiabilityDetailEntered(liabilityCategories)) {
    const snapshots = [
      { key: "summaryOutstandingLoans", label: "Outstanding Loans" },
      { key: "summaryCreditCardDues", label: "Credit Card Dues" },
      { key: "summaryOtherPayables", label: "Other Payables" }
    ];
    snapshots.forEach((snap) => {
      const amount = getAssetAmount(liabilityCategories[snap.key]);
      if (amount > 0) {
        result.push({
          name: snap.label,
          value: amount,
          percentage: Math.round(amount / totalLiabilities * 100)
        });
      }
    });
  }
  return result.sort((a, b) => b.value - a.value);
};
var formatCompact = (amount) => {
  if (amount >= 1e7) {
    return `\u20B9${(amount / 1e7).toFixed(2)} Cr`;
  } else if (amount >= 1e5) {
    return `\u20B9${(amount / 1e5).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};
export {
  buildAssetBreakdownData,
  buildLiabilityBreakdownData,
  buildWaterfallData,
  calculateOwnedVsFinanced,
  calculateUnallocatedSurplus,
  classifyAssets,
  computeSIPProjection,
  formatCompact
};
