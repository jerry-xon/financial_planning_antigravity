import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';

/**
 * Selectable month chips/cards for Gaps / PYMTW.
 * @param {'ledger'|'deployable'} amountKey - which outlook field to show
 */
const SurplusMonthChips = ({
    months = [],
    outlook = [],
    selectedMonthIndex = null,
    onSelect,
    amountKey = 'ledger',
    className = '',
}) => {
    const [showCalc, setShowCalc] = useState(false);
    if (!months?.length) return null;

    const amountFor = (monthIndex) => {
        const card = outlook.find((o) => o.monthIndex === monthIndex);
        if (!card) return 0;
        if (amountKey === 'deployable') return card.deployableSurplus || 0;
        return card.ledgerUnallocated ?? card.deployableSurplus ?? 0;
    };

    const hasCalcLines = outlook.some((o) => o.calculationLines?.length > 0 || o.allocationsInMonth?.length > 0);

    return (
        <div className={`surplus-month-chips-wrapper ${className}`.trim()}>
            <div className="surplus-month-chips" role="listbox" aria-label="Select month">
                {months.map((month) => {
                    const selected = selectedMonthIndex === month.monthIndex;
                    const amount = amountFor(month.monthIndex);
                    return (
                        <button
                            key={month.monthIndex}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`surplus-month-chip ${selected ? 'surplus-month-chip-selected' : ''}`}
                            onClick={() => onSelect?.(month.monthIndex)}
                        >
                            <span className="surplus-month-chip-label">{month.shortLabel || month.label}</span>
                            <strong className="surplus-month-chip-amount">{formatCurrency(amount)}</strong>
                        </button>
                    );
                })}
            </div>

            {hasCalcLines && (
                <div className="surplus-month-calc-container">
                    <button
                        type="button"
                        className="surplus-month-calc-toggle"
                        onClick={() => setShowCalc(!showCalc)}
                        aria-expanded={showCalc}
                    >
                        {showCalc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>See how future months are calculated</span>
                    </button>

                    {showCalc && (
                        <div className="surplus-month-calc-drawer">
                            {outlook.map((card) => (
                                <div key={card.monthIndex} className="surplus-month-calc-item">
                                    <div className="surplus-month-calc-header">
                                        <strong>{card.title}</strong>
                                        <span>{formatCurrency(card.deployableSurplus || 0)}</span>
                                    </div>
                                    {card.calculationLines?.length > 0 && (
                                        <ul className="surplus-month-calc-lines">
                                            {card.calculationLines.map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .surplus-month-chips-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .surplus-month-chips {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 0.75rem;
                }
                .surplus-month-chip {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.35rem;
                    padding: 0.9rem 1rem;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 12px;
                    background: var(--card-bg, #fff);
                    cursor: pointer;
                    text-align: left;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                }
                .surplus-month-chip:hover {
                    border-color: var(--primary, #0f766e);
                }
                .surplus-month-chip-selected {
                    border-color: var(--primary, #0f766e);
                    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary, #0f766e) 25%, transparent);
                }
                .surplus-month-chip-label {
                    font-size: 0.85rem;
                    color: var(--text-muted, #64748b);
                    font-weight: 600;
                }
                .surplus-month-chip-amount {
                    font-size: 1.1rem;
                    color: var(--text-main, #0f172a);
                }
                .surplus-month-calc-container {
                    margin-top: 0.25rem;
                }
                .surplus-month-calc-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    border: none;
                    background: transparent;
                    color: var(--primary, #0f766e);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0.25rem 0;
                }
                .surplus-month-calc-toggle:hover {
                    text-decoration: underline;
                }
                .surplus-month-calc-drawer {
                    margin-top: 0.5rem;
                    padding: 0.85rem 1rem;
                    background: rgba(15, 118, 110, 0.04);
                    border: 1px dashed var(--border-color, #cbd5e1);
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .surplus-month-calc-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: var(--text-main, #0f172a);
                }
                .surplus-month-calc-lines {
                    margin: 0.25rem 0 0;
                    padding-left: 1rem;
                    font-size: 0.8rem;
                    color: var(--text-muted, #64748b);
                }
            `}</style>
        </div>
    );
};

export default SurplusMonthChips;
