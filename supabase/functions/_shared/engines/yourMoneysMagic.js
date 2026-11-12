// apps/web/src/components/Calculators/SIPCalculator.jsx
var computeSIPData = (currentYear, monthlySIP, expectedReturns, tenureYears, currentValue, events, proposedSIPs, goalMappings = {}, goals = []) => {
  let results = [];
  let runningBalance = currentValue;
  let runningSIP = monthlySIP;
  for (let relativeYear = 1; relativeYear <= tenureYears; relativeYear++) {
    let yearlyInvestment = 0;
    let yearlyWithdrawal = 0;
    const actualYear = currentYear + relativeYear - 1;
    let totalRoadmapWithdrawalThisYear = 0;
    goals.forEach((g) => {
      const goalYear = currentYear + Math.round(parseFloat(g.yearsToGoal) || 0);
      if (goalYear === actualYear) {
        const mappedAmount = (goalMappings[g.id] || {})["sip"] || 0;
        if (mappedAmount > 0) {
          totalRoadmapWithdrawalThisYear += parseFloat(mappedAmount);
        }
      }
    });
    for (let month = 1; month <= 12; month++) {
      const increments = events.filter((e) => e.type === "increment" && parseInt(e.month) === month && parseInt(e.year) === actualYear);
      increments.forEach((inc) => {
        runningSIP += parseFloat(inc.amount) || 0;
      });
      const autoSIPs = proposedSIPs.filter((s) => parseInt(s.startYear) === actualYear && parseInt(s.startMonth) === month);
      autoSIPs.forEach((s) => {
        runningSIP += parseFloat(s.amount) / 12 || 0;
      });
      const withdrawals = events.filter((e) => e.type === "withdrawal" && parseInt(e.month) === month && parseInt(e.year) === actualYear);
      let currentMonthWithdrawal = withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
      if (month === 1) {
        currentMonthWithdrawal += totalRoadmapWithdrawalThisYear;
      }
      const monthlyInvestment = runningSIP;
      yearlyInvestment += monthlyInvestment;
      const monthlyRate = expectedReturns / 1200;
      const valueBeforeGrowth = runningBalance + monthlyInvestment;
      const growth = valueBeforeGrowth * monthlyRate;
      const valueBeforeWithdrawal = valueBeforeGrowth + growth;
      runningBalance = valueBeforeWithdrawal - currentMonthWithdrawal;
      yearlyWithdrawal += currentMonthWithdrawal;
    }
    results.push({
      year: actualYear,
      monthlyInvestment: runningSIP,
      annualInvestment: yearlyInvestment,
      endValueBeforeWithdrawal: runningBalance + yearlyWithdrawal,
      withdrawal: yearlyWithdrawal,
      valueAfterWithdrawal: runningBalance
    });
  }
  return results;
};

// apps/web/src/components/Calculators/LumpsumCalculator.jsx
var computeLumpsumData = (investmentAmount, expectedReturns, tenureYears, startMonth, startYear, events, proposedLumpsums, goalMappings = {}, goals = []) => {
  let results = [];
  let runningBalance = investmentAmount;
  const monthlyMultiplier = Math.pow(1 + expectedReturns / 100, 1 / 12);
  let currentMonthVal = startMonth;
  let currentYearVal = startYear;
  const totalMonths = tenureYears * 12;
  let yearlyRecord = {
    year: currentYearVal,
    investmentAndAddition: 0,
    withdrawal: 0,
    endValueBeforeWithdrawal: 0,
    valueAfterWithdrawal: 0
  };
  for (let m = 0; m < totalMonths; m++) {
    if (m === 0) {
      yearlyRecord.investmentAndAddition += investmentAmount;
    }
    let totalRoadmapWithdrawalThisMonth = 0;
    if (currentMonthVal === 12 || m === totalMonths - 1) {
      goals.forEach((g) => {
        const actualGoalYear = (/* @__PURE__ */ new Date()).getFullYear() + Math.round(parseFloat(g.yearsToGoal) || 0);
        if (actualGoalYear === currentYearVal) {
          const mappedAmount = (goalMappings[g.id] || {})["lumpsum"] || 0;
          if (mappedAmount > 0) {
            totalRoadmapWithdrawalThisMonth += parseFloat(mappedAmount);
          }
        }
      });
    }
    const monthlyEvents = events.filter((e) => parseInt(e.month) === currentMonthVal && parseInt(e.year) === currentYearVal);
    let monthManualWithdrawal = 0;
    monthlyEvents.forEach((e) => {
      if (e.type === "addition") {
        runningBalance += parseFloat(e.amount) || 0;
        yearlyRecord.investmentAndAddition += parseFloat(e.amount) || 0;
      } else if (e.type === "withdrawal") {
        monthManualWithdrawal += parseFloat(e.amount) || 0;
      }
    });
    const totalWithdrawal = monthManualWithdrawal + totalRoadmapWithdrawalThisMonth;
    yearlyRecord.withdrawal += totalWithdrawal;
    runningBalance -= totalWithdrawal;
    const autoLumpsums = proposedLumpsums.filter((l) => parseInt(l.startYear) === currentYearVal && parseInt(l.startMonth) === currentMonthVal);
    autoLumpsums.forEach((l) => {
      const amount = parseFloat(l.amount) || 0;
      runningBalance += amount;
      yearlyRecord.investmentAndAddition += amount;
    });
    runningBalance *= monthlyMultiplier;
    if (currentMonthVal === 12 || m === totalMonths - 1) {
      yearlyRecord.endValueBeforeWithdrawal = runningBalance + yearlyRecord.withdrawal;
      yearlyRecord.valueAfterWithdrawal = runningBalance;
      results.push({ ...yearlyRecord });
      if (m < totalMonths - 1) {
        currentYearVal++;
        yearlyRecord = {
          year: currentYearVal,
          investmentAndAddition: 0,
          withdrawal: 0,
          endValueBeforeWithdrawal: 0,
          valueAfterWithdrawal: 0
        };
      }
    }
    currentMonthVal = currentMonthVal % 12 + 1;
  }
  return results;
};

// apps/web/src/components/Calculators/EquityCalculator.jsx
var computeEquityData = (currentValue, expectedReturns, tenureYears, startMonth, startYear, events, proposedEquities, goalMappings = {}, goals = []) => {
  let results = [];
  let runningBalance = currentValue;
  const monthlyMultiplier = Math.pow(1 + expectedReturns / 100, 1 / 12);
  let currentMonthVal = startMonth;
  let currentYearVal = startYear;
  const totalMonths = tenureYears * 12;
  let yearlyRecord = {
    year: currentYearVal,
    investmentAndAddition: 0,
    withdrawal: 0,
    endValueBeforeWithdrawal: 0,
    valueAfterWithdrawal: 0
  };
  for (let m = 0; m < totalMonths; m++) {
    if (m === 0) {
      yearlyRecord.investmentAndAddition += currentValue;
    }
    let totalRoadmapWithdrawalThisMonth = 0;
    if (currentMonthVal === 1) {
      goals.forEach((g) => {
        const actualGoalYear = (/* @__PURE__ */ new Date()).getFullYear() + Math.round(parseFloat(g.yearsToGoal) || 0);
        if (actualGoalYear === currentYearVal) {
          const mappedAmount = (goalMappings[g.id] || {})["equity"] || 0;
          if (mappedAmount > 0) {
            totalRoadmapWithdrawalThisMonth += parseFloat(mappedAmount);
          }
        }
      });
    }
    const monthlyEvents = events.filter((e) => parseInt(e.month) === currentMonthVal && parseInt(e.year) === currentYearVal);
    let monthManualWithdrawal = 0;
    monthlyEvents.forEach((e) => {
      if (e.type === "addition") {
        runningBalance += parseFloat(e.amount) || 0;
        yearlyRecord.investmentAndAddition += parseFloat(e.amount) || 0;
      } else if (e.type === "withdrawal") {
        monthManualWithdrawal += parseFloat(e.amount) || 0;
      }
    });
    const totalWithdrawal = monthManualWithdrawal + totalRoadmapWithdrawalThisMonth;
    yearlyRecord.withdrawal += totalWithdrawal;
    runningBalance -= totalWithdrawal;
    const autoLumpsums = proposedEquities.filter((l) => parseInt(l.startYear) === currentYearVal && parseInt(l.startMonth) === currentMonthVal);
    autoLumpsums.forEach((l) => {
      const amount = parseFloat(l.amount) || 0;
      runningBalance += amount;
      yearlyRecord.investmentAndAddition += amount;
    });
    runningBalance *= monthlyMultiplier;
    if (currentMonthVal === 12 || m === totalMonths - 1) {
      yearlyRecord.valueAfterWithdrawal = runningBalance;
      yearlyRecord.endValueBeforeWithdrawal = runningBalance + yearlyRecord.withdrawal;
      results.push({ ...yearlyRecord });
      if (m < totalMonths - 1) {
        currentYearVal++;
        yearlyRecord = {
          year: currentYearVal,
          investmentAndAddition: 0,
          withdrawal: 0,
          endValueBeforeWithdrawal: 0,
          valueAfterWithdrawal: 0
        };
      }
    }
    currentMonthVal = currentMonthVal % 12 + 1;
  }
  return results;
};

// apps/web/src/components/Calculators/PPFCalculator.jsx
var computePPFData = (proposedPPFs, expectedReturns, defaultPPFObj = {}) => {
  let results = [];
  const today = /* @__PURE__ */ new Date();
  let baseStartYear = today.getFullYear();
  let baseStartMonth = today.getMonth() + 1;
  const monthlyBaselineP = parseFloat(defaultPPFObj?.amount !== void 0 ? defaultPPFObj.amount : defaultPPFObj) || 0;
  if (monthlyBaselineP > 0) {
    baseStartYear = parseInt(defaultPPFObj?.startYear) || baseStartYear;
    baseStartMonth = parseInt(defaultPPFObj?.startMonth) || baseStartMonth;
  } else if (proposedPPFs.length > 0) {
    const earliest = proposedPPFs.reduce(
      (min, p) => p.startYear < min.startYear || p.startYear === min.startYear && p.startMonth < min.startMonth ? p : min,
      proposedPPFs[0]
    );
    baseStartYear = earliest.startYear;
    baseStartMonth = earliest.startMonth;
  }
  const startAbsolute = baseStartYear * 12 + baseStartMonth;
  const maturityAbsolute = startAbsolute + 180 - 1;
  const startString = `${new Date(baseStartYear, baseStartMonth - 1).toLocaleString("default", { month: "short" })} ${baseStartYear}`;
  const maturityYear = Math.floor((maturityAbsolute - 1) / 12);
  const maturityMonth = (maturityAbsolute - 1) % 12;
  const endString = `${new Date(maturityYear, maturityMonth).toLocaleString("default", { month: "short" })} ${maturityYear}`;
  let currentYearVal = baseStartYear;
  let currentMonthVal = baseStartMonth;
  let currentAbsolute = startAbsolute;
  let openingBalance = 0;
  let yearlyInvestment = 0;
  while (currentAbsolute <= maturityAbsolute) {
    let currentMonthInvestment = 0;
    if (monthlyBaselineP > 0) {
      currentMonthInvestment += monthlyBaselineP;
    }
    proposedPPFs.forEach((p) => {
      const pStartAbsolute = p.startYear * 12 + p.startMonth;
      const pEndAbsolute = pStartAbsolute + parseInt(p.duration) * 12 - 1;
      if (currentAbsolute >= pStartAbsolute && currentAbsolute <= pEndAbsolute) {
        currentMonthInvestment += parseFloat(p.amount) / 12 || 0;
      }
    });
    if (yearlyInvestment + currentMonthInvestment > 15e4) {
      currentMonthInvestment = 15e4 - yearlyInvestment;
    }
    if (currentMonthInvestment < 0) currentMonthInvestment = 0;
    yearlyInvestment += currentMonthInvestment;
    if (currentMonthVal === 12 || currentAbsolute === maturityAbsolute) {
      const interest = (openingBalance + yearlyInvestment) * ((parseFloat(expectedReturns) || 0) / 100);
      const endValue = openingBalance + yearlyInvestment + interest;
      results.push({
        year: currentYearVal,
        investment: yearlyInvestment,
        interest,
        endValue
      });
      openingBalance = endValue;
      yearlyInvestment = 0;
      if (currentAbsolute < maturityAbsolute) {
        currentYearVal++;
      }
    }
    currentAbsolute++;
    currentMonthVal = currentMonthVal % 12 + 1;
  }
  return { results, startString, endString };
};

// apps/web/src/components/Calculators/NPSCalculator.jsx
var computeNPSData = (proposedNPS, expectedReturns, annuityPercent, annuityRate, selfMember, defaultNPSObj = {}, defaultCorpus = 0) => {
  const today = /* @__PURE__ */ new Date();
  let birthYear = today.getFullYear() - 30;
  let birthMonth = today.getMonth() + 1;
  if (selfMember?.dob) {
    const d = new Date(selfMember.dob);
    if (!isNaN(d.getTime())) {
      birthYear = d.getFullYear();
      birthMonth = d.getMonth() + 1;
    }
  }
  const retirementAge = parseInt(selfMember?.retirementAge) || 60;
  const maturityAbsolute = (birthYear + retirementAge) * 12 + birthMonth;
  let baseStartYear = today.getFullYear();
  let baseStartMonth = today.getMonth() + 1;
  const monthlyBaselineP = parseFloat(defaultNPSObj?.amount !== void 0 ? defaultNPSObj.amount : defaultNPSObj) || 0;
  if (monthlyBaselineP > 0) {
    baseStartYear = parseInt(defaultNPSObj?.startYear) || baseStartYear;
    baseStartMonth = parseInt(defaultNPSObj?.startMonth) || baseStartMonth;
  }
  if (proposedNPS.length > 0) {
    const earliestProposedYear = Math.min(...proposedNPS.map((p) => p.startYear));
    if (earliestProposedYear < baseStartYear) {
      baseStartYear = earliestProposedYear;
      const earliestNPS = proposedNPS.find((p) => p.startYear === baseStartYear);
      baseStartMonth = earliestNPS ? Math.min(baseStartMonth, earliestNPS.startMonth) : baseStartMonth;
    }
  }
  const startAbsolute = baseStartYear * 12 + baseStartMonth;
  const baselineStartAbsolute = monthlyBaselineP > 0 ? parseInt(defaultNPSObj?.startYear || baseStartYear) * 12 + parseInt(defaultNPSObj?.startMonth || baseStartMonth) : startAbsolute;
  let schedule = [];
  let currentAbsolute = startAbsolute;
  let currentYearVal = baseStartYear;
  let currentMonthVal = baseStartMonth;
  let openingBalance = parseFloat(defaultCorpus) || 0;
  let yearlyInvestment = 0;
  let yearlyInterest = 0;
  let globalInvestment = 0;
  const monthlyRate = (parseFloat(expectedReturns) || 0) / 100 / 12;
  while (currentAbsolute <= maturityAbsolute) {
    let monthlyInvestment = 0;
    if (monthlyBaselineP > 0 && currentAbsolute >= baselineStartAbsolute) {
      const baselineDurationMonths = parseInt(defaultNPSObj?.duration) ? parseInt(defaultNPSObj.duration) * 12 : Infinity;
      if (currentAbsolute - baselineStartAbsolute < baselineDurationMonths) {
        monthlyInvestment += monthlyBaselineP;
      }
    }
    proposedNPS.forEach((p) => {
      const pStartAbsolute = p.startYear * 12 + p.startMonth;
      const pEndAbsolute = pStartAbsolute + parseInt(p.duration) * 12 - 1;
      if (currentAbsolute >= pStartAbsolute && currentAbsolute <= pEndAbsolute) {
        monthlyInvestment += parseFloat(p.amount) / 12 || 0;
      }
    });
    const interest = (openingBalance + monthlyInvestment) * monthlyRate;
    yearlyInvestment += monthlyInvestment;
    globalInvestment += monthlyInvestment;
    yearlyInterest += interest;
    openingBalance = openingBalance + monthlyInvestment + interest;
    if (currentMonthVal === 12 || currentAbsolute === maturityAbsolute) {
      let ageAtYearEnd = currentYearVal - birthYear;
      if (currentMonthVal < birthMonth) {
        ageAtYearEnd--;
      }
      schedule.push({
        year: currentYearVal,
        age: ageAtYearEnd,
        investment: yearlyInvestment,
        interest: yearlyInterest,
        endValue: openingBalance
      });
      yearlyInvestment = 0;
      yearlyInterest = 0;
      if (currentAbsolute < maturityAbsolute) {
        currentYearVal++;
      }
    }
    currentAbsolute++;
    currentMonthVal = currentMonthVal % 12 + 1;
  }
  const maturityCorpus = schedule.length > 0 ? schedule[schedule.length - 1].endValue : 0;
  const validAnnuityPercent = parseFloat(annuityPercent) || 40;
  const validAnnuityRate = parseFloat(annuityRate) || 6;
  const annuityAmount = maturityCorpus * (validAnnuityPercent / 100);
  const lumpSumAmount = maturityCorpus - annuityAmount;
  const monthlyPension = annuityAmount * (validAnnuityRate / 100) / 12;
  return {
    schedule,
    totals: {
      maturityCorpus,
      globalInvestment,
      annuityAmount,
      lumpSumAmount,
      monthlyPension,
      retirementAge
    }
  };
};

// apps/web/src/components/Calculators/FDCalculator.jsx
var computeFDData = (proposedFDs, expectedReturns, frequency, rawBaselineFDs = []) => {
  let freqMonths = 3;
  if (frequency === "Monthly") freqMonths = 1;
  if (frequency === "Half-Yearly") freqMonths = 6;
  if (frequency === "Annually") freqMonths = 12;
  const today = /* @__PURE__ */ new Date();
  let baseStartYear = today.getFullYear();
  let baseStartMonth = today.getMonth() + 1;
  let startAbsolute = baseStartYear * 12 + baseStartMonth;
  let latestEndAbsolute = startAbsolute + 12;
  const baselineFDs = Array.isArray(rawBaselineFDs) ? rawBaselineFDs : rawBaselineFDs ? [rawBaselineFDs] : [];
  baselineFDs.forEach((fd) => {
    const p = parseFloat(fd?.amount !== void 0 ? fd.amount : fd) || 0;
    if (p > 0) {
      baseStartYear = Math.min(baseStartYear, parseInt(fd?.startYear) || baseStartYear);
      baseStartMonth = Math.min(baseStartMonth, parseInt(fd?.startMonth) || baseStartMonth);
      startAbsolute = baseStartYear * 12 + baseStartMonth;
      const endAbsolute = startAbsolute + parseInt(fd?.duration || 10) * 12 - 1;
      if (endAbsolute > latestEndAbsolute) latestEndAbsolute = endAbsolute;
    }
  });
  if (proposedFDs.length > 0) {
    let earliestProposedYear = Math.min(...proposedFDs.map((p) => p.startYear));
    if (earliestProposedYear <= baseStartYear) {
      baseStartYear = earliestProposedYear;
      let earliestFDs = proposedFDs.filter((p) => p.startYear === baseStartYear);
      baseStartMonth = Math.min(baseStartMonth, ...earliestFDs.map((p) => p.startMonth));
      startAbsolute = baseStartYear * 12 + baseStartMonth;
    }
    const proposedMaxMap = Math.max(...proposedFDs.map((p) => p.startYear * 12 + p.startMonth + parseInt(p.duration) * 12 - 1));
    if (proposedMaxMap > latestEndAbsolute) latestEndAbsolute = proposedMaxMap;
  }
  let fds = proposedFDs.map((p) => ({
    id: p.id,
    startAbsolute: p.startYear * 12 + p.startMonth,
    endAbsolute: p.startYear * 12 + p.startMonth + parseInt(p.duration) * 12 - 1,
    principal: parseFloat(p.amount) || 0,
    compoundingBase: parseFloat(p.amount) || 0,
    uncompoundedInterest: 0,
    totalInterest: 0,
    active: false,
    matured: false
  }));
  baselineFDs.forEach((fd, idx) => {
    const p = parseFloat(fd?.amount !== void 0 ? fd.amount : fd) || 0;
    if (p > 0) {
      const blStart = parseInt(fd?.startYear || baseStartYear) * 12 + parseInt(fd?.startMonth || baseStartMonth);
      fds.push({
        id: `baseline-fd-${idx}`,
        startAbsolute: blStart,
        endAbsolute: blStart + parseInt(fd?.duration || 1) * 12 - 1,
        // Fix: default FD duration is generally 1 year
        principal: p,
        compoundingBase: p,
        uncompoundedInterest: 0,
        totalInterest: 0,
        active: false,
        matured: false
      });
    }
  });
  const periodicRate = (parseFloat(expectedReturns) || 0) / 100 / 12;
  let schedule = [];
  let currentAbsolute = startAbsolute;
  let currentYearVal = baseStartYear;
  let currentMonthVal = baseStartMonth;
  let yearlyDeposit = 0;
  let yearlyInterest = 0;
  let yearlyMaturity = 0;
  let globalInterest = 0;
  let globalDeposit = 0;
  let yearlyOpening = fds.filter((f) => f.startAbsolute === currentAbsolute).reduce((sum, f) => sum + f.principal, 0);
  while (currentAbsolute <= latestEndAbsolute) {
    let monthInterest = 0;
    fds.forEach((fd) => {
      if (currentAbsolute === fd.startAbsolute) {
        fd.active = true;
        if (currentAbsolute !== startAbsolute) {
          yearlyDeposit += fd.principal;
        }
        globalDeposit += fd.principal;
      }
      if (fd.active && !fd.matured) {
        const interest = fd.compoundingBase * periodicRate;
        fd.uncompoundedInterest += interest;
        fd.totalInterest += interest;
        monthInterest += interest;
        globalInterest += interest;
        const monthsActive = currentAbsolute - fd.startAbsolute + 1;
        if (monthsActive % freqMonths === 0) {
          fd.compoundingBase += fd.uncompoundedInterest;
          fd.uncompoundedInterest = 0;
        }
      }
      if (currentAbsolute === fd.endAbsolute && fd.active) {
        fd.active = false;
        fd.matured = true;
        fd.compoundingBase += fd.uncompoundedInterest;
        fd.uncompoundedInterest = 0;
        yearlyMaturity += fd.compoundingBase;
      }
    });
    yearlyInterest += monthInterest;
    if (currentMonthVal === 12 || currentAbsolute === latestEndAbsolute) {
      let closingBalance = fds.filter((f) => f.active && !f.matured).reduce((sum, f) => sum + f.compoundingBase + f.uncompoundedInterest, 0);
      schedule.push({
        year: currentYearVal,
        openingValue: yearlyOpening,
        deposit: yearlyDeposit,
        interest: yearlyInterest,
        maturityValue: yearlyMaturity,
        endValue: closingBalance
      });
      yearlyOpening = closingBalance;
      yearlyDeposit = 0;
      yearlyInterest = 0;
      yearlyMaturity = 0;
      if (currentAbsolute < latestEndAbsolute) {
        currentYearVal++;
      }
    }
    currentAbsolute++;
    currentMonthVal = currentMonthVal % 12 + 1;
  }
  const totals = {
    globalDeposit,
    globalInterest,
    finalMaturity: fds.filter((f) => f.matured).reduce((sum, f) => sum + f.compoundingBase, 0) || fds.reduce((sum, f) => sum + f.compoundingBase + f.uncompoundedInterest, 0)
  };
  return { schedule, totals };
};

// apps/web/src/components/Calculators/RDCalculator.jsx
var computeRDData = (allRDStreams = [], expectedReturns = 7) => {
  const freqMonths = 3;
  if (!allRDStreams || allRDStreams.length === 0) {
    return { schedule: [], totals: { globalDeposit: 0, globalInterest: 0, finalMaturity: 0 } };
  }
  let startAbsolute = Math.min(...allRDStreams.map((s) => s.startYear * 12 + s.startMonth));
  let latestEndAbsolute = Math.max(...allRDStreams.map((s) => s.startYear * 12 + s.startMonth + parseInt(s.duration) * 12 - 1));
  let baseStartYear = Math.floor((startAbsolute - 1) / 12);
  let baseStartMonth = (startAbsolute - 1) % 12 + 1;
  let rds = allRDStreams.map((p) => ({
    id: p.id,
    name: p.name,
    startAbsolute: p.startYear * 12 + p.startMonth,
    endAbsolute: p.startYear * 12 + p.startMonth + parseInt(p.duration) * 12 - 1,
    monthlyAmount: p.isBaseline ? parseFloat(p.amount) || 0 : (parseFloat(p.amount) || 0) / 12,
    // Baseline amount is monthly, Allocation amount is annual
    compoundingBase: 0,
    uncompoundedInterest: 0,
    active: false,
    matured: false
  }));
  const periodicRate = (parseFloat(expectedReturns) || 0) / 100 / 12;
  let schedule = [];
  let currentAbsolute = startAbsolute;
  let currentYearVal = baseStartYear;
  let currentMonthVal = baseStartMonth;
  let yearlyOpening = 0;
  let yearlyDeposit = 0;
  let yearlyInterest = 0;
  let yearlyMaturity = 0;
  let globalInterest = 0;
  let globalDeposit = 0;
  while (currentAbsolute <= latestEndAbsolute) {
    let monthInterest = 0;
    rds.forEach((rd) => {
      if (currentAbsolute === rd.startAbsolute) {
        rd.active = true;
      }
      if (rd.active && !rd.matured) {
        let monthlyP = 0;
        if (currentAbsolute <= rd.endAbsolute) {
          monthlyP = rd.monthlyAmount;
          rd.compoundingBase += monthlyP;
          yearlyDeposit += monthlyP;
          globalDeposit += monthlyP;
        }
        const interest = rd.compoundingBase * periodicRate;
        rd.uncompoundedInterest += interest;
        monthInterest += interest;
        globalInterest += interest;
        const monthsActive = currentAbsolute - rd.startAbsolute + 1;
        if (monthsActive > 0 && monthsActive % freqMonths === 0) {
          rd.compoundingBase += rd.uncompoundedInterest;
          rd.uncompoundedInterest = 0;
        }
      }
      if (currentAbsolute === rd.endAbsolute && rd.active) {
        rd.active = false;
        rd.matured = true;
        rd.compoundingBase += rd.uncompoundedInterest;
        rd.uncompoundedInterest = 0;
        yearlyMaturity += rd.compoundingBase;
      }
    });
    yearlyInterest += monthInterest;
    if (currentMonthVal === 12 || currentAbsolute === latestEndAbsolute) {
      let closingBalance = rds.filter((rd) => rd.active && !rd.matured).reduce((sum, rd) => sum + rd.compoundingBase + rd.uncompoundedInterest, 0);
      schedule.push({
        year: currentYearVal,
        openingValue: yearlyOpening,
        deposit: yearlyDeposit,
        interest: yearlyInterest,
        maturityValue: yearlyMaturity,
        endValue: closingBalance
      });
      yearlyOpening = closingBalance;
      yearlyDeposit = 0;
      yearlyInterest = 0;
      yearlyMaturity = 0;
      if (currentAbsolute < latestEndAbsolute) {
        currentYearVal++;
      }
    }
    currentAbsolute++;
    currentMonthVal = currentMonthVal % 12 + 1;
  }
  const totals = {
    globalDeposit,
    globalInterest,
    finalMaturity: rds.filter((rd) => rd.matured).reduce((sum, rd) => sum + rd.compoundingBase, 0)
  };
  return { schedule, totals };
};

// apps/web/src/components/InsuranceModule/InsuranceLogic.js
var calculateYearlyInsuranceSummary = (policies) => {
  const summary = {};
  policies.forEach((policy) => {
    let startDate = new Date(policy.startDate);
    if (isNaN(startDate.getTime())) {
      startDate = new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1);
    }
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const premium = parseFloat(policy.premium) || 0;
    const paymentTerm = parseInt(policy.paymentTerm) || (premium > 0 ? 10 : 0);
    const policyTerm = parseInt(policy.policyTerm) || paymentTerm;
    const freq = policy.frequency || "Annually";
    let intervalMonths = 12;
    let multiplier = 1;
    if (freq === "Monthly") {
      intervalMonths = 1;
      multiplier = 12;
    } else if (freq === "Quarterly") {
      intervalMonths = 3;
      multiplier = 4;
    } else if (freq === "Half-Yearly") {
      intervalMonths = 6;
      multiplier = 2;
    }
    const policyId = policy.id;
    const insuredName = policy.insuredName || "Unspecified";
    const planName = policy.planName || "Plan";
    const totalPayments = paymentTerm * multiplier;
    for (let i = 0; i < totalPayments; i++) {
      const paymentMonthTotal = startMonth + i * intervalMonths;
      const year = startYear + Math.floor(paymentMonthTotal / 12);
      if (!summary[year]) summary[year] = { year, totalPremium: 0, policyPremiums: {}, coverage: {}, maturities: [] };
      summary[year].totalPremium += premium;
      if (!summary[year].policyPremiums[policyId]) summary[year].policyPremiums[policyId] = 0;
      summary[year].policyPremiums[policyId] += premium;
    }
    const sumAssured = parseFloat(policy.sumAssured) || 0;
    for (let i = 0; i < policyTerm; i++) {
      const year = startYear + i;
      if (!summary[year]) summary[year] = { year, totalPremium: 0, policyPremiums: {}, coverage: {}, maturities: [] };
      if (!summary[year].coverage[insuredName]) summary[year].coverage[insuredName] = 0;
      summary[year].coverage[insuredName] += sumAssured;
    }
    const maturityYear = startYear + policyTerm;
    const maturityAmount = parseFloat(policy.maturityAmount) || 0;
    if (maturityAmount > 0) {
      if (!summary[maturityYear]) summary[maturityYear] = { year: maturityYear, totalPremium: 0, policyPremiums: {}, coverage: {}, maturities: [] };
      summary[maturityYear].maturities.push({
        planName: policy.planName,
        amount: maturityAmount,
        insuredName
      });
    }
  });
  return Object.values(summary).sort((a, b) => a.year - b.year);
};

// apps/web/src/components/DetailedReport/moneyFlowLedgerLogic.js
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

// apps/web/src/components/DetailedReport/instrumentAnalysisLogic.js
var parseAmount = (value) => parseFloat(value) || 0;
var PPF_MAX_DURATION_YEARS = 15;
var INSTRUMENT_REGISTRY = {
  SIP: {
    allocType: "SIP",
    goalKey: "sip",
    inputMode: "monthly",
    step: 500,
    defaultRate: 12,
    defaultDuration: 10
  },
  Lumpsum: {
    allocType: "Lumpsum",
    goalKey: "lumpsum",
    inputMode: "lumpsum",
    step: 1e3,
    defaultRate: 12,
    defaultDuration: 10
  },
  "Direct Equity & ETFs": {
    allocType: "Direct Equity & ETFs",
    goalKey: "equity",
    inputMode: "lumpsum",
    step: 1e3,
    defaultRate: 12,
    defaultDuration: 10
  },
  PPF: {
    allocType: "PPF",
    goalKey: null,
    inputMode: "monthly",
    step: 500,
    defaultRate: 7.1,
    defaultDuration: PPF_MAX_DURATION_YEARS,
    maxDurationYears: PPF_MAX_DURATION_YEARS,
    maxMonthly: 12500
  },
  NPS: {
    allocType: "NPS",
    goalKey: null,
    inputMode: "monthly",
    step: 500,
    defaultRate: 10,
    defaultDuration: 10
  },
  "Fixed Deposit": {
    allocType: "Fixed Deposit",
    goalKey: "fd",
    inputMode: "lumpsum",
    step: 1e3,
    defaultRate: 6,
    defaultDuration: 5
  },
  "Liquid Mutual Fund": {
    allocType: "Liquid Mutual Fund",
    goalKey: null,
    inputMode: "lumpsum",
    step: 1e3,
    defaultRate: 5.5,
    defaultDuration: 3
  },
  "Recurring Deposit": {
    allocType: "Recurring Deposit",
    goalKey: "rd",
    inputMode: "monthly",
    step: 500,
    defaultRate: 6,
    defaultDuration: 5
  },
  "Life Insurance": {
    allocType: "Life Insurance",
    goalKey: null,
    inputMode: "monthly",
    step: 500,
    defaultRate: 0,
    defaultDuration: 10,
    isProtection: true
  },
  "Term Insurance": {
    allocType: "Term Insurance",
    goalKey: null,
    inputMode: "monthly",
    step: 500,
    defaultRate: 0,
    defaultDuration: 10,
    isProtection: true
  },
  "Health Insurance": {
    allocType: "Health Insurance",
    goalKey: null,
    inputMode: "monthly",
    step: 500,
    defaultRate: 0,
    defaultDuration: 10,
    isProtection: true
  },
  "Life Insurance Saving Plans": {
    allocType: "Life Insurance Saving Plans",
    goalKey: null,
    inputMode: "monthly",
    step: 500,
    defaultRate: 5,
    defaultDuration: 10
  },
  Gold: {
    allocType: "Gold",
    goalKey: null,
    inputMode: "lumpsum",
    step: 1e3,
    defaultRate: 10,
    defaultDuration: 10
  },
  "Other Investment": {
    allocType: "Other Investment",
    goalKey: null,
    inputMode: "lumpsum",
    step: 1e3,
    defaultRate: 10,
    defaultDuration: 10
  }
};
var STUDIO_INSTRUMENT_TYPES = Object.keys(INSTRUMENT_REGISTRY);
function getRecurringMonthlyAmount(alloc = {}) {
  const amount = parseAmount(alloc.amount);
  const type = alloc.type;
  const freq = String(alloc.frequency || "Monthly").toLowerCase();
  const isInstallmentLife = type === "Life Insurance" && !alloc.studioPlanKey || (type === "Life Insurance Saving Plans" || type === "Term Insurance") && alloc.insuredMember;
  if (isInstallmentLife) {
    if (freq === "quarterly") return amount / 3;
    if (freq === "half-yearly" || freq === "half yearly") return amount / 6;
    if (freq === "annual" || freq === "annually") return amount / 12;
    return amount;
  }
  return amount / 12;
}

// apps/web/src/components/DetailedReport/allocationEngine/objectiveVehicleMap.js
var OBJECTIVE_TYPES = {
  EMERGENCY: "emergency_fund",
  PROTECTION: "protection",
  HEALTH: "health",
  RETIREMENT: "retirement",
  CHILD_EDUCATION: "child_education",
  CHILD_MARRIAGE: "child_marriage",
  HOME: "home",
  BUSINESS: "business",
  OTHER: "other"
};
var WATERFALL_OBJECTIVE_IDS = [
  OBJECTIVE_TYPES.EMERGENCY,
  OBJECTIVE_TYPES.PROTECTION,
  OBJECTIVE_TYPES.HEALTH
];

// apps/web/src/components/DetailedReport/putYourMoneyToWorkLogic.js
var parseAmount2 = (value) => parseFloat(value) || 0;
var RECURRING_ALLOC_TYPES = [
  "SIP",
  "PPF",
  "NPS",
  "Life Insurance",
  "Term Insurance",
  "Health Insurance",
  "Life Insurance Saving Plans",
  "Recurring Deposit",
  "RD"
];
var PROTECTION_ALLOCATION_TYPES = [
  "Term Insurance",
  "Health Insurance",
  "Liquid Mutual Fund"
];
function isProtectionAllocationType(type) {
  if (!type) return false;
  const normalized = type === "RD" ? "Recurring Deposit" : type;
  return PROTECTION_ALLOCATION_TYPES.includes(normalized) || PROTECTION_ALLOCATION_TYPES.includes(type);
}
function allocationMatchesProtectionFilter(alloc, { protectionOnly = false, excludeProtection = false } = {}) {
  const isProtection = isProtectionAllocationType(alloc?.type);
  if (protectionOnly) return isProtection;
  if (excludeProtection) return !isProtection;
  return true;
}
function allocationHasStartedByMonth(alloc = {}, calendarYear, monthIndex) {
  const startYear = parseInt(alloc.startYear, 10);
  const startMonth = parseInt(alloc.startMonth, 10);
  if (!Number.isFinite(startYear) || !Number.isFinite(startMonth)) {
    return true;
  }
  const month = monthIndex + 1;
  if (startYear < calendarYear) return true;
  if (startYear > calendarYear) return false;
  return startMonth <= month;
}
function isRecurringAllocationType(type) {
  return RECURRING_ALLOC_TYPES.includes(type);
}
function computeAllocationImpactForMonth(investmentAllocations = [], calendarYear, monthIndex, filter = {}) {
  const month = monthIndex + 1;
  let impact = 0;
  investmentAllocations.forEach((alloc) => {
    if (!allocationMatchesProtectionFilter(alloc, filter)) return;
    const type = alloc.type === "RD" ? "Recurring Deposit" : alloc.type;
    if (isRecurringAllocationType(type) || isRecurringAllocationType(alloc.type)) {
      if (!allocationHasStartedByMonth(alloc, calendarYear, monthIndex)) return;
      impact += getRecurringMonthlyAmount(alloc);
      return;
    }
    const startYear = parseInt(alloc.startYear, 10);
    const startMonth = parseInt(alloc.startMonth, 10);
    if (!Number.isFinite(startYear) || !Number.isFinite(startMonth)) return;
    if (startYear === calendarYear && startMonth === month) {
      impact += parseAmount2(alloc.amount);
    }
  });
  return Math.round(impact);
}

// apps/web/src/components/DetailedReport/trackSurplusAllocationLogic.js
var parseAmount3 = (value) => parseFloat(value) || 0;
var GROWTH_AVENUE_ORDER = ["sip", "equity", "lumpsum"];
var RETIREMENT_AVENUE_ORDER = ["ppf", "nps"];
var MATURITY_AVENUE_ORDER = ["fd", "rd", "insurance"];
var ENGINE_WITHDRAWAL_AVENUES = ["sip", "equity", "lumpsum"];
var ENGINE_WITHDRAWAL_SET = new Set(ENGINE_WITHDRAWAL_AVENUES);
var FUTURE_SURPLUS_AVENUE_ID = "futureSurplus";
var RESIDUAL_POOL_RATE = 0.1;
var CUSTOMIZABLE_ALLOCATION_AVENUES = [
  FUTURE_SURPLUS_AVENUE_ID,
  ...ENGINE_WITHDRAWAL_AVENUES
];
var SCENARIO_WEALTH = "wealth";
var SCENARIO_BASELINE = "baseline";
var SCENARIO_PLAN = "plan";
var SCENARIO_MAXIMUM = "maximum";
var GOAL_ACCENT_PALETTE = [
  { id: "blue", hex: "#2563eb", soft: "rgba(37, 99, 235, 0.10)", ink: "#1d4ed8" },
  { id: "amber", hex: "#d97706", soft: "rgba(217, 119, 6, 0.10)", ink: "#b45309" },
  { id: "violet", hex: "#7c3aed", soft: "rgba(124, 58, 237, 0.10)", ink: "#6d28d9" },
  { id: "emerald", hex: "#059669", soft: "rgba(5, 150, 105, 0.10)", ink: "#047857" },
  { id: "rose", hex: "#e11d48", soft: "rgba(225, 29, 72, 0.10)", ink: "#be123c" },
  { id: "cyan", hex: "#0891b2", soft: "rgba(8, 145, 178, 0.10)", ink: "#0e7490" },
  { id: "indigo", hex: "#4f46e5", soft: "rgba(79, 70, 229, 0.10)", ink: "#4338ca" },
  { id: "teal", hex: "#0d9488", soft: "rgba(13, 148, 136, 0.10)", ink: "#0f766e" }
];
function sanitizeEngineMappings(goalMappings = {}) {
  const cleaned = {};
  Object.entries(goalMappings || {}).forEach(([goalId, mapping]) => {
    if (!mapping || typeof mapping !== "object") return;
    const next = {};
    ENGINE_WITHDRAWAL_AVENUES.forEach((key) => {
      const amount = Math.round(parseAmount3(mapping[key]));
      if (amount > 0) next[key] = amount;
    });
    if (Object.keys(next).length > 0) cleaned[goalId] = next;
  });
  return cleaned;
}
function sanitizePlanningMappings(goalMappings = {}) {
  const cleaned = {};
  Object.entries(goalMappings || {}).forEach(([goalId, mapping]) => {
    if (!mapping || typeof mapping !== "object") return;
    const next = {};
    ENGINE_WITHDRAWAL_AVENUES.forEach((key) => {
      const amount = Math.round(parseAmount3(mapping[key]));
      if (amount > 0) next[key] = amount;
    });
    if (Object.prototype.hasOwnProperty.call(mapping, FUTURE_SURPLUS_AVENUE_ID)) {
      next[FUTURE_SURPLUS_AVENUE_ID] = Math.max(
        0,
        Math.round(parseAmount3(mapping[FUTURE_SURPLUS_AVENUE_ID]))
      );
    }
    if (Object.keys(next).length > 0) cleaned[goalId] = next;
  });
  return cleaned;
}
function mergeGoalMapping(existingMappings = {}, goalId, avenueAmounts = {}) {
  const next = { ...sanitizePlanningMappings(existingMappings) };
  const cleaned = {};
  ENGINE_WITHDRAWAL_AVENUES.forEach((key) => {
    const amount = Math.round(parseAmount3(avenueAmounts[key]));
    if (amount > 0) cleaned[key] = amount;
  });
  if (Object.prototype.hasOwnProperty.call(avenueAmounts, FUTURE_SURPLUS_AVENUE_ID)) {
    cleaned[FUTURE_SURPLUS_AVENUE_ID] = Math.max(
      0,
      Math.round(parseAmount3(avenueAmounts[FUTURE_SURPLUS_AVENUE_ID]))
    );
  }
  if (Object.keys(cleaned).length === 0) {
    delete next[goalId];
  } else {
    next[goalId] = cleaned;
  }
  return next;
}
function buildApplyPayload(goalId, avenueAmounts = {}) {
  const mapping = {};
  ENGINE_WITHDRAWAL_AVENUES.forEach((key) => {
    const amount = Math.round(parseAmount3(avenueAmounts[key]));
    if (amount > 0) mapping[key] = amount;
  });
  if (Object.prototype.hasOwnProperty.call(avenueAmounts, FUTURE_SURPLUS_AVENUE_ID)) {
    mapping[FUTURE_SURPLUS_AVENUE_ID] = Math.max(
      0,
      Math.round(parseAmount3(avenueAmounts[FUTURE_SURPLUS_AVENUE_ID]))
    );
  }
  return { goalId, mapping };
}
function clampAvenueAmount(amount, availableMax) {
  const value = Math.round(parseAmount3(amount));
  const max = Math.max(0, Math.round(parseAmount3(availableMax)));
  if (value <= 0) return 0;
  return Math.min(value, max);
}
var AVENUE_LABELS = {
  sip: "SIP",
  equity: "Direct Equity & ETFs",
  lumpsum: "Lumpsum Mutual Fund",
  ppf: "PPF",
  nps: "NPS",
  fd: "Fixed Deposit",
  rd: "Recurring Deposit",
  insurance: "Life Insurance (Endowment)",
  [FUTURE_SURPLUS_AVENUE_ID]: "Accumulated surplus not yet invested"
};
function avenueLabel(avenueId) {
  return AVENUE_LABELS[avenueId] || avenueId;
}
function scenarioLabel(scenarioId, targetYear) {
  return `Your Wealth by ${targetYear}`;
}
function scenarioDescription(scenarioId) {
  return "Existing investments, planned surplus investments, and accumulated surplus";
}
function buildResidualBreakdownForGoal({
  goalId,
  targetYear,
  residualDraw = 0,
  totalAvailable = residualDraw,
  contributionsByYear = {},
  timeline = [],
  asOfYear = (/* @__PURE__ */ new Date()).getFullYear(),
  residualRatePct = Math.round(RESIDUAL_POOL_RATE * 100)
} = {}) {
  const yearsUpToGoal = Object.entries(contributionsByYear).filter(([year]) => {
    const y = parseInt(year, 10);
    return Number.isFinite(y) && y >= asOfYear && y <= targetYear;
  });
  const surplusTillGoal = yearsUpToGoal.reduce(
    (sum, [, amount]) => sum + Math.max(0, Math.round(parseAmount3(amount))),
    0
  );
  const relevantTimeline = (timeline || []).filter((row) => row.year <= targetYear);
  const growthTillGoal = relevantTimeline.reduce((sum, row) => sum + (row.growth || 0), 0);
  const maturityTillGoal = relevantTimeline.reduce((sum, row) => sum + (row.maturityAdded || 0), 0);
  let drawnByEarlierGoals = 0;
  let reachedThisGoal = false;
  relevantTimeline.forEach((row) => {
    (row.goalDraws || []).forEach((d) => {
      if (reachedThisGoal) return;
      if (goalId && d.goalId === goalId) {
        reachedThisGoal = true;
        return;
      }
      drawnByEarlierGoals += d.amount || 0;
    });
  });
  const totalPoolAvailable = Math.max(
    Math.round(totalAvailable),
    Math.round(surplusTillGoal + growthTillGoal + maturityTillGoal - drawnByEarlierGoals)
  );
  const surplusRemaining = Math.max(0, totalPoolAvailable - Math.round(residualDraw));
  return {
    targetYear,
    residualDraw: Math.round(residualDraw),
    residualRatePct,
    surplusTillGoal: Math.round(surplusTillGoal),
    surplusTillLabel: `Surplus till ${targetYear}`,
    growthTillGoal: Math.round(growthTillGoal),
    maturityTillGoal: Math.round(maturityTillGoal),
    drawnByEarlierGoals: Math.round(drawnByEarlierGoals),
    totalAvailable: Math.round(totalAvailable),
    totalPoolAvailable,
    surplusRemaining,
    lines: [
      {
        id: "surplus",
        label: `Surplus till ${targetYear}`,
        amount: Math.round(surplusTillGoal)
      },
      {
        id: "growth",
        label: `Growth at ${residualRatePct}%`,
        amount: Math.round(growthTillGoal)
      },
      {
        id: "maturity",
        label: "Unused FD / RD / Insurance maturities",
        amount: Math.round(maturityTillGoal)
      },
      {
        id: "earlier",
        label: "Deducted: Drawn by earlier goals",
        amount: Math.round(drawnByEarlierGoals)
      },
      {
        id: "pool",
        label: "Total Surplus Pool Available",
        amount: totalPoolAvailable
      },
      {
        id: "drawn",
        label: "Allocated to this goal",
        amount: Math.round(residualDraw)
      },
      {
        id: "remaining",
        label: "Surplus Remaining After Goal",
        amount: surplusRemaining
      }
    ].filter((line) => line.amount > 0 || line.id === "drawn" || line.id === "pool" || line.id === "remaining" || line.id === "total")
  };
}
function isRetirementGoal(goal = {}) {
  const id = String(goal.id || "").toLowerCase();
  const name = String(goal.name || goal.placeholder || "").toLowerCase();
  const templateId = String(goal.templateId || "").toLowerCase();
  return id === "retirement" || id.startsWith("retirement") || templateId === "retirement" || name.includes("retirement");
}
function pickGoalAccent(goal = {}, index = 0) {
  if (isRetirementGoal(goal)) {
    return GOAL_ACCENT_PALETTE.find((p) => p.id === "emerald") || GOAL_ACCENT_PALETTE[3];
  }
  const name = String(goal.name || goal.placeholder || "").toLowerCase();
  if (name.includes("car") || name.includes("bike") || name.includes("vehicle")) {
    return GOAL_ACCENT_PALETTE[0];
  }
  if (name.includes("educat") || name.includes("school") || name.includes("college")) {
    return GOAL_ACCENT_PALETTE[1];
  }
  if (name.includes("house") || name.includes("home") || name.includes("flat") || name.includes("property")) {
    return GOAL_ACCENT_PALETTE[2];
  }
  if (name.includes("marri") || name.includes("wedding")) {
    return GOAL_ACCENT_PALETTE[4];
  }
  if (name.includes("tour") || name.includes("travel") || name.includes("holiday") || name.includes("vacation")) {
    return GOAL_ACCENT_PALETTE[5];
  }
  return GOAL_ACCENT_PALETTE[index % GOAL_ACCENT_PALETTE.length];
}
function getGoalFutureValue(goal = {}) {
  if (goal.futureValue != null && goal.futureValue !== "") {
    return Math.round(parseAmount3(goal.futureValue));
  }
  const pv = parseAmount3(goal.presentValue);
  const years = parseAmount3(goal.yearsToGoal);
  const rawInflation = goal.inflationRate;
  const inflation = rawInflation === void 0 || rawInflation === null || rawInflation === "" ? 6 : parseAmount3(rawInflation);
  return Math.round(pv * Math.pow(1 + inflation / 100, years));
}
function getGoalTargetYear(goal = {}, asOfYear = (/* @__PURE__ */ new Date()).getFullYear()) {
  return asOfYear + Math.round(parseAmount3(goal.yearsToGoal));
}
function monthKeyForAllocation(item = {}) {
  if (item.studioPlanKey) return item.studioPlanKey;
  const startYear = parseInt(item.startYear, 10);
  const startMonth = parseInt(item.startMonth, 10);
  if (Number.isFinite(startYear) && Number.isFinite(startMonth) && startMonth >= 1 && startMonth <= 12) {
    return `${startYear}-${startMonth - 1}`;
  }
  return null;
}
function parseMonthKey(planKey) {
  if (!planKey || typeof planKey !== "string") return null;
  const [yearStr, monthStr] = planKey.split("-");
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return null;
  return { year, monthIndex };
}
function labelForPlanKey(planKey) {
  const parsed = parseMonthKey(planKey);
  if (!planKey || typeof planKey !== "string") return "This month";
  if (!parsed) return planKey;
  const monthLabel = MONTH_LABELS_LONG[parsed.monthIndex] || "Month";
  return `${monthLabel} ${parsed.year}`;
}
function derivePlannedMonths(investmentAllocations = []) {
  const seen = /* @__PURE__ */ new Set();
  const months = [];
  (investmentAllocations || []).forEach((item) => {
    const key = monthKeyForAllocation(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    months.push({
      key,
      label: labelForPlanKey(key),
      monthLabel: labelForPlanKey(key).replace(/\s+\d{4}$/, "")
    });
  });
  months.sort((a, b) => {
    const [ay, am] = a.key.split("-").map(Number);
    const [by, bm] = b.key.split("-").map(Number);
    return ay - by || am - bm;
  });
  return months;
}
function buildPlannedMonthsNotice(plannedMonths = []) {
  if (!plannedMonths.length) {
    return "Complete Put Your Money to Work to include surplus allocations in this report.";
  }
  const labels = plannedMonths.map((m) => m.monthLabel || m.label);
  if (labels.length === 1) {
    return `Outcomes of this report include your planning for the month of ${labels[0]}.`;
  }
  if (labels.length === 2) {
    return `Outcomes of this report include your planning for the months of ${labels[0]} and ${labels[1]}.`;
  }
  const head = labels.slice(0, -1).join(", ");
  const tail = labels[labels.length - 1];
  return `Outcomes of this report include your planning for the months of ${head}, and ${tail}.`;
}
function valueAtYear(schedule = [], year, valueField = "valueAfterWithdrawal") {
  if (!schedule.length) return 0;
  const exact = schedule.find((row) => row.year === year);
  if (exact) return Math.round(parseAmount3(exact[valueField]));
  const prior = [...schedule].filter((row) => row.year <= year).sort((a, b) => b.year - a.year)[0];
  if (prior) return Math.round(parseAmount3(prior[valueField]));
  return 0;
}
function maturityAtYear(schedule = [], year) {
  if (!schedule.length) return 0;
  const exact = schedule.find((row) => row.year === year);
  if (!exact) return 0;
  return Math.round(parseAmount3(exact.maturityValue));
}
function filterStudioAllocations(investmentAllocations = [], types = []) {
  const typeSet = new Set(types);
  return (investmentAllocations || []).filter((a) => typeSet.has(a.type) && a.studioPlanKey);
}
function normalizeBaselineRdStreams(expenseCategories = {}, asOfYear, asOfMonth) {
  const raw = expenseCategories?.savings?.rd;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((item, idx) => {
    const amount = parseAmount3(item?.amount !== void 0 ? item.amount : item);
    if (amount <= 0) return null;
    return {
      id: `baseline-rd-${idx}`,
      name: item?.name || "Existing RD",
      startYear: parseInt(item?.startYear, 10) || asOfYear,
      startMonth: parseInt(item?.startMonth, 10) || asOfMonth,
      duration: parseInt(item?.duration, 10) || 5,
      amount,
      isBaseline: true
    };
  }).filter(Boolean);
}
function buildInsuranceMaturitiesByYear(policies = []) {
  const summary = calculateYearlyInsuranceSummary(policies || []);
  const byYear = {};
  summary.forEach((row) => {
    const total = (row.maturities || []).reduce((sum, m) => sum + parseAmount3(m.amount), 0);
    if (total > 0) byYear[row.year] = Math.round(total);
  });
  return byYear;
}
function computeAsOfCorpus({ assetCategories = {}, calculatorInputs = {} } = {}) {
  const mfCorpus = parseAmount3(assetCategories?.investments?.mutualFunds) || parseAmount3(assetCategories?.equity?.mfEquity) || parseAmount3(assetCategories?.equity?.stocks) || 0;
  const equityCorpus = parseAmount3(assetCategories?.investments?.equity) || parseAmount3(assetCategories?.equity?.stocks) || 0;
  const corpus = {
    sip: Math.round(mfCorpus),
    equity: Math.round(equityCorpus),
    lumpsum: Math.round(parseAmount3(calculatorInputs?.lumpsum?.amount)),
    ppf: Math.round(parseAmount3(assetCategories?.retirement?.ppf)),
    nps: Math.round(parseAmount3(assetCategories?.retirement?.nps)),
    total: 0
  };
  corpus.total = corpus.sip + corpus.equity + corpus.lumpsum + corpus.ppf + corpus.nps;
  return corpus;
}
function buildAvenueSchedules({
  expenseCategories = {},
  assetCategories = {},
  calculatorInputs = {},
  investmentAllocations = [],
  familyMembers = [],
  policies = [],
  asOfYear = (/* @__PURE__ */ new Date()).getFullYear(),
  asOfMonth = (/* @__PURE__ */ new Date()).getMonth() + 1,
  tenureYears = 50,
  includeProposedAllocations = true,
  goalMappings = {},
  goals = []
} = {}) {
  const sipRate = parseAmount3(calculatorInputs.sip?.rate) || 12;
  const sipEvents = calculatorInputs.sip?.events || calculatorInputs.sip?.increments || [];
  const monthlySip = parseAmount3(
    expenseCategories?.savings?.sip?.amount !== void 0 ? expenseCategories.savings.sip.amount : expenseCategories?.savings?.sip
  );
  const mfCorpus = parseAmount3(assetCategories?.investments?.mutualFunds) || parseAmount3(assetCategories?.equity?.mfEquity) || parseAmount3(assetCategories?.equity?.stocks) || 0;
  const equityRate = parseAmount3(calculatorInputs.equity?.rate) || 15;
  const equityEvents = calculatorInputs.equity?.events || [];
  const equityCorpus = parseAmount3(assetCategories?.investments?.equity) || parseAmount3(assetCategories?.equity?.stocks) || 0;
  const lumpsumCfg = calculatorInputs.lumpsum || {};
  const lumpsumBase = parseAmount3(lumpsumCfg.amount);
  const lumpsumRate = parseAmount3(lumpsumCfg.rate) || 12;
  const lumpsumEvents = lumpsumCfg.events || [];
  const ppfRate = parseAmount3(calculatorInputs.ppf?.rate) || 7.1;
  const npsCfg = calculatorInputs.nps || {};
  const npsRate = parseAmount3(npsCfg.rate) || 10;
  const npsCorpus = parseAmount3(assetCategories?.retirement?.nps);
  const selfMember = (familyMembers || []).find((m) => m.relation?.toLowerCase() === "self");
  const fdCfg = calculatorInputs.fd || {};
  const fdRate = parseAmount3(fdCfg.rate) || 7;
  const fdFrequency = fdCfg.frequency || "Quarterly";
  const rawFD = assetCategories?.investments?.fixedDeposit;
  const baselineFDs = Array.isArray(rawFD) ? rawFD : rawFD ? [rawFD] : [];
  const rdRate = parseAmount3(calculatorInputs.rd?.rate) || 7;
  const baselineRDs = normalizeBaselineRdStreams(expenseCategories, asOfYear, asOfMonth);
  const studio = (types) => includeProposedAllocations ? filterStudioAllocations(investmentAllocations, types) : [];
  const proposedSip = studio(["SIP"]);
  const proposedEquity = studio(["Direct Equity & ETFs"]);
  const proposedLumpsum = studio(["Lumpsum", "Lump Sum"]);
  const proposedPpf = studio(["PPF"]);
  const proposedNps = studio(["NPS"]);
  const proposedFd = studio(["Fixed Deposit"]);
  const proposedRd = studio(["Recurring Deposit", "RD"]).map((a) => ({
    id: a.id,
    name: a.name,
    startYear: parseInt(a.startYear, 10) || asOfYear,
    startMonth: parseInt(a.startMonth, 10) || asOfMonth,
    duration: parseInt(a.duration, 10) || 5,
    amount: parseAmount3(a.amount),
    isBaseline: false
  }));
  const sipSchedule = computeSIPData(
    asOfYear,
    monthlySip,
    sipRate,
    tenureYears,
    mfCorpus,
    sipEvents,
    proposedSip,
    goalMappings,
    goals
  );
  const equitySchedule = computeEquityData(
    equityCorpus,
    equityRate,
    tenureYears,
    asOfMonth,
    asOfYear,
    equityEvents,
    proposedEquity,
    goalMappings,
    goals
  );
  const lumpsumSchedule = computeLumpsumData(
    lumpsumBase,
    lumpsumRate,
    tenureYears,
    asOfMonth,
    asOfYear,
    lumpsumEvents,
    proposedLumpsum,
    goalMappings,
    goals
  );
  const ppfSchedule = computePPFData(proposedPpf, ppfRate, expenseCategories?.savings?.ppf || {}).results || [];
  const npsSchedule = computeNPSData(
    proposedNps,
    npsRate,
    parseAmount3(npsCfg.annuity) || 40,
    parseAmount3(npsCfg.annuityRate) || 6,
    selfMember,
    expenseCategories?.savings?.nps || {},
    npsCorpus
  ).schedule || [];
  const fdSchedule = computeFDData(proposedFd, fdRate, fdFrequency, baselineFDs).schedule || [];
  const rdSchedule = computeRDData([...baselineRDs, ...proposedRd], rdRate).schedule || [];
  return {
    growth: {
      sip: { schedule: sipSchedule, field: "valueAfterWithdrawal" },
      equity: { schedule: equitySchedule, field: "valueAfterWithdrawal" },
      lumpsum: { schedule: lumpsumSchedule, field: "valueAfterWithdrawal" },
      ppf: { schedule: ppfSchedule, field: "endValue" },
      nps: { schedule: npsSchedule, field: "endValue" }
    },
    maturity: {
      fd: { schedule: fdSchedule },
      rd: { schedule: rdSchedule },
      insurance: { byYear: buildInsuranceMaturitiesByYear(policies) }
    }
  };
}
function sortGoalsNearestFirst(goals = [], asOfYear = (/* @__PURE__ */ new Date()).getFullYear()) {
  return [...goals].filter((g) => getGoalFutureValue(g) > 0).sort((a, b) => getGoalTargetYear(a, asOfYear) - getGoalTargetYear(b, asOfYear));
}
function collectMaturityTotals(schedules, years) {
  const totals = {};
  years.forEach((year) => {
    totals[year] = {
      fd: maturityAtYear(schedules.maturity.fd.schedule, year),
      rd: maturityAtYear(schedules.maturity.rd.schedule, year),
      insurance: Math.round(parseAmount3(schedules.maturity.insurance.byYear[year]))
    };
  });
  return totals;
}
function runFundingPass({
  goals = [],
  scheduleInputs = {},
  includeProposedAllocations = true,
  asOfYear = (/* @__PURE__ */ new Date()).getFullYear(),
  horizonYear = asOfYear,
  seededGoalMappings = {},
  overridesByGoalId = {},
  preAllocatedByGoalId = {}
} = {}) {
  const sorted = sortGoalsNearestFirst(goals, asOfYear);
  const seed = sanitizeEngineMappings(seededGoalMappings);
  const goalMappings = {};
  const byGoalId = {};
  const buildSchedules = (mappings) => buildAvenueSchedules({
    ...scheduleInputs,
    asOfYear,
    includeProposedAllocations,
    goalMappings: mappings,
    goals: sorted
  });
  const years = [];
  for (let year = asOfYear; year <= horizonYear; year += 1) years.push(year);
  const maturityTotals = collectMaturityTotals(buildSchedules({}), years);
  const maturityRemaining = {};
  years.forEach((year) => {
    maturityRemaining[year] = { ...maturityTotals[year] };
  });
  const nominalConsumed = { ppf: 0, nps: 0 };
  sorted.forEach((goal) => {
    const targetYear = getGoalTargetYear(goal, asOfYear);
    const goalAmount = getGoalFutureValue(goal);
    const preAllocated = clampAvenueAmount(preAllocatedByGoalId[goal.id], goalAmount);
    const retirement = isRetirementGoal(goal);
    const draws = [];
    let remainingNeed = Math.max(0, goalAmount - preAllocated);
    const schedulesBefore = buildSchedules(goalMappings);
    const override = overridesByGoalId[goal.id];
    const hasOverride = override && typeof override === "object";
    const seededForGoal = seed[goal.id] || null;
    const growthKeys = [
      ...GROWTH_AVENUE_ORDER,
      ...retirement ? RETIREMENT_AVENUE_ORDER : []
    ];
    const engineTakes = {};
    growthKeys.forEach((key) => {
      const pack = schedulesBefore.growth[key];
      if (!pack) return;
      const projected = valueAtYear(pack.schedule, targetYear, pack.field);
      const available = Math.max(0, projected - (nominalConsumed[key] || 0));
      let take = 0;
      if (ENGINE_WITHDRAWAL_SET.has(key)) {
        if (hasOverride) {
          take = Math.min(
            remainingNeed,
            clampAvenueAmount(override[key], available)
          );
        } else if (seededForGoal) {
          take = Math.min(
            remainingNeed,
            clampAvenueAmount(seededForGoal[key], available)
          );
        } else {
          take = Math.min(Math.max(0, remainingNeed), available);
        }
        engineTakes[key] = Math.round(take);
      } else {
        take = Math.min(Math.max(0, remainingNeed), available);
      }
      if (take <= 0) return;
      remainingNeed -= take;
      draws.push({
        id: key,
        label: avenueLabel(key),
        kind: "growth",
        amount: Math.round(take),
        availableAtGoalYear: Math.round(available),
        availableBefore: Math.round(available),
        allocated: Math.round(take),
        remainingAfter: Math.round(Math.max(0, available - take)),
        editable: ENGINE_WITHDRAWAL_SET.has(key)
      });
      if (!ENGINE_WITHDRAWAL_SET.has(key)) {
        nominalConsumed[key] = (nominalConsumed[key] || 0) + take;
      }
    });
    if (ENGINE_WITHDRAWAL_AVENUES.some((key) => (engineTakes[key] || 0) > 0) || hasOverride || seededForGoal) {
      const mapping = {};
      ENGINE_WITHDRAWAL_AVENUES.forEach((key) => {
        const amount = Math.round(engineTakes[key] || 0);
        if (amount > 0) mapping[key] = amount;
      });
      if (Object.keys(mapping).length > 0) {
        goalMappings[goal.id] = mapping;
      } else {
        delete goalMappings[goal.id];
      }
    }
    const availableMaturity = maturityRemaining[targetYear] || { fd: 0, rd: 0, insurance: 0 };
    MATURITY_AVENUE_ORDER.forEach((key) => {
      const pool = Math.max(0, availableMaturity[key] || 0);
      const take = Math.min(Math.max(0, remainingNeed), pool);
      if (take <= 0) return;
      availableMaturity[key] = pool - take;
      remainingNeed -= take;
      draws.push({
        id: key,
        label: avenueLabel(key),
        kind: "maturity",
        amount: Math.round(take),
        availableAtGoalYear: Math.round(pool),
        availableBefore: Math.round(pool),
        allocated: Math.round(take),
        remainingAfter: Math.round(Math.max(0, pool - take)),
        editable: false
      });
    });
    const funded = draws.reduce((sum, d) => sum + d.amount, 0);
    const editableAvenues = ENGINE_WITHDRAWAL_AVENUES.map((key) => {
      const existing = draws.find((d) => d.id === key);
      const pack = schedulesBefore.growth[key];
      const projected = pack ? valueAtYear(pack.schedule, targetYear, pack.field) : 0;
      const availableBefore = existing ? existing.availableBefore : Math.max(0, projected);
      const recommended = existing ? existing.amount : 0;
      const applied = Math.round(parseAmount3((seed[goal.id] || {})[key]));
      return {
        id: key,
        label: avenueLabel(key),
        availableMax: Math.round(availableBefore),
        recommended,
        applied,
        amount: hasOverride ? clampAvenueAmount(override[key], availableBefore) : recommended
      };
    }).filter((row) => row.availableMax > 0 || row.recommended > 0 || row.applied > 0);
    byGoalId[goal.id] = {
      goalId: goal.id,
      targetYear,
      goalAmount,
      preAllocated,
      draws,
      funded: Math.round(funded),
      gap: Math.max(0, Math.round(goalAmount - preAllocated - funded)),
      editableAvenues,
      isApplied: Boolean(seed[goal.id]),
      calculationAudit: draws.map((d) => ({
        id: d.id,
        label: d.label,
        kind: d.kind,
        availableBefore: d.availableBefore,
        allocated: d.allocated,
        remainingAfter: d.remainingAfter
      }))
    };
  });
  const maturityLeftoverByYear = {};
  years.forEach((year) => {
    const remaining = maturityRemaining[year] || {};
    const leftover = MATURITY_AVENUE_ORDER.reduce(
      (sum, key) => sum + Math.max(0, remaining[key] || 0),
      0
    );
    if (leftover > 0) maturityLeftoverByYear[year] = Math.round(leftover);
  });
  return {
    byGoalId,
    goalMappings,
    maturityTotalsByYear: maturityTotals,
    maturityLeftoverByYear,
    schedules: buildSchedules(goalMappings)
  };
}
function buildResidualContributions({
  journeyProjections = [],
  monthlyUnallocatedSurplus = [],
  investmentAllocations = [],
  plannedMonths = [],
  asOfYear = (/* @__PURE__ */ new Date()).getFullYear(),
  asOfMonthIndex = (/* @__PURE__ */ new Date()).getMonth(),
  planStartMonthIndex = 0,
  horizonYear = asOfYear
} = {}) {
  const byYear = {};
  const plannedMonthIndexes = (plannedMonths || []).map((m) => parseMonthKey(m.key)).filter((parsed) => parsed && parsed.year === asOfYear).map((parsed) => parsed.monthIndex);
  const lastPlannedMonthIndex = plannedMonthIndexes.length ? Math.max(...plannedMonthIndexes) : asOfMonthIndex - 1;
  const tailStartMonthIndex = Math.max(
    0,
    lastPlannedMonthIndex + 1,
    asOfMonthIndex,
    planStartMonthIndex
  );
  const tailMonths = [];
  let currentYearTail = 0;
  for (let month = tailStartMonthIndex; month <= 11; month += 1) {
    const ledger = parseAmount3(monthlyUnallocatedSurplus[month]);
    const committed = computeAllocationImpactForMonth(investmentAllocations, asOfYear, month);
    const remaining = Math.round(Math.max(0, ledger - committed));
    if (remaining <= 0) continue;
    currentYearTail += remaining;
    tailMonths.push({ monthIndex: month, label: MONTH_LABELS_LONG[month], amount: remaining });
  }
  if (currentYearTail > 0) byYear[asOfYear] = currentYearTail;
  const futureYears = [];
  (journeyProjections || []).forEach((row) => {
    const year = parseInt(row?.year, 10);
    if (!Number.isFinite(year) || year <= asOfYear || year > horizonYear) return;
    const amount = Math.round(Math.max(0, parseAmount3(row.unallocatedSurplus)));
    if (amount <= 0) return;
    byYear[year] = Math.round((byYear[year] || 0) + amount);
    futureYears.push({ year, amount });
  });
  return {
    byYear,
    currentYearTail: Math.round(currentYearTail),
    tailMonths,
    tailStartMonthIndex,
    futureYears
  };
}
function simulateResidualPool({
  contributionsByYear = {},
  maturityLeftoverByYear = {},
  goalQueue = [],
  asOfYear = (/* @__PURE__ */ new Date()).getFullYear(),
  horizonYear = asOfYear,
  rate = RESIDUAL_POOL_RATE,
  overridesByGoalId = {}
} = {}) {
  const drawByGoalId = {};
  const availableBeforeByGoalId = {};
  const timeline = [];
  let balance = 0;
  for (let year = asOfYear; year <= horizonYear; year += 1) {
    const opening = balance;
    const growth = opening * rate;
    balance = opening + growth;
    const surplusAdded = Math.max(0, Math.round(parseAmount3(contributionsByYear[year])));
    balance += surplusAdded;
    const maturityAdded = Math.max(0, Math.round(parseAmount3(maturityLeftoverByYear[year])));
    balance += maturityAdded;
    const goalDraws = [];
    goalQueue.filter((entry) => entry.targetYear === year).forEach((entry) => {
      const need = Math.max(0, parseAmount3(entry.gap));
      const availableBefore = Math.round(Math.min(need, Math.max(0, balance)));
      availableBeforeByGoalId[entry.goalId] = availableBefore;
      const override = overridesByGoalId[entry.goalId];
      const hasOverride = override !== void 0 && override !== null;
      const draw = hasOverride ? clampAvenueAmount(override, availableBefore) : availableBefore;
      if (draw <= 0) return;
      balance -= draw;
      drawByGoalId[entry.goalId] = Math.round((drawByGoalId[entry.goalId] || 0) + draw);
      goalDraws.push({ goalId: entry.goalId, name: entry.name, amount: draw });
    });
    timeline.push({
      year,
      opening: Math.round(opening),
      growth: Math.round(growth),
      surplusAdded,
      maturityAdded,
      goalDraws,
      closing: Math.round(balance)
    });
  }
  return {
    drawByGoalId,
    availableBeforeByGoalId,
    timeline,
    closingBalance: Math.round(balance)
  };
}
function buildScenario(scenarioId, targetYear, goalAmount, draws, extraMeta = {}) {
  const composition = draws.filter((item) => item.amount > 0).map((item) => ({ ...item, amount: Math.round(item.amount) }));
  const projectedWealth = composition.reduce((sum, item) => sum + item.amount, 0);
  const totalPoolAvailable = extraMeta.totalPoolAvailable ?? Math.max(projectedWealth, extraMeta.residualAvailable || 0);
  const surplusRemaining = extraMeta.surplusRemaining ?? Math.max(0, totalPoolAvailable - projectedWealth);
  return {
    id: scenarioId,
    label: scenarioLabel(scenarioId, targetYear),
    description: scenarioDescription(scenarioId),
    goalAmount,
    projectedWealth,
    totalPoolAvailable,
    surplusRemaining,
    remainingGap: Math.max(0, Math.round(goalAmount - projectedWealth)),
    fundedPct: goalAmount > 0 ? Math.min(100, Math.round(projectedWealth / goalAmount * 100)) : 0,
    composition
  };
}
function buildTrackSurplusAllocationReport({
  goals = [],
  expenseCategories = {},
  assetCategories = {},
  calculatorInputs = {},
  investmentAllocations = [],
  familyMembers = [],
  policies = [],
  journeyProjections = [],
  monthlyUnallocatedSurplus = [],
  planStartMonth = 0,
  asOfDate = /* @__PURE__ */ new Date(),
  goalMappings: persistedGoalMappings = {},
  overridesByGoalId = {},
  customizedGoalIds = null
} = {}) {
  const asOfYear = asOfDate.getFullYear();
  const asOfMonth = asOfDate.getMonth() + 1;
  const asOfMonthIndex = asOfDate.getMonth();
  const asOfMonthLabel = MONTH_LABELS_LONG[asOfMonthIndex] || "This month";
  const persistedPlanningMappings = sanitizePlanningMappings(persistedGoalMappings);
  const customizedSet = Array.isArray(customizedGoalIds) ? new Set(customizedGoalIds) : null;
  const customizedMappings = customizedSet ? Object.fromEntries(
    Object.entries(persistedPlanningMappings).filter(([goalId]) => customizedSet.has(goalId))
  ) : persistedPlanningMappings;
  const seededGoalMappings = sanitizeEngineMappings(customizedMappings);
  const plannedMonths = derivePlannedMonths(investmentAllocations);
  const plannedMonthsNotice = buildPlannedMonthsNotice(plannedMonths);
  const hasPymtwPlans = plannedMonths.length > 0;
  const activeGoals = sortGoalsNearestFirst(goals, asOfYear);
  const farthestYears = activeGoals.reduce((max, g) => Math.max(max, getGoalTargetYear(g, asOfYear) - asOfYear), 10);
  const tenureYears = Math.max(15, farthestYears + 2);
  const horizonYear = asOfYear + farthestYears;
  const scheduleInputs = {
    expenseCategories,
    assetCategories,
    calculatorInputs,
    investmentAllocations,
    familyMembers,
    policies,
    asOfMonth,
    tenureYears
  };
  const maturityDiscoveryPass = runFundingPass({
    goals: activeGoals,
    scheduleInputs,
    includeProposedAllocations: true,
    asOfYear,
    horizonYear,
    seededGoalMappings,
    overridesByGoalId
  });
  const residualContributions = buildResidualContributions({
    journeyProjections,
    monthlyUnallocatedSurplus,
    investmentAllocations,
    plannedMonths,
    asOfYear,
    asOfMonthIndex,
    planStartMonthIndex: planStartMonth,
    horizonYear
  });
  const goalQueue = activeGoals.map((goal) => {
    return {
      goalId: goal.id,
      name: goal.name || goal.placeholder || "Goal",
      targetYear: getGoalTargetYear(goal, asOfYear),
      // Accumulated surplus is the first funding source, so it sees full goal need.
      gap: getGoalFutureValue(goal)
    };
  });
  const recommendedResidual = simulateResidualPool({
    contributionsByYear: residualContributions.byYear,
    maturityLeftoverByYear: maturityDiscoveryPass.maturityLeftoverByYear,
    goalQueue,
    asOfYear,
    horizonYear
  });
  const residualOverridesByGoalId = {};
  activeGoals.forEach((goal) => {
    const draft = overridesByGoalId[goal.id];
    if (draft && Object.prototype.hasOwnProperty.call(draft, FUTURE_SURPLUS_AVENUE_ID)) {
      residualOverridesByGoalId[goal.id] = draft[FUTURE_SURPLUS_AVENUE_ID];
      return;
    }
    const saved = customizedMappings[goal.id];
    if (saved && Object.prototype.hasOwnProperty.call(saved, FUTURE_SURPLUS_AVENUE_ID)) {
      residualOverridesByGoalId[goal.id] = saved[FUTURE_SURPLUS_AVENUE_ID];
    }
  });
  const residual = simulateResidualPool({
    contributionsByYear: residualContributions.byYear,
    maturityLeftoverByYear: maturityDiscoveryPass.maturityLeftoverByYear,
    goalQueue,
    asOfYear,
    horizonYear,
    overridesByGoalId: residualOverridesByGoalId
  });
  const planPass = runFundingPass({
    goals: activeGoals,
    scheduleInputs,
    includeProposedAllocations: true,
    asOfYear,
    horizonYear,
    seededGoalMappings,
    overridesByGoalId,
    preAllocatedByGoalId: residual.drawByGoalId
  });
  const residualRatePct = Math.round(RESIDUAL_POOL_RATE * 100);
  const goalCards = activeGoals.map((goal, index) => {
    const targetYear = getGoalTargetYear(goal, asOfYear);
    const goalAmount = getGoalFutureValue(goal);
    const planResult = planPass.byGoalId[goal.id] || {};
    const planDraws = planResult.draws || [];
    const residualDraw = residual.drawByGoalId[goal.id] || 0;
    const residualAvailable = residual.availableBeforeByGoalId[goal.id] || 0;
    const recommendedResidualDraw = recommendedResidual.drawByGoalId[goal.id] || 0;
    const savedResidual = customizedMappings[goal.id]?.[FUTURE_SURPLUS_AVENUE_ID];
    const wealthDraws = residualDraw > 0 ? [{
      id: FUTURE_SURPLUS_AVENUE_ID,
      label: avenueLabel(FUTURE_SURPLUS_AVENUE_ID),
      kind: "futureSurplus",
      amount: residualDraw,
      availableBefore: residualAvailable,
      allocated: residualDraw,
      remainingAfter: Math.max(0, residualAvailable - residualDraw),
      editable: true
    }, ...planDraws] : planDraws;
    const maturityAtGoalYear = planDraws.filter((d) => d.kind === "maturity" && (d.id === "fd" || d.id === "rd") && d.amount > 0).map((d) => ({
      id: d.id,
      label: d.label,
      amount: d.amount
    }));
    const residualBreakdown = buildResidualBreakdownForGoal({
      goalId: goal.id,
      targetYear,
      residualDraw,
      totalAvailable: residualAvailable,
      contributionsByYear: residualContributions.byYear,
      timeline: residual.timeline,
      asOfYear,
      residualRatePct
    });
    const wealthScenario = buildScenario(
      SCENARIO_WEALTH,
      targetYear,
      goalAmount,
      wealthDraws,
      {
        totalPoolAvailable: residualBreakdown.totalPoolAvailable,
        surplusRemaining: residualBreakdown.surplusRemaining,
        residualAvailable
      }
    );
    return {
      goalId: goal.id,
      name: goal.name || goal.placeholder || "Goal",
      targetYear,
      goalAmount,
      isRetirement: isRetirementGoal(goal),
      accent: pickGoalAccent(goal, index),
      scenario: wealthScenario,
      scenarios: { [SCENARIO_WEALTH]: wealthScenario },
      scenarioOrder: [SCENARIO_WEALTH],
      futureSurplusUsed: residualDraw,
      residualBreakdown,
      maturityAtGoalYear,
      editableAvenues: [
        {
          id: FUTURE_SURPLUS_AVENUE_ID,
          label: avenueLabel(FUTURE_SURPLUS_AVENUE_ID),
          availableMax: residualAvailable,
          recommended: recommendedResidualDraw,
          applied: savedResidual === void 0 ? 0 : savedResidual,
          amount: residualDraw
        },
        ...planResult.editableAvenues || []
      ].filter((row) => row.availableMax > 0 || row.recommended > 0 || row.applied > 0 || row.id !== FUTURE_SURPLUS_AVENUE_ID),
      calculationAudit: [
        ...residualDraw > 0 ? [{
          id: FUTURE_SURPLUS_AVENUE_ID,
          label: avenueLabel(FUTURE_SURPLUS_AVENUE_ID),
          kind: "futureSurplus",
          availableBefore: residualAvailable,
          allocated: residualDraw,
          remainingAfter: Math.max(0, residualAvailable - residualDraw)
        }] : [],
        ...planResult.calculationAudit || []
      ],
      isApplied: Boolean(customizedMappings[goal.id]),
      recommendedMapping: sanitizePlanningMappings({
        [goal.id]: {
          [FUTURE_SURPLUS_AVENUE_ID]: recommendedResidualDraw,
          ...Object.fromEntries(
            (planResult.editableAvenues || []).map((row) => [row.id, row.recommended])
          )
        }
      })[goal.id] || {},
      appliedMapping: customizedMappings[goal.id] || {}
    };
  });
  const rawTotals = goalCards.reduce((acc, card) => {
    acc.goalAmount += card.goalAmount;
    acc.projectedWealth += card.scenario.projectedWealth;
    acc.remainingGap += card.scenario.remainingGap;
    if (card.scenario.remainingGap <= 0) {
      acc.fullyFundedCount += 1;
    } else if (card.scenario.projectedWealth > 0) {
      acc.partiallyFundedCount += 1;
    } else {
      acc.shortfallCount += 1;
    }
    return acc;
  }, {
    goalAmount: 0,
    projectedWealth: 0,
    remainingGap: 0,
    fullyFundedCount: 0,
    partiallyFundedCount: 0,
    shortfallCount: 0
  });
  const totalGoalLiability = rawTotals.goalAmount;
  const totalProjectedWealth = rawTotals.projectedWealth;
  const totalRemainingGap = rawTotals.remainingGap;
  const totalGoalCount = goalCards.length;
  const solvencyRatio = totalGoalLiability > 0 ? Math.min(100, Math.round(totalProjectedWealth / totalGoalLiability * 100)) : 100;
  let solvencyStatus = {
    label: "Fully On Track",
    tone: "success",
    color: "#059669",
    soft: "rgba(5, 150, 105, 0.12)",
    description: "Your projected wealth fully covers all your life goals."
  };
  if (totalGoalCount > 0) {
    if (solvencyRatio < 70) {
      solvencyStatus = {
        label: "Critical Shortfall",
        tone: "danger",
        color: "#dc2626",
        soft: "rgba(220, 38, 38, 0.12)",
        description: "Significant gaps detected. Increase surplus allocations to cover goals."
      };
    } else if (solvencyRatio < 100) {
      solvencyStatus = {
        label: "Requires Adjustment",
        tone: "warning",
        color: "#d97706",
        soft: "rgba(217, 119, 6, 0.12)",
        description: "Most goals are covered, but a shortfall remains for later goals."
      };
    }
  }
  const totals = {
    ...rawTotals,
    totalGoalLiability,
    totalProjectedWealth,
    totalRemainingGap,
    totalGoalCount,
    solvencyRatio,
    solvencyStatus
  };
  const farthestGoalYear = activeGoals.reduce(
    (max, g) => Math.max(max, getGoalTargetYear(g, asOfYear)),
    asOfYear
  );
  return {
    meta: {
      asOfYear,
      asOfMonth,
      asOfMonthIndex,
      asOfMonthLabel,
      asOfLabel: `${asOfMonthLabel} ${asOfYear}`,
      horizonYear,
      farthestGoalYear,
      hasPymtwPlans,
      hasGoals: goalCards.length > 0,
      plannedMonthsNotice,
      residualRatePct
    },
    plannedMonths,
    asOfCorpus: computeAsOfCorpus({ assetCategories, calculatorInputs }),
    totals,
    goalCards,
    futureSurplus: {
      contributions: residualContributions,
      timeline: residual.timeline,
      unusedAtHorizon: residual.closingBalance,
      totalDrawn: Object.values(residual.drawByGoalId).reduce((sum, v) => sum + v, 0)
    },
    /**
     * Recommended assignments from this report pass (residual first, then engines).
     * Auto-synced into goalMappings for non-customized goals; Customize Save overrides.
     */
    assignments: {
      currentPlan: sanitizePlanningMappings(Object.fromEntries(
        activeGoals.map((goal) => [
          goal.id,
          {
            ...(residual.drawByGoalId[goal.id] || 0) > 0 ? {
              [FUTURE_SURPLUS_AVENUE_ID]: residual.drawByGoalId[goal.id]
            } : {},
            ...planPass.goalMappings[goal.id] || {}
          }
        ])
      )),
      persisted: persistedPlanningMappings
    }
  };
}
export {
  CUSTOMIZABLE_ALLOCATION_AVENUES,
  ENGINE_WITHDRAWAL_AVENUES,
  FUTURE_SURPLUS_AVENUE_ID,
  GOAL_ACCENT_PALETTE,
  RESIDUAL_POOL_RATE,
  SCENARIO_BASELINE,
  SCENARIO_MAXIMUM,
  SCENARIO_PLAN,
  SCENARIO_WEALTH,
  avenueLabel,
  buildApplyPayload,
  buildAvenueSchedules,
  buildPlannedMonthsNotice,
  buildResidualBreakdownForGoal,
  buildResidualContributions,
  buildTrackSurplusAllocationReport,
  clampAvenueAmount,
  computeAsOfCorpus,
  derivePlannedMonths,
  getGoalFutureValue,
  getGoalTargetYear,
  isRetirementGoal,
  labelForPlanKey,
  mergeGoalMapping,
  monthKeyForAllocation,
  pickGoalAccent,
  runFundingPass,
  sanitizeEngineMappings,
  sanitizePlanningMappings,
  scenarioDescription,
  scenarioLabel,
  simulateResidualPool,
  sortGoalsNearestFirst
};
