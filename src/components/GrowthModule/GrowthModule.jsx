import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

import { computeSIPData } from '../Calculators/SIPCalculator';
import { computeLumpsumData } from '../Calculators/LumpsumCalculator';
import { computeEquityData } from '../Calculators/EquityCalculator';
import { computePPFData } from '../Calculators/PPFCalculator';
import { computeNPSData } from '../Calculators/NPSCalculator';
import { computeFDData } from '../Calculators/FDCalculator';
import { computeRDData } from '../Calculators/RDCalculator';
import { calculateYearlyInsuranceSummary } from '../InsuranceModule/InsuranceLogic';

const GrowthModule = ({ 
    familyMembers = [], 
    assetCategories = {}, 
    expenseCategories = {},
    allocations = [], 
    calculatorInputs = {},
    journeyProjections = [],
    policies = [],
    goalMappings = {},
    goals = [],
    onNext, 
    onBack 
}) => {
    // 1. Identify Target Timeline
    const self = familyMembers.find(m => m.relation?.toLowerCase() === 'self') || familyMembers[0];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    let retirementAge = 60;
    let retirementYear = currentYear + 10;
    
    if (self && self.dob) {
        const d = new Date(self.dob);
        if (!isNaN(d.getTime())) {
            const ageYearStart = currentYear - d.getFullYear();
            retirementAge = parseInt(self.retirementAge) || 60;
            const yearsToRetire = retirementAge - ageYearStart;
            retirementYear = currentYear + Math.max(0, yearsToRetire);
        }
    }

    // 2. Fetch Raw Schedules
    const sipData = useMemo(() => {
        const c = calculatorInputs.sip || {};
        const defaultSIP = parseFloat(expenseCategories?.savings?.sip?.amount !== undefined ? expenseCategories.savings.sip.amount : expenseCategories?.savings?.sip) || 0;
        const defaultCorpus = parseFloat(assetCategories?.investments?.mutualFunds) || parseFloat(assetCategories?.equity?.mfEquity) || parseFloat(assetCategories?.equity?.stocks) || 0;

        return computeSIPData(
            currentYear, 
            defaultSIP, 
            parseFloat(c.rate) || 12, 
            parseInt(c.tenure) || (retirementYear - currentYear), 
            defaultCorpus, 
            c.increments || c.events || [],  
            allocations.filter(a => a.type === 'SIP'),
            goalMappings,
            goals
        );
    }, [calculatorInputs.sip, allocations, currentYear, retirementYear, goalMappings, goals]);

    const lumpsumData = useMemo(() => {
        const c = calculatorInputs.lumpsum || {};
        return computeLumpsumData(
            parseFloat(c.amount) || 0,
            parseFloat(c.rate) || 12,
            parseInt(c.tenure) || (retirementYear - currentYear),
            currentMonth,
            currentYear,
            c.events || [],
            allocations.filter(a => a.type === 'Lumpsum' || a.type === 'Lump Sum'),
            goalMappings,
            goals
        );
    }, [calculatorInputs.lumpsum, allocations, currentYear, currentMonth, retirementYear, goalMappings, goals]);

    const ppfData = useMemo(() => {
        const c = calculatorInputs.ppf || {};
        return computePPFData(allocations.filter(a => a.type === 'PPF'), parseFloat(c.rate) || 7.10);
    }, [calculatorInputs.ppf, allocations]);

    const npsData = useMemo(() => {
        const c = calculatorInputs.nps || {};
        return computeNPSData(allocations.filter(a => a.type === 'NPS'), parseFloat(c.rate) || 10, parseFloat(c.annuity) || 40, parseFloat(c.annuityRate) || 6, self).schedule;
    }, [calculatorInputs.nps, allocations, self]);

    const fdData = useMemo(() => {
        const c = calculatorInputs.fd || {};
        return computeFDData(allocations.filter(a => a.type === 'Fixed Deposit'), parseFloat(c.rate) || 7.00, c.frequency || 'Quarterly').schedule;
    }, [calculatorInputs.fd, allocations]);

    const rdData = useMemo(() => {
        const c = calculatorInputs.rd || {};
        return computeRDData(allocations.filter(a => a.type === 'Recurring Deposit'), parseFloat(c.rate) || 7.00).schedule;
    }, [calculatorInputs.rd, allocations]);

    const insuranceData = useMemo(() => {
        return calculateYearlyInsuranceSummary(policies) || [];
    }, [policies]);

    const equityData = useMemo(() => {
        const c = calculatorInputs.equity || {};
        const defaultCorpus = parseFloat(assetCategories?.investments?.equity) || parseFloat(assetCategories?.equity?.stocks) || 0;
        return computeEquityData(
            defaultCorpus,
            parseFloat(c.rate) || 15,
            parseInt(c.tenure) || (retirementYear - currentYear),
            currentMonth,
            currentYear,
            c.events || [],
            allocations.filter(a => a.type === 'Direct Equity & ETFs'),
            goalMappings,
            goals
        );
    }, [calculatorInputs.equity, allocations, currentYear, currentMonth, retirementYear, goalMappings, goals, assetCategories]);

    // 4. Construct Master Table
    const masterProjections = useMemo(() => {
        let rows = [];
        
        for (let y = currentYear; y <= retirementYear; y++) {
            // Unallocated Surplus (Fetch from journeyProjections)
            let unallocated = 0;
            const jRow = journeyProjections.find(r => r.year === y);
            if (jRow) {
                // Determine Total Active Allocations for this year
                const totalAlloc = (jRow.activeAllocations || []).reduce((sum, a) => sum + (a.impactThisYear || 0), 0);
                unallocated = Math.max(0, (jRow.netInvestibleSurplus || 0) - totalAlloc);
            }

            // Calculations
            const sRow = sipData.find(r => r.year === y);
            const sipBal = sRow ? sRow.valueAfterWithdrawal : 0;

            const lRow = lumpsumData.find(r => r.year === y);
            const lsBal = lRow ? lRow.valueAfterWithdrawal : 0;

            const pRow = ppfData.find(r => r.year === y);
            const ppfBal = pRow ? pRow.endValue : 0;

            const nRow = npsData.find(r => r.year === y);
            const npsBal = nRow ? nRow.endValue : 0;

            const iRow = insuranceData.find(r => r.year === y);
            const insMaturity = iRow ? (iRow.maturities || []).reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0) : 0;

            const fRow = fdData.find(r => r.year === y);
            const fdBal = fRow ? (fRow.endValue || 0) + (fRow.maturityValue || 0) : 0;

            const rRow = rdData.find(r => r.year === y);
            const rdBal = rRow ? (rRow.endValue || 0) + (rRow.maturityValue || 0) : 0;

            const eRow = equityData.find(r => r.year === y);
            const equityBal = eRow ? eRow.valueAfterWithdrawal : 0;
            
            const total = unallocated + sipBal + lsBal + equityBal + ppfBal + npsBal + insMaturity + fdBal + rdBal;

            rows.push({
                year: y,
                unallocated,
                sipBal,
                lsBal,
                equityBal,
                ppfBal,
                npsBal,
                insMaturity,
                fdBal,
                rdBal,
                total
            });
        }
        return rows;
    }, [currentYear, retirementYear, journeyProjections, sipData, lumpsumData, equityData, ppfData, npsData, insuranceData, fdData, rdData]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    if (!masterProjections || masterProjections.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Generating projections...</p>
            </div>
        );
    }

    const currentWorth = masterProjections[0].total;
    const finalWorth = masterProjections[masterProjections.length - 1].total;

    return (
        <div className="growth-module fade-in">
            <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '100vw', overflowX: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <BarChart3 size={24} className="text-primary" />
                    <h2 style={{ margin: 0 }}>Step 10: Year-wise Net Worth Tracker</h2>
                </div>
                
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Track how your entire worth grows over time, including current investments, ongoing savings, insurance maturity and surplus allocations.
                </p>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="stat-card" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Total Worth</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(currentWorth)}</div>
                    </div>
                    
                    <div className="stat-card" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Projected Retirement Corpus</span>
                            <TrendingUp size={20} className="text-primary" />
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(finalWorth)}</div>
                    </div>
                </div>

                <div className="table-responsive" style={{ border: '1px solid var(--border)', borderRadius: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                    <table className="summary-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr style={{ background: 'var(--bg-main)', whiteSpace: 'nowrap' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Year</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>Unallocated Surplus</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>SIP</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Lumpsum</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Direct Equity & ETFs</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>PPF</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>NPS</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)', color: '#10b981' }}>Life Insurance</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>FD</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>RD</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: 800 }}>Total Worth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {masterProjections.map((row, idx) => (
                                <tr key={row.year} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : '#f8fafc', whiteSpace: 'nowrap' }}>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>{row.year}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(row.unallocated)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.sipBal)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.lsBal)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.equityBal)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.ppfBal)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.npsBal)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981' }}>{formatCurrency(row.insMaturity)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.fdBal)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.rdBal)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, background: 'rgba(99, 102, 241, 0.05)', color: 'var(--text-main)' }}>
                                        {formatCurrency(row.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', alignItems: 'flex-start' }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0 }}>
                        This tracker acts as a read-only mirror of all active investments modeled within the system calculators. Any adjustments to compounding variables must be applied directly within their respective calculator views.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', marginBottom: '4rem' }}>
                <button className="btn btn-secondary" onClick={onBack}>
                    Back to Allocation
                </button>
                <button className="btn btn-primary" onClick={onNext}>
                    Proceed to Goal Roadmap
                </button>
            </div>
        </div>
    );
};

export default GrowthModule;
