# WealthMap Financial Engine: Technical Specification & Mathematical Definitions
> **Document 1 of 2**: Comprehensive Technical & Laymen Reference of all Financial Formulas, Algorithms, Input Parameters, Output Schemas, and Engineering Rationales.

---

## Table of Contents
1. [Overview & Architectural Philosophy](#overview--architectural-philosophy)
2. [Domain 1: Wealth Accumulation & Compound Growth Engines](#domain-1-wealth-accumulation--compound-growth-engines)
   - [1.1 SIP Compound Growth Engine](#11-sip-compound-growth-engine)
   - [1.2 Lumpsum & Direct Equity CAGR Growth Engine](#12-lumpsum--direct-equity-cagr-growth-engine)
   - [1.3 Fixed Deposit (FD) Compounding Engine](#13-fixed-deposit-fd-compounding-engine)
   - [1.4 Recurring Deposit (RD) Quarterly Compounding Engine](#14-recurring-deposit-rd-quarterly-compounding-engine)
   - [1.5 Public Provident Fund (PPF) Statutory Engine](#15-public-provident-fund-ppf-statutory-engine)
   - [1.6 National Pension System (NPS) & Annuity Payout Engine](#16-national-pension-system-nps--annuity-payout-engine)
   - [1.7 Systematic Withdrawal Plan (SWP) Engine](#17-systematic-withdrawal-plan-swp-engine)
3. [Domain 2: Debt Amortization & Loan Liabilities Engines](#domain-2-debt-amortization--loan-liabilities-engines)
   - [2.1 Home Loan Daily Rest & Dynamic Prepayment Engine](#21-home-loan-daily-rest--dynamic-prepayment-engine)
   - [2.2 Reducing Balance EMI Loan Engine](#22-reducing-balance-emi-loan-engine)
4. [Domain 3: Financial Health, Risk & Protection Engines](#domain-3-financial-health-risk--protection-engines)
   - [3.1 Human Life Value (HLV) & Protection Gap Engine](#31-human-life-value-hlv--protection-gap-engine)
   - [3.2 Emergency Fund & Contingency Hygiene Engine](#32-emergency-fund--contingency-hygiene-engine)
   - [3.3 Net Worth & Asset-Liability Valuation Engine](#33-net-worth--asset-liability-valuation-engine)
   - [3.4 Cash Flow, Surplus & Expense Ratios Engine](#34-cash-flow-surplus--expense-ratios-engine)
   - [3.5 Demographic & Retirement Timeline Engine](#35-demographic--retirement-timeline-engine)
5. [Domain 4: Taxation, Goals & Multi-Year Projection Engines](#domain-4-taxation-goals--multi-year-projection-engines)
   - [5.1 Indian Income Tax Engine (FY 2025-26 New Regime)](#51-indian-income-tax-engine-fy-2025-26-new-regime)
   - [5.2 Goal Future Cost & Inflation Compounding Engine](#52-goal-future-cost--inflation-compounding-engine)
   - [5.3 Multi-Asset Growth Portfolio Engine](#53-multi-asset-growth-portfolio-engine)
   - [5.4 Insurance Premium & Coverage Timeline Engine](#54-insurance-premium--coverage-timeline-engine)
   - [5.5 Life Journey Multi-Decade Cash Flow & Deficit Engine](#55-life-journey-multi-decade-cash-flow--deficit-engine)
6. [Domain 5: Strategic Allocation & Portfolio Optimization Engines](#domain-5-strategic-allocation--portfolio-optimization-engines)
   - [6.1 Hygiene & Protection Waterfall Allocation Engine](#61-hygiene--protection-waterfall-allocation-engine)
   - [6.2 Goal Funding Deficit & Annuity-Due Monthly SIP Engine](#62-goal-funding-deficit--annuity-due-monthly-sip-engine)
   - [6.3 Goal Horizon & Asset Vehicle Mapping Engine](#63-goal-horizon--asset-vehicle-mapping-engine)
   - [6.4 Life Stage Determination Engine](#64-life-stage-determination-engine)
   - [6.5 Number to INR Words Formatter Engine](#65-number-to-inr-words-formatter-engine)

---

## Overview & Architectural Philosophy

The WealthMap Financial Engine is built to provide deterministic, mathematically rigorous financial planning projections for Indian retail households. The architecture seamlessly integrates:
1. **Precision Standard Benchmarks**: Regulatory standards set by Indian statutory bodies (RBI, Income Tax Department, PFRDA, IRDAI, SEBI).
2. **Hybrid State Synchronization**: Real-time integration connecting user-entered baseline assets/expenses, journey adjustments, and allocation studio proposals.
3. **Monthly Granularity with Annual Aggregation**: Internal simulation loops operate at a 1-month step resolution to capture intra-year cash inflows, loan prepayments, compounding flushes, and goal drawdowns, which are then aggregated into annual financial reporting ledgers.

---

## Domain 1: Wealth Accumulation & Compound Growth Engines

### 1.1 SIP Compound Growth Engine

- **Primary Code Location**: [`SIPCalculator.jsx:L9-L73`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/SIPCalculator.jsx#L9-L73) (`computeSIPData`)
- **Mathematical Definition**:
  For each relative month \( m \in [1, 12] \) of relative year \( y \):
  $$r_{m} = \frac{\text{expectedReturns}}{1200}$$
  $$\text{runningSIP}_{m} = \text{runningSIP}_{m-1} + \Delta\text{StepUp}_{m} + \Delta\text{ProposedSIP}_{m}$$
  $$\text{grossValue}_{m} = (\text{balance}_{m-1} + \text{runningSIP}_{m}) \times (1 + r_{m})$$
  $$\text{balance}_{m} = \text{grossValue}_{m} - \text{withdrawal}_{m}$$
  where \(\text{withdrawal}_{m}\) includes manual what-if withdrawals and auto-mapped goal drawdowns from the fulfillment roadmap.

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `currentYear` | `number` | `new Date().getFullYear()` | Base calendar year of simulation |
  | `monthlySIP` | `number` | `expenseCategories.savings.sip` | Baseline monthly SIP commitment (₹) |
  | `expectedReturns` | `number` | `calculatorInputs.sip.rate` (Default: 12%) | Expected annual return rate (%) |
  | `tenureYears` | `number` | `calculatorInputs.sip.tenure` (Default: Years to retirement or 10) | Projection horizon in years |
  | `currentValue` | `number` | `assetCategories.investments.mutualFunds` | Current accumulated portfolio value (₹) |
  | `events` | `Array<Object>` | User what-if events | Custom monthly step-ups or withdrawals |
  | `proposedSIPs` | `Array<Object>` | Allocation Module (`type === 'SIP'`) | Proposed SIP additions starting at specific month/year |
  | `goalMappings` | `Object` | Fulfillment Roadmap | Mapped goal drawdowns linked to SIP corpus |
  | `goals` | `Array<Object>` | Goals Module | Array of user financial goals |

- **Output Structure**:
  Returns an array of yearly summary objects:
  ```ts
  Array<{
    year: number,
    monthlyInvestment: number,      // Final monthly SIP rate in that year
    annualInvestment: number,       // Total capital injected during the year
    endValueBeforeWithdrawal: number,// Corpus before year-end withdrawals
    withdrawal: number,             // Total capital drawn during the year
    valueAfterWithdrawal: number    // Closing portfolio balance
  }>
  ```

- **Technical & Domain Rationale**:
  Standard FV formulas assume static monthly payments. WealthMap models monthly state transitions to allow **dynamic step-ups** (e.g., salary hikes) and **auto-linked goal redemption**, ensuring realistic liquidity tracking until retirement.

- **Dual Explanation**:
  - *Technical*: Evaluates monthly annuity-due compounding with incremental state mutations for variable contributions and redemptions.
  - *Layman*: Shows how your monthly mutual fund investments grow over time, accounting for increases in your monthly savings and money withdrawn to pay for big life goals like buying a house or paying college fees.

---

### 1.2 Lumpsum & Direct Equity CAGR Growth Engine

- **Primary Code Location**: [`LumpsumCalculator.jsx:L9-L90`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/LumpsumCalculator.jsx#L9-L90) (`computeLumpsumData`) and [`EquityCalculator.jsx:L9-L90`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/EquityCalculator.jsx#L9-L90) (`computeEquityData`)
- **Mathematical Definition**:
  Converts annual CAGR rate \( R \) into an exact compounding monthly multiplier \( M_{m} \):
  $$M_{m} = \left(1 + \frac{R}{100}\right)^{\frac{1}{12}}$$
  For each month \( m \):
  $$\text{balance}_{\text{pre}} = \text{balance}_{m-1} + \text{Additions}_{m} - \text{Withdrawals}_{m}$$
  $$\text{balance}_{m} = \text{balance}_{\text{pre}} \times M_{m}$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `investmentAmount` | `number` | `calculatorInputs.lumpsum.amount` / Asset Baseline | Initial principal or current stock portfolio (₹) |
  | `expectedReturns` | `number` | `calculatorInputs.lumpsum.rate` (Default: 12%) | Annual CAGR rate (%) |
  | `tenureYears` | `number` | `calculatorInputs.lumpsum.tenure` (Default: 10) | Projection horizon in years |
  | `startMonth` / `startYear` | `number` | `new Date()` | Start calendar date of investment |
  | `proposedLumpsums` | `Array` | Allocation Module | Future one-time lump-sum additions |

- **Output Structure**:
  ```ts
  Array<{
    year: number,
    investmentAndAddition: number, // Capital added during the year
    withdrawal: number,            // Capital drawn during the year
    endValueBeforeWithdrawal: number,
    valueAfterWithdrawal: number   // Net year-end balance
  }>
  ```

- **Technical & Domain Rationale**:
  Uses exponential sub-period growth \((1+R)^{1/12}\) instead of linear monthly division \((1 + R/12)\). This preserves mathematical equivalence to annual CAGR across arbitrary month counts.

- **Dual Explanation**:
  - *Technical*: Implements continuous sub-period exponential compounding matching discrete annual compound interest curves.
  - *Layman*: Calculates how a one-time lump-sum investment or stock portfolio grows year after year at a fixed percentage rate.

---

### 1.3 Fixed Deposit (FD) Compounding Engine

- **Primary Code Location**: [`FDCalculator.jsx:L6-L168`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/FDCalculator.jsx#L6-L168) (`computeFDData`)
- **Mathematical Definition**:
  Monthly periodic interest rate:
  $$r_{m} = \frac{\text{expectedReturns}}{100 \times 12}$$
  Monthly interest earned by active FD \( k \):
  $$I_{k, m} = \text{compoundingBase}_{k, m-1} \times r_{m}$$
  $$\text{uncompoundedInterest}_{k, m} = \text{uncompoundedInterest}_{k, m-1} + I_{k, m}$$
  If month index satisfies compounding frequency (\(m \pmod{F_{\text{months}}} == 0\)):
  $$\text{compoundingBase}_{k, m} = \text{compoundingBase}_{k, m-1} + \text{uncompoundedInterest}_{k, m}$$
  $$\text{uncompoundedInterest}_{k, m} = 0$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `expectedReturns` | `number` | User input (Default: 7.00%) | Annual interest rate (%) |
  | `frequency` | `string` | `'Monthly' \| 'Quarterly' \| 'Half-Yearly' \| 'Annually'` | Compounding frequency |
  | `rawBaselineFDs` | `Array \| Object` | `assetCategories.investments.fixedDeposit` | Active synchronized FD holdings |
  | `proposedFDs` | `Array` | Allocation Module | Future proposed FDs |

- **Output Structure**:
  ```ts
  {
    schedule: Array<{
      year: number,
      openingValue: number,
      deposit: number,
      interest: number,
      maturityValue: number,
      endValue: number
    }>,
    totals: { globalDeposit: number, globalInterest: number, finalMaturity: number }
  }
  ```

- **Technical & Domain Rationale**:
  Maintains separate registers for `compoundingBase` and `uncompoundedInterest`. Indian banks compute interest monthly but compound it quarterly. This engine accurately models maturity values across custom compounding intervals.

- **Dual Explanation**:
  - *Technical*: Simulates periodic interest accrual with discrete compounding flushes according to banking regulations.
  - *Layman*: Calculates bank FD returns where interest is calculated every month but added to your main deposit balance every quarter.

---

### 1.4 Recurring Deposit (RD) Quarterly Compounding Engine

- **Primary Code Location**: [`RDCalculator.jsx:L6-L127`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/RDCalculator.jsx#L6-L127) (`computeRDData`)
- **Mathematical Definition**:
  Fixed compounding interval \( F_{\text{months}} = 3 \) (Quarterly).
  For each active month \( m \):
  $$\text{compoundingBase}_{m} = \text{compoundingBase}_{m-1} + P_{\text{monthly}}$$
  $$I_{m} = \text{compoundingBase}_{m} \times \frac{\text{expectedReturns}}{1200}$$
  $$\text{uncompoundedInterest}_{m} = \text{uncompoundedInterest}_{m-1} + I_{m}$$
  At quarter end (\(m \pmod 3 == 0\)):
  $$\text{compoundingBase}_{m} = \text{compoundingBase}_{m} + \text{uncompoundedInterest}_{m}$$
  $$\text{uncompoundedInterest}_{m} = 0$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `allRDStreams` | `Array<Object>` | Cash Flow Baseline / Allocations | Active RD deposit streams |
  | `expectedReturns` | `number` | User input (Default: 7.00%) | Annual interest rate (%) |

- **Output Structure**:
  Returns amortization `schedule` (opening, annual deposits, interest earned, maturity payouts, closing balance) and `totals`.

- **Technical & Domain Rationale**:
  Complies strictly with Indian Post Office and commercial bank RD compounding guidelines (RBI master direction on interest rates), where monthly installments compound quarterly.

- **Dual Explanation**:
  - *Technical*: Models monthly principal additions with quarterly interest capitalization.
  - *Layman*: Shows how your monthly RD deposits grow, where each month's installment starts earning interest immediately, and interest gets added to your principal every 3 months.

---

### 1.5 Public Provident Fund (PPF) Statutory Engine

- **Primary Code Location**: [`PPFCalculator.jsx:L5-L91`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/PPFCalculator.jsx#L5-L91) (`computePPFData`)
- **Mathematical Definition**:
  Tenure is strictly 15 fiscal years (180 months). Annual contribution cap = ₹1,50,000.
  For year \( y \):
  $$\text{investment}_{y} = \min\left(150000, \sum_{m=1}^{12} P_{m}\right)$$
  $$\text{interest}_{y} = (\text{openingBalance}_{y} + \text{investment}_{y}) \times \frac{\text{rate}}{100}$$
  $$\text{endValue}_{y} = \text{openingBalance}_{y} + \text{investment}_{y} + \text{interest}_{y}$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `proposedPPFs` | `Array` | Allocation Module | PPF allocations |
  | `expectedReturns` | `number` | User input (Default: 7.10%) | Government prescribed PPF rate (%) |
  | `defaultPPFObj` | `Object` | `expenseCategories.savings.ppf` | Baseline monthly PPF contribution |

- **Output Structure**:
  ```ts
  {
    results: Array<{ year: number, investment: number, interest: number, endValue: number }>,
    startString: string,
    endString: string
  }
  ```

- **Technical & Domain Rationale**:
  Enforces the statutory ₹1.5 Lakh annual deposit ceiling under Section 80C rules and models annual interest compounding credited at fiscal year-end (March 31st).

- **Dual Explanation**:
  - *Technical*: Implements statutory annual cap-constrained accumulation over a 15-year lock-in period.
  - *Layman*: Calculates Government PPF growth over its mandatory 15-year lock-in period, enforcing the maximum ₹1.5 Lakh yearly deposit limit.

---

### 1.6 National Pension System (NPS) & Annuity Payout Engine

- **Primary Code Location**: [`NPSCalculator.jsx:L7-L130`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/NPSCalculator.jsx#L7-L130) (`computeNPSData`)
- **Mathematical Definition**:
  1. Accumulation phase until retirement age \( A_{\text{retire}} \):
     $$I_{m} = (\text{balance}_{m-1} + P_{m}) \times \frac{\text{expectedReturns}}{1200}$$
     $$\text{balance}_{m} = \text{balance}_{m-1} + P_{m} + I_{m}$$
  2. Retirement decumulated split:
     $$\text{AnnuityAmount} = \text{MaturityCorpus} \times \frac{\max(40, \text{AnnuityPercent})}{100}$$
     $$\text{LumpSumTaxFree} = \text{MaturityCorpus} - \text{AnnuityAmount}$$
     $$\text{MonthlyPension} = \frac{\text{AnnuityAmount} \times \frac{\text{AnnuityRate}}{100}}{12}$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `expectedReturns` | `number` | User input (Default: 10.00%) | Investment return rate during accumulation (%) |
  | `annuityPercent` | `number` | User input (Default: 40%, min 40%) | Percentage of corpus allocated to annuity |
  | `annuityRate` | `number` | User input (Default: 6.00%) | Expected annual annuity yield (%) |
  | `selfMember` | `Object` | `familyMembers` | User profile (DOB & retirement age) |

- **Output Structure**:
  ```ts
  {
    schedule: Array<{ year: number, age: number, investment: number, interest: number, endValue: number }>,
    totals: {
      maturityCorpus: number,
      annuityAmount: number,
      lumpSumAmount: number,
      monthlyPension: number,
      retirementAge: number
    }
  }
  ```

- **Technical & Domain Rationale**:
  Enforces PFRDA regulations requiring at least 40% of the superannuation corpus to be converted into a life annuity, leaving up to 60% as a tax-free lump sum withdrawal.

- **Dual Explanation**:
  - *Technical*: Models PFRDA-compliant accumulation and dual-mode decumulation (lump-sum vs annuity yield).
  - *Layman*: Projects your retirement NPS corpus and shows how much cash you get tax-free at age 60 versus how much monthly pension you will receive for life.

---

### 1.7 Systematic Withdrawal Plan (SWP) Engine

- **Primary Code Location**: [`SWPCalculator.jsx:L66-L140`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/SWPCalculator.jsx#L66-L140)
- **Mathematical Definition**:
  For each month \( m \):
  If \( m \pmod{12} == 0 \) and annual increment rate \( g_{\text{swp}} > 0 \):
  $$W_{m} = W_{m-1} \times \left(1 + \frac{g_{\text{swp}}}{100}\right)$$
  $$\text{balance}_{\text{afterWith}} = \max\left(0, \text{balance}_{m-1} - W_{m} - \text{LumpsumWith}_{m}\right)$$
  $$\text{balance}_{m} = \text{balance}_{\text{afterWith}} \times \left(1 + \frac{\text{expectedReturns}}{1200}\right)$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `investmentAmount` | `number` | User input | Initial capital balance (₹) |
  | `monthlyWithdrawal` | `number` | User input | Initial monthly withdrawal amount (₹) |
  | `expectedReturns` | `number` | User input (Default: 10%) | Annual growth rate (%) |
  | `annualIncrement` | `number` | User input (Default: 0%) | Annual step-up in monthly withdrawal (%) |
  | `startAfterYears` | `number` | User input (Default: 0) | Deferral period before withdrawals start |

- **Output Structure**:
  Amortization array tracking opening balance, yearly withdrawals, lumpsum redemptions, and closing corpus value.

- **Technical & Domain Rationale**:
  Deducts monthly withdrawals at the *beginning* of the month before applying monthly growth. This matches actual mutual fund SWP execution order where units are redeemed on a fixed monthly date.

- **Dual Explanation**:
  - *Technical*: Evaluates monthly unit redemption mechanics with annual inflation-adjusted step-ups and remaining balance growth.
  - *Layman*: Shows how long your invested money will last when you withdraw a regular monthly income (like a self-made pension), even if you increase your monthly income each year to combat inflation.

---

## Domain 2: Debt Amortization & Loan Liabilities Engines

### 2.1 Home Loan Daily Rest & Dynamic Prepayment Engine

- **Primary Code Location**: [`HomeLoanCalculator.jsx:L47-L149`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/HomeLoanCalculator.jsx#L47-L149)
- **Mathematical Definition**:
  1. Standard initial base EMI:
     $$r_{\text{monthly}} = \frac{\text{interestRate}}{1200}, \quad n = \text{tenureYears} \times 12$$
     $$\text{BaseEMI} = \frac{P \times r_{\text{monthly}} \times (1 + r_{\text{monthly}})^{n}}{(1 + r_{\text{monthly}})^{n} - 1}$$
  2. Daily Rest Interest Accrual for month \( m \) in year \( y \):
     $$\text{daysInYear} = \begin{cases} 366 & \text{if leap year}(y) \\ 365 & \text{otherwise} \end{cases}$$
     $$\text{dailyRate} = \frac{\text{currentRate} / 100}{\text{daysInYear}}$$
     $$\text{runningPrincipal} = \text{runningPrincipal} - \text{Prepayments}_{m}$$
     $$I_{m} = \text{runningPrincipal} \times \text{dailyRate} \times \text{daysInMonth}(m, y)$$
     $$\text{PrincipalPaid}_{m} = \min(\text{runningPrincipal}, \text{BaseEMI} - I_{m})$$
     $$\text{runningPrincipal} = \text{runningPrincipal} - \text{PrincipalPaid}_{m}$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `loanAmount` | `number` | Cash Flow / Input | Outstanding principal (₹) |
  | `interestRate` | `number` | Cash Flow / Input (Default: 8.5%) | Annual interest rate (%) |
  | `tenureYears` | `number` | Cash Flow / Input (Default: 20) | Total tenure in years |
  | `events` | `Array<Object>` | User inputs | Mid-tenure prepayments or rate change events |

- **Output Structure**:
  ```ts
  {
    schedule: Array<{
      year: number,
      openingBalance: number,
      principalPaid: number,
      interestPaid: number,
      prepayments: number,
      closingBalance: number
    }>,
    baseEMI: number,
    totalPrincipal: number
  }
  ```

- **Technical & Domain Rationale**:
  Implements **Daily Rest Interest Amortization** with leap-year adjustments. Indian home loans calculate interest on the daily closing principal balance. Prepayments immediately reduce principal, which automatically lowers interest charges for subsequent days.

- **Dual Explanation**:
  - *Technical*: Implements exact daily balance interest calculation with dynamic prepayment principal reduction.
  - *Layman*: Calculates your home loan payments using exact daily interest (as Indian banks do). It shows how making partial prepayments dramatically slashes your total interest and helps you become debt-free faster.

---

### 2.2 Reducing Balance EMI Loan Engine

- **Primary Code Location**: [`CarLoanCalculator.jsx:L33-L94`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/CarLoanCalculator.jsx#L33-L94), [`PersonalLoanCalculator.jsx:L33-L94`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/PersonalLoanCalculator.jsx#L33-L94), [`TwoWheelerCalculator.jsx:L33-L94`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/TwoWheelerCalculator.jsx#L33-L94), [`EducationLoanCalculator.jsx:L33-L94`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/Calculators/EducationLoanCalculator.jsx#L33-L94)
- **Mathematical Definition**:
  $$r = \frac{\text{interestRate}}{1200}, \quad n = \text{tenureYears} \times 12$$
  $$\text{EMI} = \frac{P \times r \times (1 + r)^{n}}{(1 + r)^{n} - 1}$$
  For each month \( m \):
  $$I_{m} = \text{balance}_{m-1} \times r$$
  $$P_{m} = \text{EMI} - I_{m}$$
  $$\text{balance}_{m} = \text{balance}_{m-1} - P_{m}$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `loanAmount` | `number` | Cash Flow / Input | Principal amount (₹) |
  | `interestRate` | `number` | Cash Flow / Input | Annual interest rate (%) |
  | `tenureYears` | `number` | Cash Flow / Input | Loan term (Years) |

- **Output Structure**:
  Returns monthly/annual schedule of opening balance, principal paid, interest paid, and closing balance.

- **Technical & Domain Rationale**:
  Uses standard monthly reducing balance amortization. Interest is computed only on the outstanding principal balance at the beginning of each monthly cycle.

- **Dual Explanation**:
  - *Technical*: Standard monthly reducing balance loan amortization formula.
  - *Layman*: Standard EMI calculation for vehicle, personal, or education loans showing how your fixed monthly payment is split between interest and paying off your principal.

---

## Domain 3: Financial Health, Risk & Protection Engines

### 3.1 Human Life Value (HLV) & Protection Gap Engine

- **Primary Code Location**: [`ProtectionGapLogic.js:L107-L201`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/ProtectionGapModule/ProtectionGapLogic.js#L107-L201) (`calculateProtectionGap`)
- **Mathematical Definition**:
  1. Income Multiple Table by Age Band:
     $$\text{Multiplier}(\text{age}) = \begin{cases} 25 & 18 \le \text{age} \le 35 \\ 20 & 36 \le \text{age} \le 45 \\ 15 & 46 \le \text{age} \le 50 \\ 10 & 51 \le \text{age} \le 60 \\ 5 & \text{age} \ge 61 \end{cases}$$
  2. Continuing Expenses & Net Shortfall:
     $$\text{ContinuingExpenses} = \text{HouseholdMonthly} + \text{EMIMonthly}$$
     $$\text{SurvivingIncomeMonthly} = \frac{\text{SpouseAnnualIncome}}{12}$$
     $$\text{MonthlyShortfall} = \max(0, \text{ContinuingExpenses} - \text{SurvivingIncomeMonthly})$$
  3. Human Life Value (HLV) & Insurance Gap:
     $$\text{HLVNeed} = \text{MonthlyShortfall} \times 12 \times \text{Multiplier}(\text{age})$$
     $$\text{GrossNeed} = \text{HLVNeed} + \text{NonEMILiabilities}$$
     $$\text{Deductions} = \text{ExistingLifeCoverage} + \text{LiquidAssets}$$
     $$\text{ProtectionGap} = \max(0, \text{GrossNeed} - \text{Deductions})$$
  4. Insurability Underwriting Cap:
     $$\text{InsurabilityCap} = \text{AnnualIncome} \times \text{Multiplier}(\text{age})$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `expenseCategories` | `Object` | Cash Flow | Household & EMI monthly expenses |
  | `policies` | `Array` | Insurance Vault | Active insurance policies |
  | `familyMembers` | `Array` | Profile | Family members (ages & earning status) |
  | `income` | `Object` | Income Module | Income details for self and spouse |
  | `assetCategories` | `Object` | Asset Module | Investment & liquid asset balances |
  | `liabilityCategories` | `Object` | Liability Module | Non-EMI liabilities (credit card dues, payables) |

- **Output Structure**:
  ```ts
  {
    self: {
      name: string,
      coverage: number,
      need: number,
      gap: number,
      idealCover: number,
      insurabilityCap: number,
      isCapped: boolean,
      hlv: number,
      needsBreakdown: Object
    },
    spouse: Object | null
  }
  ```

- **Technical & Domain Rationale**:
  Combines the **Expense Replacement Method** and the **Income Multiple Method**. Crucially, it offsets continuing expenses against surviving spouse income to prevent over-insuring dual-income households, while accounting for non-EMI liabilities and existing liquid assets.

- **Dual Explanation**:
  - *Technical*: Calculates human life replacement value adjusted for surviving partner income offsets, liquid assets, and insurer underwriting caps.
  - *Layman*: Determines how much term insurance cover you need so that if something happens to you, your family can pay off all loans and maintain their lifestyle without financial stress.

---

### 3.2 Emergency Fund & Contingency Hygiene Engine

- **Primary Code Location**: [`ContingencyLogic.js:L1-L32`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/ContingencyModule/ContingencyLogic.js#L1-L32) (`calculateContingencyFund`)
- **Mathematical Definition**:
  $$\text{MonthlyTotal} = \text{HouseholdMonthly} + \text{EMIMonthly}$$
  $$\text{IdealFundsRequired} = \text{MonthlyTotal} \times 6$$
  $$\text{NetShortfall} = \max(0, \text{IdealFundsRequired} - \text{AvailableEmergencyFunds})$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `expenseCategories` | `Object` | Cash Flow | Monthly household expenses + EMIs |
  | `fundAvailable` | `number` | Asset Module / Input | Current savings bank & cash funds earmarked for emergency |

- **Output Structure**:
  ```ts
  {
    monthlyTotal: number,
    contingencyPeriod: number, // 6 months
    idealFundsRequired: number,
    availableFunds: number,
    netShortfall: number,
    isHealthy: boolean
  }
  ```

- **Technical & Domain Rationale**:
  Maintains a strict 6-month buffer covering both lifestyle costs and debt service obligations to protect families against sudden job loss or income disruption.

- **Dual Explanation**:
  - *Technical*: Computes a 6-month liquidity reserve requirement over total mandatory outflows.
  - *Layman*: Calculates your 6-month emergency safety net required to cover essential bills and loan EMIs if your income temporarily stops.

---

### 3.3 Net Worth & Asset-Liability Valuation Engine

- **Primary Code Location**: [`AssetLogic.js:L10-L87`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/AssetModule/AssetLogic.js#L10-L87) (`calculateNetWorth`)
- **Mathematical Definition**:
  $$\text{TotalAssets} = \sum \text{RealEstate} + \text{Vehicles} + \text{Valuables} + \text{LiquidCash} + \text{Investments} + \text{Retirement} + \text{Custom}$$
  $$\text{TotalLiabilities} = \sum \text{HomeLoans} + \text{CarLoans} + \text{PersonalLoans} + \text{CreditCardDues} + \text{Payables}$$
  $$\text{NetWorth} = \text{TotalAssets} - \text{TotalLiabilities}$$
  $$\text{CategoryAllocationPct}_{k} = \frac{\text{AssetCategoryValue}_{k}}{\text{TotalAssets}} \times 100$$

- **Parameters Required**:
  `assetCategories` and `liabilityCategories` object trees.

- **Output Structure**:
  Returns `totalAssets`, `totalLiabilities`, `netWorth`, `assetBreakdown`, and category-wise `allocation` percentages.

- **Technical & Domain Rationale**:
  Handles both detailed itemized balances and high-level summary fallback snapshots, ensuring seamless reconciliation regardless of user data completion.

- **Dual Explanation**:
  - *Technical*: Aggregates multi-class asset and liability balances into a unified balance sheet and calculates percentage asset distribution.
  - *Layman*: Summarizes everything you own minus everything you owe to show your true financial Net Worth.

---

### 3.4 Cash Flow, Surplus & Expense Ratios Engine

- **Primary Code Location**: [`CashFlowLogic.js:L19-L211`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/CashFlowModule/CashFlowLogic.js#L19-L211) (`calculateCashFlow`)
- **Mathematical Definition**:
  $$\text{TotalExpenses} = \text{HouseholdMonthly} + \text{EMIMonthly} + \text{InsuranceMonthly}$$
  $$\text{Surplus} = \text{TotalIncomeMonthly} - \text{TotalExpenses}$$
  $$\text{DisposableIncome} = \text{Surplus} - \text{SavingsMonthly}$$
  $$\text{SurplusRate} = \frac{\text{Surplus}}{\text{TotalIncomeMonthly}} \times 100$$
  $$\text{EMIRatio} = \frac{\text{EMIMonthly}}{\text{TotalIncomeMonthly}} \times 100$$
  Health Criteria: `isHealthy` \(\iff \text{SurplusRate} \ge 20\%\); `isCritical` \(\iff \text{SurplusRate} < 0 \lor \text{DisposableIncome} < 0\).

- **Parameters Required**:
  `income`, `expenseCategories`, `familyMembers`, `hasSpouseIncome`.

- **Output Structure**:
  Returns itemized category sums, surplus, disposable income, financial health flags, and percentage expense ratios.

- **Technical & Domain Rationale**:
  Separates committed savings/investments from fixed expenses, allowing advisors to analyze true free cash flow versus locked savings.

- **Dual Explanation**:
  - *Technical*: Derives monthly cash flow ratios, net surplus rates, and liquidity health flags.
  - *Layman*: Shows how much money comes in each month, where it goes (lifestyle, loans, insurance, savings), and how much free cash is left over.

---

### 3.5 Demographic & Retirement Timeline Engine

- **Primary Code Location**: [`ProfileLogic.js:L1-L25`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/ProfileModule/ProfileLogic.js#L1-L25) (`calculateAge`)
- **Mathematical Definition**:
  Given date of birth \(\text{DOB}\) and current date \(\text{Today}\):
  $$\text{Age} = \text{Year}(\text{Today}) - \text{Year}(\text{DOB})$$
  If \(\text{Month}(\text{Today}) < \text{Month}(\text{DOB})\) or (\(\text{Month}(\text{Today}) == \text{Month}(\text{DOB})\) and \(\text{Day}(\text{Today}) < \text{Day}(\text{DOB})\)):
  $$\text{Age} = \text{Age} - 1$$
  $$\text{YearsToRetirement} = \max(0, \text{RetirementAge} - \text{Age})$$

- **Parameters Required**:
  Date string `dob` and integer `retirementAge` (Default: 60).

- **Output Structure**: Integer representing current exact age and remaining working years.

- **Technical & Domain Rationale**: Account for month and day boundaries to prevent premature age increments on birth years.

- **Dual Explanation**:
  - *Technical*: Calculates exact chronological age and remaining working years.
  - *Layman*: Determines your exact age today and how many years you have left until retirement.

---

## Domain 4: Taxation, Goals & Multi-Year Projection Engines

### 5.1 Indian Income Tax Engine (FY 2025-26 New Regime)

- **Primary Code Location**: [`IncomeTaxLogic.js:L323-L485`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/IncomeTaxModule/IncomeTaxLogic.js#L323-L485) (`calculateIncomeTaxFromInput`)
- **Mathematical Definition**:
  1. Standard Deduction:
     $$\text{TaxableIncome} = \max(0, \text{GrossAnnualIncome} - \text{StandardDeduction}(₹75,000))$$
  2. FY 2025-26 Slab Structure:
     $$\text{SlabTax} = \begin{cases} 
     0 & \text{Income} \le 4L \\
     5\% \times (\text{Income} - 4L) & 4L < \text{Income} \le 8L \\
     20k + 10\% \times (\text{Income} - 8L) & 8L < \text{Income} \le 12L \\
     60k + 15\% \times (\text{Income} - 12L) & 12L < \text{Income} \le 16L \\
     120k + 20\% \times (\text{Income} - 16L) & 16L < \text{Income} \le 20L \\
     200k + 25\% \times (\text{Income} - 20L) & 20L < \text{Income} \le 24L \\
     300k + 30\% \times (\text{Income} - 24L) & \text{Income} > 24L
     \end{cases}$$
  3. Section 87A Rebate & Marginal Relief:
     If \(\text{TaxableIncome} \le 1,200,000\):
     $$\text{Rebate87A} = \min(\text{SlabTax}, 60,000) \implies \text{TaxAfterRebate} = 0$$
     If \(\text{TaxableIncome} > 1,200,000\) and \(\text{SlabTax} > (\text{TaxableIncome} - 1,200,000)\):
     $$\text{MarginalRelief} = \text{SlabTax} - (\text{TaxableIncome} - 1,200,000)$$
     $$\text{TaxAfterRebate} = \text{TaxableIncome} - 1,200,000$$
  4. Surcharge & Surcharge Marginal Relief:
     Surcharge rates: 10% (>₹50L), 15% (>₹1Cr), 25% (>₹2Cr). Surcharge relief caps total tax + surcharge to avoid exceeding income above threshold.
  5. Health & Education Cess:
     $$\text{Cess} = (\text{TaxAfterRebate} + \text{Surcharge} - \text{SurchargeRelief}) \times 0.04$$
     $$\text{FinalTaxPayable} = \text{TaxAfterRebate} + \text{Surcharge} - \text{SurchargeRelief} + \text{Cess}$$

- **Parameters Required**:
  | Parameter | Type | Source / Default | Description |
  | :--- | :--- | :--- | :--- |
  | `grossTotalIncome` | `number` | Income Module | Total annual gross salary/pension/business earnings |
  | `employmentType` | `string` | Profile Module | Employment classification |
  | `otherIncomeAnnual` | `number` | Income Module | Freelance, rent, or dividend income |

- **Output Structure**:
  Returns complete tax object detailing standard deduction, slab breakdown (`t1`..`t7`), Section 87A rebate, marginal relief, surcharge, cess, and `finalTax`.

- **Technical & Domain Rationale**:
  Implements Budget 2025 updates for the New Tax Regime, including the revised 7-slab tax structure, expanded ₹75,000 standard deduction, and Section 87A marginal relief.

- **Dual Explanation**:
  - *Technical*: Calculates progressive slab tax under the FY 2025-26 New Regime with Section 87A rebate, marginal relief algorithms, surcharge thresholds, and cess.
  - *Layman*: Calculates your exact income tax under India's new tax regime, ensuring you get full tax exemption if you earn up to ₹12.75 Lakh (including standard deduction), and applying marginal relief so earning slightly over ₹12 Lakh doesn't penalize you with huge tax jumps.

---

### 5.2 Goal Future Cost & Inflation Compounding Engine

- **Primary Code Location**: [`GoalLogic.js:L1-L48`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/GoalModule/GoalLogic.js#L1-L48)
- **Mathematical Definition**:
  $$\text{FutureCost} = \text{PresentValue} \times \left(1 + \frac{\text{InflationRate}}{100}\right)^{\text{YearsToGoal}}$$
  Categorization Horizontals:
  $$\text{HorizonCategory} = \begin{cases} \text{Short-Term} & \text{Years} \le 3 \\ \text{Medium-Term} & 3 < \text{Years} \le 7 \\ \text{Long-Term} & \text{Years} > 7 \end{cases}$$

- **Parameters Required**: `presentValue` (₹), `yearsToGoal`, `inflationRate` (Default: 6% general, 8% education).

- **Output Structure**: `futureCost` (₹), `targetYear`, and horizon bucket assignment.

- **Technical & Domain Rationale**: Compounds present costs at goal-specific inflation rates (e.g., 8% for higher education vs 6% for general goals).

- **Dual Explanation**:
  - *Technical*: Compounds target goal costs at category-specific inflation rates over the time horizon.
  - *Layman*: Calculates how much a goal will actually cost in the future after accounting for inflation.

---

### 5.3 Multi-Asset Growth Portfolio Engine

- **Primary Code Location**: [`GrowthLogic.js:L3-L127`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/GrowthModule/GrowthLogic.js#L3-L127) (`calculateGrowthProjections`)
- **Mathematical Definition**:
  For year \( y \) and asset item \( k \) with growth rate \( \text{CAGR}_{k} \):
  $$\text{Growth}_{k, y} = \text{Balance}_{k, y-1} \times \frac{\text{CAGR}_{k}}{100}$$
  $$\text{Balance}_{k, y} = \text{Balance}_{k, y-1} + \text{Growth}_{k, y} + \text{NewSavings}_{k, y} - \text{GoalDeduction}_{k, y}$$
  Default Asset CAGRs: Stocks (12%), Equity MF (12%), PPF (7.1%), FD/RD (6%), Gold (8%), Real Estate (6%).

- **Parameters Required**: Baseline asset balances, monthly recurring savings, allocation studio inputs, goals, and retirement year.

- **Output Structure**: Array of year-by-year projections tracking opening balance, new investments, growth earned, goal withdrawals, and closing balances.

- **Technical & Domain Rationale**: Models multi-asset portfolio growth by applying asset-specific return assumptions and deducting goal redemptions from portfolio balances.

- **Dual Explanation**:
  - *Technical*: Multi-asset portfolio simulation applying asset-class return rates and deducting goal redemptions.
  - *Layman*: Simulates how your total wealth grows across stocks, mutual funds, PPF, FDs, and real estate, showing how your portfolio handles goal withdrawals over time.

---

### 5.4 Insurance Premium & Coverage Timeline Engine

- **Primary Code Location**: [`InsuranceLogic.js:L8-L76`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/InsuranceModule/InsuranceLogic.js#L8-L76) (`calculateYearlyInsuranceSummary`)
- **Mathematical Definition**:
  For policy \( p \):
  $$\text{TotalPaymentInstallments} = \text{PaymentTerm} \times \text{Multiplier}(\text{Frequency})$$
  For each payment installment \( i \in [0, \text{TotalPaymentInstallments}-1] \):
  $$\text{Year}_{i} = \text{StartYear} + \left\lfloor \frac{\text{StartMonth} + i \times \text{IntervalMonths}}{12} \right\rfloor$$
  $$\text{Summary}[\text{Year}_{i}].\text{totalPremium} += \text{Premium}$$
  Coverage sum assured is mapped across all active policy years \( y \in [\text{StartYear}, \text{StartYear} + \text{PolicyTerm} - 1] \).

- **Parameters Required**: Policy array with premium, payment term, policy term, frequency, start date, and sum assured.

- **Output Structure**: Year-by-year schedule of premium outflows, member coverage totals, and maturity payouts.

- **Technical & Domain Rationale**: Distinguishes between payment term (years premium is paid) and policy term (years risk cover remains active).

- **Dual Explanation**:
  - *Technical*: Maps insurance premium payment schedules separately from active risk cover horizons and maturity payout dates.
  - *Layman*: Tracks when your insurance premiums need to be paid, when premium payments end, how long your cover lasts, and when you will receive maturity payouts.

---

### 5.5 Life Journey Multi-Decade Cash Flow & Deficit Engine

- **Primary Code Location**: [`ProjectionLogic.js:L172-L676`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/JourneyModule/ProjectionLogic.js#L172-L676) (`generateProjections`)
- **Mathematical Definition**:
  For projection year \( i \) (\( \text{Year} = \text{StartYear} + i \)):
  $$\text{AnnualInflow}_{i} = (\text{SelfIncome} + \text{SpouseIncome}) \times \left(1 + \frac{g_{\text{income}}}{100}\right)^{i}$$
  $$\text{HouseholdOutflow}_{i} = (\text{HouseholdMonthly} \times 12) \times \left(1 + \frac{i_{\text{household}}}{100}\right)^{i}$$
  $$\text{TotalOutflow}_{i} = \text{HouseholdOutflow}_{i} + \text{ActiveEMIs}_{i} + \text{EducationExpenses}_{i} + \text{JourneyAdjustments}_{i}$$
  $$\text{SurplusBeforeSaving}_{i} = (\text{AnnualInflow}_{i} - \text{TaxImpact}_{i}) - \text{TotalOutflow}_{i}$$
  $$\text{NetInvestibleSurplus}_{i} = \text{SurplusBeforeSaving}_{i} - \text{SavingsAndInsurance}_{i}$$
  $$\text{UnallocatedSurplus}_{i} = \text{NetInvestibleSurplus}_{i} - \text{ProposedAllocations}_{i}$$
  *Month-by-Month Cumulative Deficit Validation*:
  $$\text{CumulativeSurplus}_{m} = \text{CumulativeSurplus}_{m-1} + \text{MonthlyInflow} - \text{MonthlyJourneyDeduction} - \text{MonthlyAllocationDeduction}$$
  $$\text{DeficitFlag} = \text{True} \iff \text{CumulativeSurplus}_{m} < 0$$

- **Parameters Required**: Family members, income details, expense categories, inflation rates, policies, journey adjustments, allocation studio inputs, and current year ledger.

- **Output Structure**:
  Array of annual projection objects tracking inflows, tax impacts, household inflation, EMI schedules, education fee progression, net investible surplus, allocation commitments, and month-by-month deficit warnings.

- **Technical & Domain Rationale**:
  Solves the "annual average masking" problem: even if an annual surplus is positive, a heavy lump-sum payment in April could cause cash insolvency. Month-by-month cumulative tracking catches intra-year liquidity deficits.

- **Dual Explanation**:
  - *Technical*: Decouples annual macro-projections from monthly cash balance tracking to detect intra-year cash insolvency.
  - *Layman*: Simulates your family's financial journey year-by-year until retirement, accounting for salary raises, inflation, children's school fee increases, loan pay-offs, and insurance premiums. Crucially, it checks your bank balance month-by-month to warn you if a big expense will cause a cash shortage.

---

## Domain 5: Strategic Allocation & Portfolio Optimization Engines

### 6.1 Hygiene & Protection Waterfall Allocation Engine

- **Primary Code Location**: [`protectionEngine.js:L50-L255`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/DetailedReport/allocationEngine/protectionEngine.js#L50-L255) (`runProtectionEngine`)
- **Mathematical Definition**:
  Given deployable monthly surplus \( S \):
  $$\text{Budget}_{\text{Term}} = S \times \text{Share}_{\text{Term}} \quad (e.g., 15\%)$$
  $$\text{Alloc}_{\text{Term}} = \min(\text{Budget}_{\text{Term}}, \text{RequiredTermPremium}, S)$$
  $$S_{\text{rem1}} = S - \text{Alloc}_{\text{Term}}$$
  $$\text{Budget}_{\text{Health}} = S \times \text{Share}_{\text{Health}} \quad (e.g., 10\%)$$
  $$\text{Alloc}_{\text{Health}} = \min(\text{Budget}_{\text{Health}}, \text{RequiredHealthPremium}, S_{\text{rem1}})$$
  $$S_{\text{rem2}} = S_{\text{rem1}} - \text{Alloc}_{\text{Health}}$$
  $$\text{Budget}_{\text{Emergency}} = S \times \text{Share}_{\text{Emergency}} \quad (e.g., 15\%)$$
  $$\text{Alloc}_{\text{Emergency}} = \min(\text{Budget}_{\text{Emergency}}, \text{RequiredEmergencyMonthly}, S_{\text{rem2}})$$
  $$\text{ResidualSurplusForGoals} = S_{\text{rem2}} - \text{Alloc}_{\text{Emergency}} + \text{UnusedProtectionBudgets}$$

- **Parameters Required**: `deployableSurplus`, family members, expense categories, asset categories, policies, and policy overrides.

- **Output Structure**: Allocation breakdown for Term, Health, and Emergency Fund, along with residual surplus passed to goal funding.

- **Technical & Domain Rationale**:
  Enforces a strict **Hygiene First** rule: protection gaps must be budgeted before funding discretionary wealth goals. Capping allocations at actual required premiums prevents over-allocating capital to insurance.

- **Dual Explanation**:
  - *Technical*: Implements a priority waterfall allocating surplus to risk protection before passing residual capital to goal investment engines.
  - *Layman*: Automatically channels your monthly extra savings toward term insurance, health insurance, and your emergency fund first. Once these safety nets are funded, 100% of your remaining cash goes toward your wealth goals.

---

### 6.2 Goal Funding Deficit & Annuity-Due Monthly SIP Engine

- **Primary Code Location**: [`goalFundingEngine.js:L43-L117`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/DetailedReport/allocationEngine/goalFundingEngine.js#L43-L117) and [`FutureSelfLogic.js:L35-L45`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/SummaryReport/FutureSelfLogic.js#L35-L45) (`computeRequiredMonthlySIP`)
- **Mathematical Definition**:
  For goal corpus gap \( G \), investment CAGR \( r_{\text{annual}} = 12\% \), and tenure \( n_{\text{years}} \):
  $$r = \frac{r_{\text{annual}}}{1200}, \quad N = n_{\text{years}} \times 12$$
  $$\text{RequiredMonthlySIP} = \left\lceil \frac{G}{\left(\frac{(1 + r)^{N} - 1}{r}\right) \times (1 + r)} \right\rceil$$
  $$\text{MonthlyFundingDeficit} = \max(0, \text{RequiredMonthlySIP} - \text{ExistingMonthlyContribution})$$

- **Parameters Required**: Goal corpus gap, investment CAGR assumption, years remaining to goal, and existing monthly contributions.

- **Output Structure**: `requiredMonthlyContribution`, `existingMonthlyContribution`, and `monthlyFundingDeficit`.

- **Technical & Domain Rationale**:
  Uses an **annuity-due** formula (investments made at the beginning of each month) to accurately calculate the required monthly SIP to bridge a goal deficit.

- **Dual Explanation**:
  - *Technical*: Computes annuity-due inverse SIP requirements to determine exact monthly funding deficits.
  - *Layman*: Calculates the exact monthly SIP needed today to fill the shortfall for each of your future life goals.

---

### 6.3 Goal Horizon & Asset Vehicle Mapping Engine

- **Primary Code Location**: [`objectiveVehicleMap.js`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/DetailedReport/allocationEngine/objectiveVehicleMap.js) and [`allocationOptimizer.js`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/DetailedReport/allocationEngine/allocationOptimizer.js)
- **Mathematical Definition**:
  $$\text{VehicleMapping}(\text{Horizon}) = \begin{cases} 
  \text{Liquid MF / Arbitrage / FD} & \text{Years} \le 3 \quad (\text{Capital Preservation}) \\
  \text{Aggressive Hybrid / Multi-Asset} & 3 < \text{Years} \le 7 \quad (\text{Balanced Growth}) \\
  \text{Equity MF / Stocks / PPF / NPS} & \text{Years} > 7 \quad (\text{Wealth Maximization})
  \end{cases}$$
  Statutory Limit Constraint:
  $$\text{Alloc}_{\text{PPF}} = \min(\text{TargetAlloc}_{\text{PPF}}, ₹12,500/\text{month})$$

- **Parameters Required**: Goal horizon (years), goal objective classification, available goal surplus, and statutory limit rules.

- **Output Structure**: Map of proposed monthly investments across asset classes (SIP, PPF, NPS, FD, RD, Liquid MF).

- **Technical & Domain Rationale**:
  Matches asset duration to goal horizons to optimize risk-adjusted returns while respecting statutory limits (such as the ₹12,500/month PPF limit).

- **Dual Explanation**:
  - *Technical*: Maps investment vehicles based on asset-liability duration matching principles and statutory caps.
  - *Layman*: Directs short-term goals into safe, liquid options like FDs or liquid funds, while directing long-term goals into higher-return options like equity mutual funds and PPF.

---

### 6.4 Life Stage Determination Engine

- **Primary Code Location**: [`lifeStageEngine.js`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/components/DetailedReport/allocationEngine/lifeStageEngine.js) (`determineLifeStage`)
- **Mathematical Definition**:
  $$\text{LifeStage} = \begin{cases}
  \text{Retirement} & \text{Age}_{\text{Self}} \ge \text{RetirementAge} \\
  \text{Pre-Retirement} & \text{YearsToRetire} \le 5 \\
  \text{Young Professional} & \text{Age}_{\text{Self}} < 35 \land \text{Dependents} == 0 \\
  \text{Young Family} & \text{HasYoungChildren} \lor \text{Age}_{\text{Self}} < 45 \\
  \text{Mature Family} & \text{Otherwise}
  \end{cases}$$

- **Parameters Required**: User age, dependents, child ages, surplus rate, net worth, and EMI ratio.

- **Output Structure**: Life stage classification string and associated risk profile constraints.

- **Technical & Domain Rationale**: Customizes investment risk limits and protection priorities based on demographic life stage.

- **Dual Explanation**:
  - *Technical*: Classifies household demographic stage to establish asset allocation boundaries.
  - *Layman*: Identifies your life stage (e.g., Young Family vs. Pre-Retirement) to tailor safety nets and investment recommendations to your current life situation.

---

### 6.5 Number to INR Words Formatter Engine

- **Primary Code Location**: [`formatInrInWords.js:L1-L60`](file:///c:/5000CR/wealthmap_app/financial_planning_antigravity/apps/web/src/lib/formatInrInWords.js#L1-L60)
- **Mathematical Definition**:
  Decomposes numeric values into Indian numbering scale denominations:
  $$\text{Crores} = \lfloor \text{Amount} / 10^{7} \rfloor, \quad \text{Remainder}_{1} = \text{Amount} \pmod{10^{7}}$$
  $$\text{Lakhs} = \lfloor \text{Remainder}_{1} / 10^{5} \rfloor, \quad \text{Remainder}_{2} = \text{Remainder}_{1} \pmod{10^{5}}$$
  $$\text{Thousands} = \lfloor \text{Remainder}_{2} / 10^{3} \rfloor, \quad \text{Remainder}_{3} = \text{Remainder}_{2} \pmod{10^{3}}$$

- **Parameters Required**: Numeric currency value.

- **Output Structure**: Formatted string in Indian currency notation (e.g., `"Rupees Forty-Five Lakh Sixty Thousand Only"`).

- **Technical & Domain Rationale**: Conforms to Indian banking text formatting standards for financial plans and reports.

- **Dual Explanation**:
  - *Technical*: Decomposes numeric figures into Indian radix units for textual representation.
  - *Layman*: Converts large numbers into clear Indian currency text (Crores, Lakhs, Thousands) for financial reports.

---
*End of Document 1.*
