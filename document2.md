# WealthMap Financial Engine: Layman's Guide & Worked Numerical Examples
> **Document 2 of 2**: Practical Handbook Explaining Every Formula in Simple Language with Step-by-Step Numerical Calculations, Real-World Scenarios, and Edge Cases.

---

## Table of Contents
1. [Introduction to the Financial Engine](#introduction-to-the-financial-engine)
2. [Category 1: Savings, Mutual Funds & Compound Wealth Calculators](#category-1-savings-mutual-funds--compound-wealth-calculators)
   - [Formula 1: SIP (Systematic Investment Plan) Wealth Accumulator](#formula-1-sip-systematic-investment-plan-wealth-accumulator)
   - [Formula 2: One-Time Lumpsum & Stock Portfolio CAGR Growth](#formula-2-one-time-lumpsum--stock-portfolio-cagr-growth)
   - [Formula 3: Bank Fixed Deposit (FD) Compounding Calculator](#formula-3-bank-fixed-deposit-fd-compounding-calculator)
   - [Formula 4: Recurring Deposit (RD) Quarterly Growth](#formula-4-recurring-deposit-rd-quarterly-growth)
   - [Formula 5: Public Provident Fund (PPF) Statutory 15-Year Growth](#formula-5-public-provident-fund-ppf-statutory-15-year-growth)
   - [Formula 6: NPS Retirement Corpus & Monthly Pension Yield](#formula-6-nps-retirement-corpus--monthly-pension-yield)
   - [Formula 7: Systematic Withdrawal Plan (SWP) Monthly Income Engine](#formula-7-systematic-withdrawal-plan-swp-monthly-income-engine)
3. [Category 2: Loans, EMIs & Debt Pay-off Engines](#category-2-loans-emis--debt-pay-off-engines)
   - [Formula 8: Home Loan Daily Rest Interest & Prepayment Saver](#formula-8-home-loan-daily-rest-interest--prepayment-saver)
   - [Formula 9: Car, Personal & Education Loan EMI Amortization](#formula-9-car-personal--education-loan-emi-amortization)
4. [Category 3: Family Protection, Emergency Funds & Net Worth](#category-3-family-protection-emergency-funds--net-worth)
   - [Formula 10: Human Life Value (HLV) Term Insurance Gap Calculator](#formula-10-human-life-value-hlv-term-insurance-gap-calculator)
   - [Formula 11: Emergency Safety Net & Contingency Fund Checker](#formula-11-emergency-safety-net--contingency-fund-checker)
   - [Formula 12: Household Net Worth & Asset Distribution](#formula-12-household-net-worth--asset-distribution)
   - [Formula 13: Monthly Cash Flow, Net Surplus & Financial Health Ratios](#formula-13-monthly-cash-flow-net-surplus--financial-health-ratios)
   - [Formula 14: Age & Years to Retirement Calculator](#formula-14-age--years-to-retirement-calculator)
5. [Category 4: Taxes, Life Goals & Multi-Decade Projections](#category-4-taxes-life-goals--multi-decade-projections)
   - [Formula 15: Indian Income Tax Calculator (FY 2025-26 New Regime)](#formula-15-indian-income-tax-calculator-fy-2025-26-new-regime)
   - [Formula 16: Life Goal Future Inflation Cost Calculator](#formula-16-life-goal-future-inflation-cost-calculator)
   - [Formula 17: Multi-Asset Investment Growth Projection](#formula-17-multi-asset-investment-growth-projection)
   - [Formula 18: Insurance Premium & Risk Cover Timeline Tracker](#formula-18-insurance-premium--coverage-timeline-tracker)
   - [Formula 19: Life Journey Multi-Decade Cash Flow & Bank Balance Simulator](#formula-19-life-journey-multi-decade-cash-flow--bank-balance-simulator)
6. [Category 5: Smart Financial Allocation & Strategy Rules](#category-5-smart-financial-allocation--strategy-rules)
   - [Formula 20: Hygiene-First Protection Waterfall Allocation](#formula-20-hygiene-first-protection-waterfall-allocation)
   - [Formula 21: Monthly Goal Deficit & Target SIP Calculator](#formula-21-monthly-goal-deficit--target-sip-calculator)
   - [Formula 22: Time-Horizon Investment Asset Mapper](#formula-22-time-horizon-investment-asset-mapper)
   - [Formula 23: Life Stage & Household Profile Classifier](#formula-23-life-stage--household-profile-classifier)
   - [Formula 24: Indian Currency Words Formatter](#formula-24-indian-currency-words-formatter)

---

## Introduction to the Financial Engine

The WealthMap Financial Engine powers every calculation in your personal financial plan. It takes your household income, monthly expenses, existing bank balances, mutual funds, loans, and future life goals, and runs them through standard financial algorithms.

This guide explains each calculation step-by-step using plain language and real-world numerical examples, including key edge cases.

---

## Category 1: Savings, Mutual Funds & Compound Wealth Calculators

### Formula 1: SIP (Systematic Investment Plan) Wealth Accumulator

#### What is it and why is it used?
A Systematic Investment Plan (SIP) allows you to invest a fixed amount of money into mutual funds every month. Instead of guessing market highs and lows, SIPs use monthly compounding to build wealth over time. In WealthMap, this engine also handles **annual step-ups** (increasing your monthly SIP as your salary grows) and **automatic goal withdrawals** (withdrawing money when a life goal is reached).

#### How it works in everyday steps:
1. Every month, your monthly SIP amount is added to your existing portfolio balance.
2. The total balance earns one month's worth of expected growth (\(\text{Annual Return} / 12\)).
3. If you scheduled an extra step-up or allocation, your monthly SIP increases.
4. If you have a life goal due that year (like buying a car), the required amount is withdrawn from the portfolio.
5. The remaining balance rolls over to compound in the next month.

---

#### Worked Examples & Edge Cases

##### Case A: Standard Monthly SIP (No Step-Up, No Withdrawal)
- **Inputs**: Monthly SIP = ₹10,000 | Expected Return = 12% p.a. | Current Corpus = ₹0 | Tenure = 2 Years (24 Months)
- **Calculation Steps**:
  - Monthly growth rate = \(12\% / 12 = 1.0\%\) per month (\(0.01\)).
  - **Month 1**: Deposit = ₹10,000. Interest earned = \(₹10,000 \times 0.01 = ₹100\). Closing Balance = ₹10,100.
  - **Month 2**: Opening = ₹10,100. New Deposit = ₹10,000. Balance before interest = ₹20,100. Interest earned = \(₹20,100 \times 0.01 = ₹201\). Closing Balance = ₹20,301.
  - **Month 12 (Year 1 End)**: Accumulated Balance = ₹128,093. Total Invested = ₹120,000. Growth = ₹8,093.
  - **Month 24 (Year 2 End)**: Accumulated Balance = ₹272,432. Total Invested = ₹240,000. Growth = ₹32,432.

##### Case B: Step-Up SIP + Goal Withdrawal (Edge Case)
- **Inputs**: Initial Monthly SIP = ₹10,000 | Annual Return = 12% | Year 1 SIP = ₹10,000/mo | Year 2 SIP increases by ₹2,000/mo (to ₹12,000/mo) | Goal Withdrawal of ₹50,000 in Month 13.
- **Calculation Steps**:
  - **Year 1 (Months 1–12)**: Total invested = ₹120,000. Year 1 Closing Balance = ₹128,093.
  - **Month 13 (Year 2, Month 1)**:
    - Step-up SIP applied: New Monthly SIP = ₹12,000.
    - Balance before deposit = ₹128,093.
    - New Monthly Deposit added = ₹12,000. Total = ₹140,093.
    - Growth for Month 13 (\(1\%\)) = \(₹140,093 \times 0.01 = ₹1,401\). Total before withdrawal = ₹141,494.
    - **Goal Withdrawal Deduction**: \(₹141,494 - ₹50,000 = ₹91,494\).
  - **Months 14–24**: Continues growing at ₹12,000/month on the remaining ₹91,494 balance.
  - **Year 2 Closing Balance**: ₹253,810 (after paying ₹50,000 for the goal).

---

### Formula 2: One-Time Lumpsum & Stock Portfolio CAGR Growth

#### What is it and why is it used?
This formula calculates how a single lump-sum investment or direct stock/ETF portfolio grows over time using Compound Annual Growth Rate (CAGR).

#### How it works in everyday steps:
1. The annual CAGR rate (e.g., 12%) is converted into an exact monthly growth multiplier using the formula \((1 + R/100)^{1/12}\).
2. Each month, any extra lump sums added are added to your balance, and any manual redemptions are subtracted.
3. The remaining balance is multiplied by the monthly growth multiplier.

---

#### Worked Examples & Edge Cases

##### Case A: Simple Lumpsum Investment
- **Inputs**: Initial Investment = ₹100,000 | Expected CAGR = 12% p.a. | Tenure = 3 Years
- **Calculation Steps**:
  - Monthly Multiplier = \((1 + 0.12)^{1/12} = 1.12^{0.08333} = 1.0094888\) (approx 0.9489% per month).
  - **End of Year 1 (12 Months)**: \(₹100,000 \times (1.0094888)^{12} = ₹100,000 \times 1.1200 = ₹112,000\).
  - **End of Year 2 (24 Months)**: \(₹112,000 \times 1.12 = ₹125,440\).
  - **End of Year 3 (36 Months)**: \(₹125,440 \times 1.12 = ₹140,493\).
  - **Total Wealth Created**: ₹40,493.

##### Case B: Lumpsum Investment with Additional Inflow in Year 2
- **Inputs**: Initial Principal = ₹100,000 | Expected CAGR = 10% | Additional Lumpsum = ₹50,000 in Month 13 (Start of Year 2).
- **Calculation Steps**:
  - Year 1 Closing Balance (10% CAGR) = \(₹100,000 \times 1.10 = ₹110,000\).
  - Month 13 Addition: New Balance = \(₹110,000 + ₹50,000 = ₹160,000\).
  - Year 2 Closing Balance: \(₹160,000 \times 1.10 = ₹176,000\).

---

### Formula 3: Bank Fixed Deposit (FD) Compounding Calculator

#### What is it and why is it used?
Fixed Deposits (FDs) offer guaranteed returns. Indian commercial banks calculate interest monthly but compound it quarterly. WealthMap allows flexible compounding options (Monthly, Quarterly, Half-Yearly, Annually).

#### How it works in everyday steps:
1. Every month, interest is calculated on your current principal balance.
2. The interest accumulates in an uncompounded interest bucket.
3. When the compounding period arrives (e.g., every 3 months for Quarterly), the accumulated interest is added to your main principal balance.
4. Future interest is then earned on this higher balance.

---

#### Worked Examples & Edge Cases

##### Case A: Standard Quarterly Compounding (Indian Banking Rule)
- **Inputs**: Principal = ₹100,000 | Interest Rate = 8.00% p.a. | Compounding = Quarterly | Tenure = 1 Year (12 Months)
- **Calculation Steps**:
  - Monthly interest rate = \(8.00\% / 12 = 0.6667\%\) (\(0.006667\)).
  - **Month 1**: Interest = \(₹100,000 \times 0.006667 = ₹666.67\). Uncompounded Interest = ₹666.67. Principal = ₹100,000.
  - **Month 2**: Interest = \(₹100,000 \times 0.006667 = ₹666.67\). Uncompounded Interest = ₹1,333.33. Principal = ₹100,000.
  - **Month 3 (Quarter 1 End)**: Interest = ₹666.67. Total uncompounded interest = ₹2,000.
    - **Quarterly Compounding Event**: Interest of ₹2,000 is added to Principal.
    - New Principal for Quarter 2 = ₹102,000. Uncompounded Interest reset to ₹0.
  - **Month 4–6 (Quarter 2)**: Monthly interest on ₹102,000 = ₹680. Quarter 2 End Principal = \(₹102,000 + (3 \times ₹680) = ₹104,040\).
  - **Month 7–9 (Quarter 3)**: Quarter 3 End Principal = \(₹104,040 \times 1.02 = ₹106,120.80\).
  - **Month 10–12 (Quarter 4)**: Quarter 4 End Maturity Value = \(₹106,120.80 \times 1.02 = ₹108,243.22\).
  - **Total Interest Earned**: ₹8,243.22 (versus ₹8,000 under simple interest).

---

### Formula 4: Recurring Deposit (RD) Quarterly Growth

#### What is it and why is it used?
A Recurring Deposit (RD) is a savings option where you deposit a fixed sum every month, and interest compounds quarterly (per Indian Post Office and bank regulations).

#### How it works in everyday steps:
1. On the 1st of each month, your monthly installment is added to the principal balance.
2. Interest is calculated for that month on the updated balance.
3. Every 3 months, accrued interest is compounded into the principal balance.

---

#### Worked Example
- **Inputs**: Monthly Deposit = ₹5,000 | Interest Rate = 7.00% p.a. | Tenure = 1 Year (12 Months)
- **Calculation Steps**:
  - Monthly Rate = \(7.00\% / 12 = 0.5833\%\).
  - **Month 1**: Deposit ₹5,000. Interest = \(₹5,000 \times 0.005833 = ₹29.17\).
  - **Month 2**: Deposit ₹5,000. Total Principal = ₹10,000. Interest = \(₹10,000 \times 0.005833 = ₹58.33\). Cumulative interest = ₹87.50.
  - **Month 3 (Quarter 1 End)**: Deposit ₹5,000. Total Principal = ₹15,000. Interest = \(₹15,000 \times 0.005833 = ₹87.50\). Cumulative interest = ₹175.00.
    - **Quarterly Compounding**: ₹175.00 added to Principal. New Base = ₹15,175.00.
  - **Months 4–12**: Process continues through 4 quarters.
  - **Maturity Value at Month 12**: ₹62,307 (Total Deposited = ₹60,000, Total Interest = ₹2,307).

---

### Formula 5: Public Provident Fund (PPF) Statutory 15-Year Growth

#### What is it and why is it used?
Public Provident Fund (PPF) is a government-backed, tax-free (EEE) savings scheme with a mandatory **15-year lock-in** and a **statutory annual deposit cap of ₹1,50,000**.

#### How it works in everyday steps:
1. Your monthly PPF contributions are summed up for the financial year.
2. If your annual deposits exceed ₹150,000, the extra amount is capped at ₹150,000.
3. Interest is calculated annually on (Opening Balance + Capped Annual Deposit).
4. The annual interest is added to your account at fiscal year-end (March 31st).

---

#### Worked Example
- **Inputs**: Monthly Deposit = ₹15,000 (Annual Total = ₹180,000) | Prescribed Rate = 7.10% p.a. | Opening Balance = ₹0
- **Calculation Steps**:
  - **Year 1**:
    - Gross Monthly Deposits = \(12 \times ₹15,000 = ₹180,000\).
    - **Statutory Cap Applied**: Max allowed deposit = ₹150,000 (Excess ₹30,000 rejected per rules).
    - Interest calculated = \((₹0 + ₹150,000) \times 7.10\% = ₹10,650\).
    - Year 1 Closing Balance = \(₹150,000 + ₹10,650 = ₹160,650\).
  - **Year 2**:
    - Opening Balance = ₹160,650. Capped Deposit = ₹150,000. Base = ₹310,650.
    - Interest calculated = \(₹310,650 \times 7.10\% = ₹22,056.15\).
    - Year 2 Closing Balance = \(₹310,650 + ₹22,056.15 = ₹332,706.15\).
  - **Year 15 (Maturity)**: Total Deposited = ₹2,250,000. Total Tax-Free Maturity Value = ₹4,092,530.

---

### Formula 6: NPS Retirement Corpus & Monthly Pension Yield

#### What is it and why is it used?
The National Pension System (NPS) is a retirement scheme regulated by PFRDA. Upon reaching retirement age (typically 60), rules require:
- At least **40% of the corpus must purchase an annuity** (to provide a lifelong monthly pension).
- Up to **60% can be withdrawn as a tax-free lump sum**.

#### How it works in everyday steps:
1. Your NPS investments compound monthly until your retirement year.
2. At retirement, your total corpus is divided based on your chosen annuity percentage (minimum 40%).
3. The lump-sum portion is paid out immediately as cash, and the annuity portion generates a regular monthly pension based on the prevailing annuity rate.

---

#### Worked Example
- **Inputs**: Retirement Corpus at Age 60 = ₹10,000,000 (₹1 Crore) | Annuity Selection = 40% | Expected Annuity Yield = 6.00% p.a.
- **Calculation Steps**:
  - **Annuity Purchase Amount**: \(₹10,000,000 \times 40\% = ₹4,000,000\) (₹40 Lakhs).
  - **Tax-Free Lump Sum Cash Payout**: \(₹10,000,000 - ₹4,000,000 = ₹6,000,000\) (₹60 Lakhs).
  - **Annual Pension Generated**: \(₹4,000,000 \times 6.00\% = ₹240,000\) per year.
  - **Lifelong Monthly Pension**: \(₹240,000 / 12 = ₹20,000\) per month.

---

### Formula 7: Systematic Withdrawal Plan (SWP) Monthly Income Engine

#### What is it and why is it used?
An SWP lets you withdraw a fixed monthly income from a mutual fund corpus during retirement. The remaining balance stays invested and continues to grow.

#### How it works in everyday steps:
1. On the 1st of the month, your specified monthly income is withdrawn from your balance.
2. The remaining balance grows over the rest of the month based on your expected return.
3. Every year, your monthly withdrawal can step up by an inflation percentage (e.g., 5%).

---

#### Worked Example
- **Inputs**: Initial Mutual Fund Corpus = ₹5,000,000 (₹50 Lakhs) | Initial Monthly Withdrawal = ₹30,000 | Annual Growth Rate = 10% | Annual Withdrawal Step-Up = 5%
- **Calculation Steps**:
  - Monthly growth rate = \(10\% / 12 = 0.8333\%\).
  - **Month 1**:
    - Balance before withdrawal = ₹5,000,000.
    - Withdrawal = ₹30,000. Remaining balance = ₹4,970,000.
    - Interest earned = \(₹4,970,000 \times 0.008333 = ₹41,416.67\).
    - Closing Balance Month 1 = \(₹4,970,000 + ₹41,416.67 = ₹5,011,416.67\) (Corpus grew despite withdrawal!).
  - **Year 2 (Month 13)**: Monthly withdrawal steps up by 5% \(\to ₹30,000 \times 1.05 = ₹31,500\)/month.

---

## Category 2: Loans, EMIs & Debt Pay-off Engines

### Formula 8: Home Loan Daily Rest Interest & Prepayment Saver

#### What is it and why is it used?
Indian home loans use **Daily Rest Interest Amortization**. Interest is calculated on the exact balance remaining each day. Making part-prepayments immediately reduces your principal balance, saving significant interest over the life of the loan.

#### How it works in everyday steps:
1. The engine calculates a daily interest rate: \(\text{Annual Rate} / \text{Days in Year}\) (365 days, or 366 days in leap years).
2. If you make a prepayment, it immediately reduces your principal balance.
3. Interest for each month is computed by multiplying the daily principal by the daily interest rate for the exact number of days in that month.
4. Your monthly EMI pays off the monthly interest first, and the remaining amount reduces your loan principal.

---

#### Worked Examples & Edge Cases

##### Case A: Standard Home Loan (No Prepayment)
- **Inputs**: Loan Amount = ₹5,000,000 (₹50 Lakhs) | Rate = 8.50% p.a. | Tenure = 20 Years (240 Months) | Year = 2026 (365 days)
- **Calculation Steps**:
  - Monthly EMI (Standard Reducing Balance) = **₹43,391**.
  - Daily Rate in 2026 = \(8.50\% / 365 = 0.0232877\%\) per day.
  - **January (31 Days)**: Interest = \(₹5,000,000 \times (0.085 / 365) \times 31 = ₹36,095.89\).
    - Principal Portion = \(₹43,391 - ₹36,095.89 = ₹7,295.11\).
    - Principal remaining = \(₹5,000,000 - ₹7,295.11 = ₹4,992,704.89\).
  - **February (28 Days)**: Interest = \(₹4,992,704.89 \times (0.085 / 365) \times 28 = ₹32,568.10\).
    - Principal Portion = \(₹43,391 - ₹32,568.10 = ₹10,822.90\).
    - Principal remaining = ₹4,981,881.99.

##### Case B: Home Loan with ₹5 Lakh Prepayment in Month 12 (Edge Case)
- **Inputs**: Same loan as Case A, plus a lump-sum prepayment of ₹500,000 in Month 12.
- **Calculation Steps**:
  - By Month 11, Principal balance = ₹4,895,000.
  - **Month 12 Prepayment**: Extra payment of ₹500,000 applied.
  - New Principal balance = \(₹4,895,000 - ₹500,000 = ₹4,395,000\).
  - **Month 13 Interest**: Calculated on ₹4,395,000 instead of ₹4,895,000.
    - Monthly interest drops from ₹34,670 down to ₹31,130.
  - **Impact**: Loan tenure is shortened by **4.2 years**, saving over **₹1,450,000** in total interest.

##### Case C: Interest Rate Hike from 8.5% to 9.5% in Year 3 (Edge Case)
- **Inputs**: Rate increases to 9.50% at Month 25.
- **Calculation Steps**:
  - Daily Rate increases to \(9.50\% / 365 = 0.026027\%\) per day.
  - Monthly interest rises automatically. If EMI remains fixed at ₹43,391, less money goes toward principal repayment, extending total loan tenure.

---

### Formula 9: Car, Personal & Education Loan EMI Amortization

#### What is it and why is it used?
Calculates monthly EMIs for fixed-tenure loans (Car, Personal, Education, Two-Wheeler) using standard monthly reducing balance amortization.

#### How it works in everyday steps:
1. Calculates monthly interest rate \( r = \text{Annual Rate} / 1200 \).
2. Calculates fixed EMI using:
   $$\text{EMI} = \frac{P \times r \times (1+r)^n}{(1+r)^n - 1}$$
3. Each month, interest on the outstanding principal is paid first, and the rest goes toward reducing your loan balance.

---

#### Worked Example
- **Inputs**: Car Loan = ₹800,000 | Interest Rate = 9.50% p.a. | Tenure = 5 Years (60 Months)
- **Calculation Steps**:
  - Monthly Rate \( r = 9.50 / 1200 = 0.0079167 \).
  - \( (1 + 0.0079167)^{60} = 1.60501 \).
  - \(\text{EMI} = \frac{800,000 \times 0.0079167 \times 1.60501}{1.60501 - 1} = \frac{10,165.04}{0.60501} = \mathbf{₹16,801}\) per month.
  - **Month 1 Breakdown**:
    - Interest Paid = \(₹800,000 \times 0.0079167 = ₹6,333\).
    - Principal Paid = \(₹16,801 - ₹6,333 = ₹10,468\).
    - Balance Remaining = \(₹800,000 - ₹10,468 = ₹789,532\).
  - **Total Repayment over 5 years**: \(₹16,801 \times 60 = ₹1,008,060\) (Principal = ₹800,000, Total Interest = ₹208,060).

---

## Category 3: Family Protection, Emergency Funds & Net Worth

### Formula 10: Human Life Value (HLV) Term Insurance Gap Calculator

#### What is it and why is it used?
Calculates how much Term Life Insurance cover you need to ensure your family remains financially secure if the primary breadwinner passes away.

#### How it works in everyday steps:
1. Calculates continuing household living costs and monthly loan EMIs.
2. Subtracts any monthly income earned by a surviving working spouse.
3. Multiplies the remaining monthly shortfall by an age-based Income Multiple:
   - **Age 18–35**: 25x Annual Shortfall
   - **Age 36–45**: 20x Annual Shortfall
   - **Age 46–50**: 15x Annual Shortfall
   - **Age 51–60**: 10x Annual Shortfall
   - **Age 61+**: 5x Annual Shortfall
4. Adds non-EMI liabilities (credit card dues, personal debts).
5. Subtracts existing life insurance cover and liquid savings.
6. The result is your net **Protection Gap**.

---

#### Worked Examples & Edge Cases

##### Case A: Single Earning Member (Working Husband, Homemaker Wife)
- **Inputs**: Husband Age = 32 | Monthly Household Expenses = ₹60,000 | Monthly Loan EMIs = ₹40,000 | Wife Income = ₹0 | Credit Card Dues = ₹100,000 | Existing Term Cover = ₹5,000,000 (₹50L) | Savings & Mutual Funds = ₹1,000,000 (₹10L)
- **Calculation Steps**:
  - Continuing Monthly Expenses = \(₹60,000 + ₹40,000 = ₹100,000\)/month.
  - Surviving Spouse Monthly Income Offset = ₹0.
  - Monthly Shortfall = ₹100,000. Annual Shortfall = \(₹100,000 \times 12 = ₹1,200,000\).
  - Age Multiple for Age 32 = **25x**.
  - Human Life Value (HLV) Need = \(₹1,200,000 \times 25 = ₹30,000,000\) (₹3 Crores).
  - Gross Need = \(\text{HLV Need} + \text{Non-EMI Debt} = ₹30,000,000 + ₹100,000 = ₹30,100,000\).
  - Total Existing Assets & Cover = \(₹5,000,000 + ₹1,000,000 = ₹6,000,000\).
  - **Net Protection Gap**: \(₹30,100,000 - ₹6,000,000 = \mathbf{₹24,100,000}\) (₹2.41 Crores additional term cover needed).

##### Case B: Dual Income Household (Working Spouse Offset) (Edge Case)
- **Inputs**: Husband Age = 38 (Multiple = 20x) | Continuing Expenses = ₹100,000/month | Wife Monthly Income = ₹60,000/month | Debts = ₹0 | Husband Existing Life Cover = ₹10,000,000 | Liquid Assets = ₹2,000,000
- **Calculation Steps**:
  - Monthly Shortfall = \(₹100,000 - ₹60,000 = ₹40,000\)/month (Wife's income reduces the family's dependency shortfall!).
  - Annual Shortfall = \(₹40,000 \times 12 = ₹480,000\).
  - HLV Need (20x Multiple) = \(₹480,000 \times 20 = ₹9,600,000\) (₹96 Lakhs).
  - Total Existing Assets & Cover = \(₹10,000,000 + ₹2,000,000 = ₹12,000,000\).
  - **Net Protection Gap**: \(₹9,600,000 - ₹12,000,000 = \mathbf{₹0}\) (No gap! Existing cover is fully adequate).

---

### Formula 11: Emergency Safety Net & Contingency Fund Checker

#### What is it and why is it used?
Calculates your mandatory 6-month financial emergency safety net.

#### How it works in everyday steps:
$$\text{Required Emergency Fund} = (\text{Monthly Household Expenses} + \text{Monthly Loan EMIs}) \times 6$$
$$\text{Shortfall} = \max(0, \text{Required Emergency Fund} - \text{Current Bank Savings \& Cash})$$

---

#### Worked Example
- **Inputs**: Monthly Household Expenses = ₹50,000 | Monthly Loan EMIs = ₹30,000 | Available Savings Account & Cash = ₹200,000
- **Calculation Steps**:
  - Monthly Outflow = \(₹50,000 + ₹30,000 = ₹80,000\).
  - 6-Month Emergency Requirement = \(₹80,000 \times 6 = ₹480,000\).
  - Current Available Funds = ₹200,000.
  - **Emergency Gap / Shortfall**: \(₹480,000 - ₹200,000 = \mathbf{₹280,000}\) (Needs to be funded urgently).

---

### Formula 12: Household Net Worth & Asset Distribution

#### What is it and why is it used?
Calculates your total household Net Worth and shows the percentage distribution across different asset classes.

#### How it works in everyday steps:
1. Sums all asset values (Real estate, vehicles, gold, bank savings, mutual funds, stocks, PPF, EPF, NPS).
2. Sums all outstanding liabilities (Home loan, car loan, personal loan, credit card dues).
3. Subtracts liabilities from assets to get Net Worth.

---

#### Worked Example
- **Inputs**:
  - Real Estate: ₹8,000,000 | Mutual Funds & Stocks: ₹2,000,000 | Bank Cash: ₹500,000 | EPF & PPF: ₹1,500,000 | Gold: ₹500,000
  - Outstanding Home Loan: ₹4,000,000 | Credit Card Payable: ₹50,000
- **Calculation Steps**:
  - **Total Assets**: \(₹8,000,000 + ₹2,000,000 + ₹500,000 + ₹1,500,000 + ₹500,000 = ₹12,500,000\) (₹1.25 Crores).
  - **Total Liabilities**: \(₹4,000,000 + ₹50,000 = ₹4,050,000\) (₹40.5 Lakhs).
  - **Net Worth**: \(₹12,500,000 - ₹4,050,000 = \mathbf{₹8,450,000}\) (₹84.5 Lakhs).
  - **Asset Allocation %**:
    - Real Estate = \(8,000,000 / 12,500,000 = 64.0\%\)
    - Investments (MF/Stocks) = \(2,000,000 / 12,500,000 = 16.0\%\)
    - Retirement (EPF/PPF) = \(1,500,000 / 12,500,000 = 12.0\%\)
    - Liquid Cash & Gold = \(1,000,000 / 12,500,000 = 8.0\%\).

---

### Formula 13: Monthly Cash Flow, Net Surplus & Financial Health Ratios

#### What is it and why is it used?
Analyzes monthly cash inflows versus expenses and calculates key financial health ratios.

#### How it works in everyday steps:
1. Net Income = Sum of take-home salaries, business profits, pension, rental & passive income.
2. Expenses = Household living costs + Loan EMIs + Insurance premiums.
3. Surplus = Income - Expenses.
4. Surplus Rate % = \( (\text{Surplus} / \text{Net Income}) \times 100 \).
5. **Health Benchmark**: Surplus Rate \(\ge 20\%\) is Healthy; Surplus Rate \(< 0\%\) is Critical.

---

#### Worked Example
- **Inputs**: Monthly Take-Home Income = ₹150,000 | Household Expenses = ₹60,000 | Loan EMIs = ₹35,000 | Insurance Premiums = ₹5,000 | Monthly SIPs = ₹30,000
- **Calculation Steps**:
  - Total Essential Expenses = \(₹60,000 + ₹35,000 + ₹5,000 = ₹100,000\).
  - **Monthly Cash Surplus**: \(₹150,000 - ₹100,000 = ₹50,000\).
  - **Surplus Rate %**: \((₹50,000 / ₹150,000) \times 100 = \mathbf{33.33\%}\) (**Healthy**, exceeds 20% target).
  - **EMI Ratio %**: \((₹35,000 / ₹150,000) \times 100 = \mathbf{23.33\%}\) (Safe, below 40% threshold).
  - **Free Disposable Income**: \(\text{Surplus} - \text{SIPs} = ₹50,000 - ₹30,000 = \mathbf{₹20,000}\)/month available for new goals.

---

### Formula 14: Age & Years to Retirement Calculator

#### What is it and why is it used?
Calculates your exact age today and how many working years remain until your target retirement age.

#### How it works in everyday steps:
$$\text{Age} = \text{Current Year} - \text{Birth Year} \quad (\text{adjusted if birthday has not passed this year})$$
$$\text{Years To Retirement} = \max(0, \text{Retirement Age} - \text{Age})$$

---

#### Worked Example
- **Inputs**: Date of Birth = 15-Nov-1990 | Current Date = 05-Sep-2026 | Target Retirement Age = 60
- **Calculation Steps**:
  - Year difference = \(2026 - 1990 = 36\).
  - Month/Day Check: September comes before November, so birthday has not passed yet in 2026.
  - **Exact Age**: \(36 - 1 = \mathbf{35 \text{ years old}}\).
  - **Years to Retirement**: \(60 - 35 = \mathbf{25 \text{ working years remaining}}\).

---

## Category 4: Taxes, Life Goals & Multi-Decade Projections

### Formula 15: Indian Income Tax Calculator (FY 2025-26 New Regime)

#### What is it and why is it used?
Calculates your annual income tax liability under the **FY 2025-26 New Tax Regime**, applying the revised 7-tier tax slabs, ₹75,000 standard deduction, Section 87A rebate, marginal relief, surcharge, and 4% cess.

#### How it works in everyday steps:
1. Subtracts ₹75,000 Standard Deduction from salaried/pension gross income.
2. Applies income tax across 7 slabs (0%, 5%, 10%, 15%, 20%, 25%, 30%).
3. **Section 87A Rebate**: If taxable income \(\le\) ₹12.00 Lakhs, tax is reduced by up to ₹60,000 (making tax **₹0**).
4. **Section 87A Marginal Relief**: If taxable income is slightly above ₹12.00 Lakhs, your tax is capped so it never exceeds the income earned above ₹12 Lakhs.
5. Adds Surcharge (for high earners above ₹50L) and 4% Health & Education Cess.

---

#### Worked Examples & Edge Cases

##### Case A: Gross Income ₹12.75 Lakhs (Zero Tax via Section 87A Rebate)
- **Inputs**: Gross Salaried Income = ₹1,275,000
- **Calculation Steps**:
  - Standard Deduction = ₹75,000.
  - Taxable Income = \(₹1,275,000 - ₹75,000 = ₹1,200,000\) (₹12.00 Lakhs).
  - **Slab Tax Breakdown**:
    - ₹0 to ₹4L @ 0% = ₹0
    - ₹4L to ₹8L (₹4L @ 5%) = ₹20,000
    - ₹8L to ₹12L (₹4L @ 10%) = ₹40,000
    - Total Slab Tax = \(₹20,000 + ₹40,000 = ₹60,000\).
  - **Section 87A Rebate**: Taxable Income is \(\le ₹12L\), so rebate of ₹60,000 applies.
  - Net Tax Payable = \(₹60,000 - ₹60,000 = \mathbf{₹0}\) (**Zero Tax!**).

##### Case B: Gross Income ₹13.00 Lakhs (Section 87A Marginal Relief) (Edge Case)
- **Inputs**: Gross Salaried Income = ₹1,300,000 \(\to\) Taxable Income = ₹1,225,000 (₹25,000 over ₹12L threshold).
- **Calculation Steps**:
  - **Slab Tax Breakdown**:
    - First ₹12L tax = ₹60,000.
    - ₹12L to ₹12.25L (₹25,000 @ 15%) = ₹3,750.
    - Total Normal Slab Tax = \(₹60,000 + ₹3,750 = ₹63,750\).
  - **Marginal Relief Check**:
    - Income above ₹12L = \(₹1,225,000 - ₹1,200,000 = ₹25,000\).
    - Without relief, tax would jump from ₹0 (at ₹12L) to ₹63,750 for earning just ₹25,000 more!
    - **Marginal Relief Amount** = \(\text{Normal Tax} - \text{Excess Income} = ₹63,750 - ₹25,000 = ₹38,750\).
    - Tax after Marginal Relief = \(\text{Excess Income} = ₹25,000\).
  - Cess @ 4% = \(₹25,000 \times 0.04 = ₹1,000\).
  - **Final Tax Payable**: \(₹25,000 + ₹1,000 = \mathbf{₹26,000}\).

##### Case C: High Income ₹60.75 Lakhs (Surcharge & Surcharge Marginal Relief) (Edge Case)
- **Inputs**: Taxable Income = ₹6,000,000 (₹60 Lakhs, which is ₹10L above the ₹50L surcharge threshold).
- **Calculation Steps**:
  - Normal Slab Tax = ₹1,380,000.
  - Surcharge @ 10% = ₹138,000.
  - Total Tax + Surcharge = ₹1,518,000.
  - Cess @ 4% = ₹60,720.
  - **Final Tax Payable** = **₹1,578,720**.

---

### Formula 16: Life Goal Future Inflation Cost Calculator

#### What is it and why is it used?
Calculates how much a future goal (like college education or buying a home) will cost when you reach the target year, accounting for inflation.

#### How it works in everyday steps:
$$\text{Future Cost} = \text{Today's Cost} \times \left(1 + \frac{\text{Inflation Rate}}{100}\right)^{\text{Years To Goal}}$$

---

#### Worked Example
- **Inputs**: Child Higher Education Cost Today = ₹2,000,000 (₹20 Lakhs) | Years to Goal = 10 Years | Education Inflation = 8.00% p.a.
- **Calculation Steps**:
  - Inflation Multiplier = \((1 + 0.08)^{10} = (1.08)^{10} = 2.158925\).
  - **Future Inflated Cost in 10 Years**: \(₹2,000,000 \times 2.158925 = \mathbf{₹4,317,850}\) (₹43.18 Lakhs).

---

### Formula 17: Multi-Asset Investment Growth Projection

#### What is it and why is it used?
Projects how your total investment portfolio grows year by year until retirement, applying different return rates to different asset classes.

#### How it works in everyday steps:
1. Each asset class grows at its specific return rate (Stocks/Equity MF 12%, Gold 8%, Real Estate 6%, PPF 7.1%, FDs 6%).
2. Annual deposits from your monthly savings are added to the corresponding assets.
3. When a life goal matures that year, the required funds are deducted from the portfolio.

---

#### Worked Example
- **Inputs**: Starting Portfolio = ₹1,000,000 (Equity MF @ 12%) | Annual SIP Added = ₹120,000 | Goal Redemption in Year 2 = ₹200,000
- **Calculation Steps**:
  - **Year 1**:
    - Opening = ₹1,000,000. Growth (12%) = ₹120,000.
    - New Annual SIP Added = ₹120,000.
    - Year 1 Closing Balance = \(₹1,000,000 + ₹120,000 + ₹120,000 = ₹1,240,000\).
  - **Year 2**:
    - Opening = ₹1,240,000. Growth (12%) = \(₹1,240,000 \times 0.12 = ₹148,800\).
    - New Annual SIP Added = ₹120,000.
    - Subtotal = \(₹1,240,000 + ₹148,800 + ₹120,000 = ₹1,508,800\).
    - **Goal Withdrawal Deducted**: \(₹1,508,800 - ₹200,000 = \mathbf{₹1,308,800}\).

---

### Formula 18: Insurance Premium & Coverage Timeline Tracker

#### What is it and why is it used?
Tracks your yearly insurance premium obligations, total active life cover, and maturity payouts over time.

#### How it works in everyday steps:
- Converts all premium payment frequencies (Monthly, Quarterly, Half-Yearly, Annually) into annual totals.
- Maps premiums only during active payment years, while tracking risk cover across the full policy duration.

---

#### Worked Example
- **Inputs**: Policy = Term Insurance | Annual Premium = ₹25,000 | Payment Term = 10 Years | Policy Term = 30 Years | Sum Assured = ₹10,000,000 (₹1 Crore)
- **Calculation Steps**:
  - **Years 1 to 10**: Annual Premium Outflow = ₹25,000/year. Active Life Cover = ₹1 Crore.
  - **Years 11 to 30**: Annual Premium Outflow = **₹0** (payment term completed). Active Life Cover remains **₹1 Crore**.

---

### Formula 19: Life Journey Multi-Decade Cash Flow & Bank Balance Simulator

#### What is it and why is it used?
Simulates your complete household finances year by year until retirement. It increases your income with salary hikes, inflates living costs, tracks loan pay-offs, and validates month-by-month cash flows to warn you of potential bank balance shortfalls.

#### How it works in everyday steps:
1. **Annual Inflow**: Grows salary by your expected annual hike % (e.g., 10%).
2. **Tax Deduction**: Applies projected income tax under the new regime.
3. **Outflows**: Inflates household expenses, adds active loan EMIs, adds school/college fee progressions, and includes planned major expenses.
4. **Surplus**: Income minus taxes and total outflows.
5. **Month-by-Month Validation**: Checks your running cash balance across all 12 months to detect temporary cash deficits.

---

#### Worked Examples & Edge Cases

##### Case A: Normal Surplus Year
- **Inputs**: Annual Net Income = ₹1,800,000 | Household Expenses = ₹720,000 | Loan EMIs = ₹360,000 | Insurance & Savings = ₹360,000 | No major one-time expenses
- **Calculation Steps**:
  - Total Outflows = \(₹720,000 + ₹360,000 + ₹360,000 = ₹1,440,000\).
  - Annual Net Investible Surplus = \(₹1,800,000 - ₹1,440,000 = \mathbf{+₹360,000}\) (Positive cash flow of ₹30,000/month).

##### Case B: Deficit Year due to Simultaneous Major Expenses (Edge Case)
- **Inputs**: Annual Income = ₹1,800,000 | Regular Outflows = ₹1,440,000 | Year 5 Special Events: College Admission Fee (₹300,000 in April) + Car Downpayment (₹200,000 in April)
- **Calculation Steps**:
  - Regular Monthly Surplus = \(₹30,000\)/month.
  - By March (Month 3), Accumulated Surplus = \(3 \times ₹30,000 = ₹90,000\).
  - **April (Month 4) Lump-Sum Outflow**: \(₹300,000 + ₹200,000 = ₹500,000\).
  - April Cash Position = \(₹90,000 + ₹30,000 (\text{April Surplus}) - ₹500,000 = \mathbf{-₹380,000}\).
  - **Engine Alert**: Flags a **Temporary Cash Deficit in Month 4 (April)**, warning you to arrange a short-term liquid reserve or redeem an investment ahead of time.

---

## Category 5: Smart Financial Allocation & Strategy Rules

### Formula 20: Hygiene-First Protection Waterfall Allocation

#### What is it and why is it used?
Ensures that your monthly cash surplus is allocated to essential safety nets before funding discretionary wealth goals.

#### How it works in everyday steps:
1. Takes your monthly investible surplus.
2. Allocates fixed target percentages to Term Insurance (e.g., 15%), Health Insurance (e.g., 10%), and Emergency Fund (e.g., 15%).
3. Each safety net allocation is capped at its actual required amount.
4. Any unused budget automatically spills over to fund your wealth goals.

---

#### Worked Example
- **Inputs**: Monthly Investible Surplus = ₹40,000 | Term Need = ₹2,000/mo | Health Need = ₹1,500/mo | Emergency Gap = ₹0 (Target met)
- **Calculation Steps**:
  - **Term Budget (15%)**: \(₹40,000 \times 15\% = ₹6,000\). Capped at actual premium of **₹2,000**. Unused = ₹4,000.
  - **Health Budget (10%)**: \(₹40,000 \times 10\% = ₹4,000\). Capped at actual premium of **₹1,500**. Unused = ₹2,500.
  - **Emergency Budget (15%)**: Target already met \(\to\) Allocated = **₹0**. Unused = ₹6,000.
  - Total Safety Nets Funded = \(₹2,000 + ₹1,500 = ₹3,500\).
  - **Remaining Cash for Wealth Goals**: \(₹40,000 - ₹3,500 = \mathbf{₹36,500}\) per month (100% of unused safety net budgets roll over to your goals!).

---

### Formula 21: Monthly Goal Deficit & Target SIP Calculator

#### What is it and why is it used?
Calculates the exact monthly SIP required to bridge the gap for a specific life goal.

#### How it works in everyday steps:
Uses an **annuity-due formula** (investments made at the beginning of each month) to calculate the monthly contribution needed to build your target corpus over the remaining time horizon.

$$\text{Required Monthly SIP} = \frac{\text{Corpus Gap}}{\left[\frac{(1 + r)^N - 1}{r}\right] \times (1 + r)}$$

---

#### Worked Example
- **Inputs**: Goal = Child College Fund | Target Inflated Corpus = ₹2,500,000 (₹25 Lakhs) | Existing Allocated Mutual Funds = ₹500,000 | Time Remaining = 7 Years (84 Months) | Expected Return = 12% p.a.
- **Calculation Steps**:
  - Existing ₹5L growth in 7 years @ 12% = \(₹500,000 \times (1.12)^7 = ₹1,105,476\).
  - Remaining Corpus Gap = \(₹2,500,000 - ₹1,105,476 = ₹1,394,524\).
  - Monthly rate \( r = 0.01 \), Months \( N = 84 \).
  - Annuity factor = \(\left[\frac{(1.01)^{84} - 1}{0.01}\right] \times 1.01 = \left[\frac{2.30672 - 1}{0.01}\right] \times 1.01 = 130.672 \times 1.01 = 131.979\).
  - **Required Monthly SIP**: \(₹1,394,524 / 131.979 = \mathbf{₹10,566}\) per month.

---

### Formula 22: Time-Horizon Investment Asset Mapper

#### What is it and why is it used?
Matches your goal time horizons with the appropriate investment vehicles to balance safety and growth.

#### How it works in everyday steps:
- **Short-Term (\(\le 3\) Years)**: Allocated to low-risk, capital-preservation assets (FDs, RDs, Liquid & Arbitrage Funds).
- **Medium-Term (3 to 7 Years)**: Allocated to balanced growth assets (Aggressive Hybrid & Equity Savings Funds).
- **Long-Term (\(> 7\) Years)**: Allocated to high-growth wealth assets (Equity Mutual Funds, Stocks, PPF, NPS).

---

#### Worked Example
- **Scenario A (Vacation in 2 Years)**: Horizon = 2 Years (\(\le 3\) yrs) \(\to\) Directed to **Fixed Deposit / Recurring Deposit / Arbitrage Fund**.
- **Scenario B (Child Education in 12 Years)**: Horizon = 12 Years (\(> 7\) yrs) \(\to\) Directed to **Equity Mutual Funds (SIP) & PPF** (capped at ₹12,500/month).

---

### Formula 23: Life Stage & Household Profile Classifier

#### What is it and why is it used?
Categorizes your household into a demographic life stage to set appropriate investment risk guidelines and protection priorities.

#### How it works in everyday steps:
Checks your age, dependents, and years to retirement:
- **Young Professional**: Single/Married under 35 with no children.
- **Young Family**: Earning parents with school-going children.
- **Mature Family**: Earning parents with college-going children.
- **Pre-Retirement**: Within 5 years of retirement age.
- **Retirement**: At or past retirement age.

---

#### Worked Example
- **Inputs**: User Age = 38 | Spouse Age = 36 | Child Age = 7 (Primary School) | Retirement Age = 60
- **Classification**: **Young Family**.
- **Engine Priority**: Focuses on Term Life Cover, Health Insurance, Emergency Buffer, and Long-Term Child Education & Retirement SIPs.

---

### Formula 24: Indian Currency Words Formatter

#### What is it and why is it used?
Converts large numeric values into clear Indian currency text (Crores, Lakhs, Thousands) for official plan documentation.

#### How it works in everyday steps:
Divides numbers using the Indian numbering system scale:
- 1 Crore = 10,000,000 (10 Million)
- 1 Lakh = 100,000 (100 Thousand)

---

#### Worked Example
- **Numeric Input**: `12560500`
- **Calculation Steps**:
  - Crores = \(\lfloor 12,560,500 / 10,000,000 \rfloor = 1\) (Remainder = 2,560,500).
  - Lakhs = \(\lfloor 2,560,500 / 100,000 \rfloor = 25\) (Remainder = 60,500).
  - Thousands = \(\lfloor 60,500 / 1,000 \rfloor = 60\) (Remainder = 500).
  - Hundreds = 500.
- **Formatted Output**: `"Rupees One Crore Twenty-Five Lakh Sixty Thousand Five Hundred Only"`.

---
*End of Document 2.*
