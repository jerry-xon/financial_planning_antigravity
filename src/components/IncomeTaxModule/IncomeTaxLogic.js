/**
 * Income Tax Calculation Logic (FY 2025-26 New Regime)
 * Based on Finance Bill/Regime for the upcoming year.
 */

export const calculateIncomeTax = (monthlyIncomeObj, occupation) => {
    // Step 1: Sum all monthly income fields and annualize
    const monthlyTotal = (parseFloat(monthlyIncomeObj.salary) || 0) + 
                         (parseFloat(monthlyIncomeObj.bonus) || 0) + 
                         (parseFloat(monthlyIncomeObj.passive) || 0) + 
                         (parseFloat(monthlyIncomeObj.other) || 0);
    
    const grossTotalIncome = monthlyTotal * 12;

    // Step 2: Standard Deduction (₹75,000 for Salaried)
    const isSalaried = occupation?.toLowerCase() === 'salaried';
    const standardDeduction = isSalaried ? 75000 : 0;
    
    const taxableIncome = Math.max(0, grossTotalIncome - standardDeduction);

    // Step 3: Slab-wise Tax Calculation
    const slabs = [
        { limit: 400000, rate: 0 },
        { limit: 400000, rate: 0.05 },  // 4L to 8L
        { limit: 400000, rate: 0.10 },  // 8L to 12L
        { limit: 400000, rate: 0.15 },  // 12L to 16L
        { limit: 400000, rate: 0.20 },  // 16L to 20L
        { limit: 400000, rate: 0.25 },  // 20L to 24L
        { limit: Infinity, rate: 0.30 } // Above 24L
    ];

    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const slabBreakdown = [];

    for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        const prevLimit = i === 0 ? 0 : slabs[i-1].limit; // This logic for slabs is actually better handled by fixed ranges
    }

    // Simplified Slab calculation for clarity
    let taxBase = taxableIncome;
    let t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0;

    if (taxBase > 2400000) {
        t7 = (taxBase - 2400000) * 0.30;
        taxBase = 2400000;
    }
    if (taxBase > 2000000) {
        t6 = (taxBase - 2000000) * 0.25;
        taxBase = 2000000;
    }
    if (taxBase > 1600000) {
        t5 = (taxBase - 1600000) * 0.20;
        taxBase = 1600000;
    }
    if (taxBase > 1200000) {
        t4 = (taxBase - 1200000) * 0.15;
        taxBase = 1200000;
    }
    if (taxBase > 800000) {
        t3 = (taxBase - 800000) * 0.10;
        taxBase = 800000;
    }
    if (taxBase > 400000) {
        t2 = (taxBase - 400000) * 0.05;
        taxBase = 400000;
    }
    t1 = 0; // First 4L is Nil

    totalTax = t1 + t2 + t3 + t4 + t5 + t6 + t7;

    // Step 4: Section 87A Rebate
    // Maximum rebate of ₹60,000 if taxable income ≤ ₹12,00,000
    let rebate87A = 0;
    if (taxableIncome <= 1200000) {
        rebate87A = Math.min(totalTax, 60000);
    }

    const taxAfterRebate = Math.max(0, totalTax - rebate87A);

    // Step 5: 4% Cess
    const cess = taxAfterRebate * 0.04;
    const finalTax = taxAfterRebate + cess;

    return {
        grossTotalIncome,
        standardDeduction,
        taxableIncome,
        totalTaxBeforeRebate: totalTax,
        rebate87A,
        taxAfterRebate,
        cess,
        finalTax,
        slabs: { t1, t2, t3, t4, t5, t6, t7 }
    };
};
