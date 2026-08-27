import React, { useMemo, useState } from 'react';
import { Target, TrendingUp, Layers, Info, Calendar } from 'lucide-react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';

/**
 * NetWorthTrajectoryChart — Quantitative dual-axis visualizer for wealth progression vs goal liabilities.
 */
const NetWorthTrajectoryChart = ({
    currentYear,
    retirementYear,
    horizonYear,
    goals = [],
    futureSurplusTimeline = [],
}) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [showLiabilityOverlay, setShowLiabilityOverlay] = useState(true);

    const startYear = currentYear || new Date().getFullYear();
    const endYear = Math.max(retirementYear || startYear + 10, horizonYear || startYear + 10, startYear + 5);
    const totalYears = Math.max(1, endYear - startYear);

    const trajectoryData = useMemo(() => {
        const points = [];
        let runningLiability = 0;

        for (let year = startYear; year <= endYear; year += 1) {
            // Find residual timeline record if available
            const timelineRow = (futureSurplusTimeline || []).find((row) => row.year === year);
            const timelineClosing = timelineRow ? timelineRow.closing : 0;
            const timelineDraws = timelineRow ? timelineRow.goalDraws || [] : [];

            // Find goals maturing in this year
            const yearGoals = goals.filter((g) => g.targetYear === year);
            const yearGoalCost = yearGoals.reduce((sum, g) => sum + g.goalAmount, 0);
            runningLiability += yearGoalCost;

            // Compute estimated total wealth at year
            const yearProjectedWealth = yearGoals.reduce((sum, g) => sum + (g.scenario?.projectedWealth || 0), 0) + timelineClosing;

            points.push({
                year,
                index: year - startYear,
                projectedWealth: yearProjectedWealth,
                cumulativeLiability: runningLiability,
                goals: yearGoals,
                draws: timelineDraws,
                hasRetirement: year === retirementYear,
            });
        }
        return points;
    }, [startYear, endYear, goals, futureSurplusTimeline, retirementYear]);

    const maxWealth = useMemo(() => {
        const maxW = Math.max(...trajectoryData.map((d) => d.projectedWealth), 100000);
        const maxL = Math.max(...trajectoryData.map((d) => d.cumulativeLiability), 100000);
        return Math.max(maxW, maxL) * 1.15;
    }, [trajectoryData]);

    // Canvas viewBox specs
    const svgWidth = 720;
    const svgHeight = 260;
    const padding = { top: 30, right: 30, bottom: 40, left: 70 };
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    const getX = (index) => padding.left + (index / totalYears) * chartW;
    const getY = (val) => padding.top + chartH - (Math.max(0, val) / maxWealth) * chartH;

    // SVG path string for projected wealth area
    const wealthPath = useMemo(() => {
        if (!trajectoryData.length) return '';
        const coords = trajectoryData.map((d) => `${getX(d.index)},${getY(d.projectedWealth)}`);
        const lineStr = `M ${coords.join(' L ')}`;
        const lastX = getX(trajectoryData[trajectoryData.length - 1].index);
        const firstX = getX(0);
        const bottomY = padding.top + chartH;
        return `${lineStr} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
    }, [trajectoryData, maxWealth]);

    // SVG path string for cumulative liability line
    const liabilityPath = useMemo(() => {
        if (!trajectoryData.length) return '';
        const coords = trajectoryData.map((d) => `${getX(d.index)},${getY(d.cumulativeLiability)}`);
        return `M ${coords.join(' L ')}`;
    }, [trajectoryData, maxWealth]);

    return (
        <div className="card ymm-route-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div className="ymm-route-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '10px' }}>
                        <TrendingUp size={20} color="var(--primary, #2563eb)" />
                    </div>
                    <div>
                        <div className="ymm-route-title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                            Quantitative Net Worth & Solvency Trajectory
                        </div>
                        <p className="ymm-route-sub" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
                            Year-by-year projected wealth accumulation vs. cumulative goal liabilities ({startYear} – {endYear}).
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                            fontSize: '0.8rem',
                            padding: '4px 10px',
                            background: showLiabilityOverlay ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                            color: showLiabilityOverlay ? '#b45309' : 'var(--text-muted, #64748b)',
                            border: '1px solid var(--border-color, #cbd5e1)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                        onClick={() => setShowLiabilityOverlay((v) => !v)}
                    >
                        <Layers size={13} style={{ marginRight: 4 }} />
                        {showLiabilityOverlay ? 'Hide Goal Cost Target' : 'Show Goal Cost Target'}
                    </button>
                </div>
            </div>

            {/* SVG Visual Canvas */}
            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    style={{ width: '100%', height: 'auto', minWidth: '550px', display: 'block' }}
                >
                    <defs>
                        <linearGradient id="wealthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>

                    {/* Y-Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                        const val = maxWealth * (1 - pct);
                        const y = padding.top + chartH * pct;
                        return (
                            <g key={pct}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={svgWidth - padding.right}
                                    y2={y}
                                    stroke="var(--border-color, #e2e8f0)"
                                    strokeDasharray="4 4"
                                    strokeWidth="1"
                                />
                                <text
                                    x={padding.left - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="var(--text-muted, #64748b)"
                                >
                                    {val >= 10000000 ? `₹${(val / 10000000).toFixed(1)}Cr` : val >= 100000 ? `₹${(val / 100000).toFixed(0)}L` : `₹${Math.round(val)}`}
                                </text>
                            </g>
                        );
                    })}

                    {/* Projected Wealth Area */}
                    <path d={wealthPath} fill="url(#wealthAreaGrad)" />

                    {/* Projected Wealth Line */}
                    <path
                        d={trajectoryData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.index)} ${getY(d.projectedWealth)}`).join(' ')}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Cumulative Goal Liability Overlay Line */}
                    {showLiabilityOverlay && (
                        <path
                            d={liabilityPath}
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                        />
                    )}

                    {/* Data Nodes & Goal Markers */}
                    {trajectoryData.map((d) => {
                        const cx = getX(d.index);
                        const cyWealth = getY(d.projectedWealth);
                        const hasGoals = d.goals.length > 0;
                        const isRetire = d.hasRetirement;

                        return (
                            <g key={d.year}>
                                {/* X-Axis Year Labels */}
                                {(d.year === startYear || d.year === endYear || hasGoals || isRetire || d.index % 5 === 0) && (
                                    <text
                                        x={cx}
                                        y={svgHeight - 12}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight={hasGoals || isRetire ? '700' : '400'}
                                        fill={hasGoals ? '#2563eb' : isRetire ? '#059669' : 'var(--text-muted, #64748b)'}
                                    >
                                        {d.year}
                                    </text>
                                )}

                                {/* Hover Target Circle */}
                                <circle
                                    cx={cx}
                                    cy={cyWealth}
                                    r={hasGoals ? 6 : 4}
                                    fill={hasGoals ? (d.goals.every((g) => g.scenario?.remainingGap <= 0) ? '#059669' : '#d97706') : '#2563eb'}
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredPoint(d)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Interactive Tooltip Card */}
                {hoveredPoint && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '20px',
                            background: 'rgba(15, 23, 42, 0.92)',
                            color: '#ffffff',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            pointerEvents: 'none',
                            zIndex: 10,
                            maxWidth: '240px',
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} color="#93c5fd" />
                            <span>Year {hoveredPoint.year}</span>
                        </div>
                        <div style={{ color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <span>Projected Wealth:</span>
                            <strong style={{ color: '#60a5fa' }}>{formatCurrency(hoveredPoint.projectedWealth)}</strong>
                        </div>
                        <div style={{ color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <span>Goal Liability:</span>
                            <strong style={{ color: '#fcd34d' }}>{formatCurrency(hoveredPoint.cumulativeLiability)}</strong>
                        </div>
                        {hoveredPoint.goals.length > 0 && (
                            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                                <div style={{ fontWeight: 650, color: '#fef08a' }}>Goals in {hoveredPoint.year}:</div>
                                {hoveredPoint.goals.map((g) => (
                                    <div key={g.goalId} style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>
                                        • {g.name} ({formatCurrency(g.goalAmount)})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Legend Footer */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color, #f1f5f9)', fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563eb' }} />
                    <span>Projected Net Wealth Area</span>
                </div>
                {showLiabilityOverlay && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '16px', height: '2px', background: '#d97706', borderTop: '2px dashed #d97706' }} />
                        <span>Cumulative Target Liability</span>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
                    <span>Fully Funded Milestone</span>
                </div>
            </div>
        </div>
    );
};

export default NetWorthTrajectoryChart;
