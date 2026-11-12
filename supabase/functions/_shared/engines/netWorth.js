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
function getSummaryAssetTotal(assetCategories = {}) {
  return getAssetAmount(assetCategories.summaryPortfolioValue) + getAssetAmount(assetCategories.summaryLiquidCash) + getAssetAmount(assetCategories.summaryRealEstateAssets);
}
function getSummaryLiabilityTotal(liabilityCategories = {}, hasEMI = false) {
  let total = getAssetAmount(liabilityCategories.summaryCreditCardDues) + getAssetAmount(liabilityCategories.summaryOtherPayables);
  if (hasEMI) {
    total += getAssetAmount(liabilityCategories.summaryOutstandingLoans);
  }
  return total;
}

// apps/web/src/components/AssetModule/AssetLogic.js
var calculateNetWorth = (assetCategories = {}, liabilityCategories = {}) => {
  const assetBreakdown = [];
  const processItems = (categories, isAsset = true) => {
    let total = 0;
    if (!categories) return total;
    const validCategories = [
      "realEstate",
      "vehicles",
      "valuables",
      "cash",
      "investments",
      "insurance",
      "retirement",
      "others",
      "loans",
      "custom"
    ];
    Object.entries(categories).forEach(([catKey, items]) => {
      if (!validCategories.includes(catKey)) return;
      if (catKey === "custom" && Array.isArray(items)) {
        items.forEach((item) => {
          const amount = parseFloat(item.value) || 0;
          total += amount;
          if (isAsset && amount > 0) {
            assetBreakdown.push({
              name: item.label || "Other Asset",
              category: "Custom Assets",
              value: amount
            });
          }
        });
      } else if (typeof items === "object" && items !== null) {
        Object.entries(items).forEach(([itemKey, value]) => {
          const amount = getAssetAmount(value);
          total += amount;
          if (isAsset && amount > 0) {
            assetBreakdown.push({
              name: getItemLabel(itemKey),
              category: getCategoryLabel(catKey),
              value: amount
            });
          }
        });
      }
    });
    return total;
  };
  let totalAssets = processItems(assetCategories, true);
  let totalLiabilities = processItems(liabilityCategories, false);
  if (!hasWealthDetailEntered(assetCategories)) {
    const summaryTotal = getSummaryAssetTotal(assetCategories);
    if (summaryTotal > 0) {
      totalAssets = summaryTotal;
    } else {
      totalAssets += summaryTotal;
    }
  }
  if (!hasLiabilityDetailEntered(liabilityCategories)) {
    const includeLoans = getAssetAmount(liabilityCategories?.summaryOutstandingLoans) > 0;
    const summaryLiabTotal = getSummaryLiabilityTotal(liabilityCategories || {}, includeLoans);
    if (summaryLiabTotal > 0) {
      totalLiabilities = summaryLiabTotal;
    } else {
      totalLiabilities += summaryLiabTotal;
    }
  }
  const netWorth = totalAssets - totalLiabilities;
  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    assetBreakdown,
    allocation: calculateAllocation(assetBreakdown, totalAssets)
  };
};
var calculateAllocation = (breakdown, total) => {
  if (total === 0) return [];
  const grouped = breakdown.reduce((acc, item) => {
    const category = item.category || "Others";
    acc[category] = (acc[category] || 0) + item.value;
    return acc;
  }, {});
  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
    percentage: value / total * 100
  }));
};
var getCategoryLabel = (key) => {
  const labels = {
    realEstate: "Real Estate",
    vehicles: "Vehicles",
    valuables: "Valuables & Art",
    cash: "Liquid Assets",
    investments: "Investments",
    insurance: "Insurance (Cash Value)",
    retirement: "Retirement Accounts",
    others: "Other Assets",
    loans: "Liabilities / Loans",
    custom: "Custom Items"
  };
  return labels[key] || key;
};
var getItemLabel = (key) => {
  const labels = {
    // Assets
    residential: "Residential House",
    secondProperty: "Second Property",
    landPlot: "Land / Plot (Investment Purpose)",
    idv: "Vehicles (IDV)",
    gold: "Gold Jewellery",
    art: "Art / Collectibles",
    savings: "Bank Savings",
    cashInHand: "Cash-in-hand",
    equity: "Equity Investments",
    mutualFunds: "Mutual Funds Portfolio",
    fixedDeposit: "Fixed Deposit",
    recurringDeposit: "Recurring Deposit",
    savingPlans: "Saving Plans",
    ulip: "ULIP",
    epf: "EPF",
    ppf: "PPF",
    nps: "NPS",
    other: "Other Assets",
    // Liabilities
    home: "Home Loan",
    personal: "Personal Loan",
    car: "Car Loan",
    education: "Education Loan",
    otherEmis: "Other EMIs",
    creditCard: "Credit Card"
  };
  return labels[key] || key;
};
export {
  calculateNetWorth,
  getCategoryLabel,
  getItemLabel
};
