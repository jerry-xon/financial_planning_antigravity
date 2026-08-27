import React, { useState } from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const SensitivityControlRail = ({
    inflationRate,
    onInflationChange,
    returnDelta,
    onReturnDeltaChange,
    retirementAge,
    onRetirementAgeChange,
    onReset,
}) => {
    const [open, setOpen] = useState(false);

    const isCustomized = inflationRate !== 6 || returnDelta !== 0 || (retirementAge && retirementAge !== 60);

    return (
        <div
            className="card ymm-sensitivity-rail"
            style={{
                borderRadius: '14px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-card, #ffffff)',
                padding: '1rem 1.25rem',
                transition: 'all 0.2s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '8px', borderRadius: '10px', color: '#7c3aed' }}>
                        <Sliders size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Interactive &quot;What-If&quot; Sensitivity Controls
                            {isCustomized && (
                                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed', fontWeight: 600 }}>
                                    Active Simulation
                                </span>
                            )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted, #64748b)' }}>
                            Stress-test your financial plan against inflation variations and market volatility in real time.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isCustomized && (
                        <button
                            type="button"
                            className="btn btn-sm"
                            style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={onReset}
                        >
                            <RotateCcw size={12} />
                            Reset Defaults
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm"
                        style={{ fontSize: '0.82rem', padding: '5px 12px', background: 'var(--bg-subtle, #f1f5f9)', color: 'var(--text-main, #0f172a)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setOpen((v) => !v)}
                    >
                        <span>{open ? 'Hide Controls' : 'Configure Parameters'}</span>
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>

            {open && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #f1f5f9)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    {/* Control 1: Inflation Rate Slider */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>Goal Inflation Rate</span>
                            <strong style={{ color: '#2563eb' }}>{inflationRate}% / yr</strong>
                        </div>
                        <input
                            type="range"
                            min="4"
                            max="10"
                            step="0.5"
                            value={inflationRate}
                            onChange={(e) => onInflationChange(parseFloat(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                            <span>4% Low</span>
                            <span>6% Default</span>
                            <span>10% High</span>
                        </div>
                    </div>

                    {/* Control 2: Market Return Stress Delta Slider */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>Market Return Stress</span>
                            <strong style={{ color: returnDelta < 0 ? '#dc2626' : returnDelta > 0 ? '#059669' : 'var(--text-main)' }}>
                                {returnDelta > 0 ? `+${returnDelta}%` : `${returnDelta}%`}
                            </strong>
                        </div>
                        <input
                            type="range"
                            min="-3"
                            max="3"
                            step="0.5"
                            value={returnDelta}
                            onChange={(e) => onReturnDeltaChange(parseFloat(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: returnDelta < 0 ? '#dc2626' : '#059669' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                            <span>-3% Bear</span>
                            <span>0% Base</span>
                            <span>+3% Bull</span>
                        </div>
                    </div>

                    {/* Control 3: Retirement Age Target Slider */}
                    {retirementAge && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>Retirement Target Age</span>
                                <strong style={{ color: '#7c3aed' }}>{retirementAge} Years</strong>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="65"
                                step="1"
                                value={retirementAge}
                                onChange={(e) => onRetirementAgeChange(parseInt(e.target.value, 10))}
                                style={{ width: '100%', cursor: 'pointer', accentColor: '#7c3aed' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                                <span>50 Early</span>
                                <span>60 Standard</span>
                                <span>65 Extended</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SensitivityControlRail;
