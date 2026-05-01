import React from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { Calendar, ArrowRight, Target } from 'lucide-react';

const GoalOutput = ({ categorizedGoals }) => {
    const sections = [
        { key: 'short', title: 'Short Term Goals (Next 3 Years)', color: '#3b82f6' },
        { key: 'medium', title: 'Medium Term Goals (4-7 Years)', color: '#8b5cf6' },
        { key: 'long', title: 'Long Term Goals (8+ Years)', color: '#10b981' }
    ];

    return (
        <div className="goal-output fade-in" style={{ marginTop: '2.5rem' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Target color="var(--primary)" /> Future Cost Projections
            </h2>

            <div className="goals-grid">
                {sections.map(section => (
                    <div key={section.key} className="goal-category-section" style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{
                            color: section.color,
                            borderLeft: `4px solid ${section.color}`,
                            paddingLeft: '1rem',
                            marginBottom: '1.5rem',
                            fontSize: '1.2rem'
                        }}>
                            {section.title}
                        </h3>

                        {categorizedGoals[section.key].length === 0 ? (
                            <p className="text-muted" style={{ paddingLeft: '1.5rem', fontStyle: 'italic' }}>No goals identified for this period.</p>
                        ) : (
                            <div className="goal-cards-container">
                                {categorizedGoals[section.key].map((goal, idx) => (
                                    <div key={idx} className="card goal-item-card" style={{
                                        background: 'var(--bg-main)',
                                        marginBottom: '1rem',
                                        border: '1px solid var(--border)',
                                        padding: '1.25rem'
                                    }}>
                                        <div className="goal-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <strong style={{ fontSize: '1.1rem' }}>{goal.name || 'Unnamed Goal'}</strong>
                                            <div className="badge" style={{ background: 'var(--border)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Calendar size={14} /> {goal.targetYear}
                                            </div>
                                        </div>

                                        <div className="goal-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div className="pv-info">
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Present Value</label>
                                                <span style={{ fontSize: '1rem' }}>{formatCurrency(goal.presentValue)}</span>
                                            </div>

                                            <div className="arrow-icon" style={{ opacity: 0.3 }}>
                                                <ArrowRight size={24} />
                                            </div>

                                            <div className="fv-info" style={{ textAlign: 'right' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', fontWeight: 600 }}>Future Cost (@{goal.inflationRate}%)</label>
                                                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(goal.futureCost)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
        .goals-grid {
          display: grid;
          gap: 1.5rem;
        }
        .goal-item-card {
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .goal-item-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
        }
      `}</style>
        </div>
    );
};

export default GoalOutput;
