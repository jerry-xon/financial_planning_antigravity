import React from 'react';

const GoalInput = ({ goals, setGoals, onCalculate }) => {

    const handleGoalChange = (id, field, value) => {
        setGoals(prev => prev.map(goal =>
            goal.id === id ? { ...goal, [field]: value } : goal
        ));
    };

    return (
        <div className="goal-input">
            <div className="goals-table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem' }}>Life Goal Name</th>
                            <th style={{ padding: '1rem' }}>Time (Years)</th>
                            <th style={{ padding: '1rem' }}>Present Value (₹)</th>
                            <th style={{ padding: '1rem' }}>Inflation (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goals.map((goal) => (
                            <tr key={goal.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem' }}>
                                    {goal.isPredefined ? (
                                        <span style={{ fontWeight: 500 }}>{goal.name}</span>
                                    ) : (
                                        <input
                                            type="text"
                                            value={goal.name}
                                            onChange={(e) => handleGoalChange(goal.id, 'name', e.target.value)}
                                            placeholder={goal.placeholder}
                                            className="input-minimal"
                                        />
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <input
                                        type="number"
                                        value={goal.yearsToGoal || ''}
                                        onChange={(e) => handleGoalChange(goal.id, 'yearsToGoal', e.target.value)}
                                        placeholder="Years"
                                        className="input-minimal"
                                        style={{ width: '80px' }}
                                    />
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <input
                                        type="number"
                                        value={goal.presentValue || ''}
                                        onChange={(e) => handleGoalChange(goal.id, 'presentValue', e.target.value)}
                                        placeholder="₹ 0"
                                        className="input-minimal"
                                    />
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <input
                                        type="number"
                                        value={goal.inflationRate || ''}
                                        onChange={(e) => handleGoalChange(goal.id, 'inflationRate', e.target.value)}
                                        placeholder="6%"
                                        className="input-minimal"
                                        style={{ width: '80px' }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                <button className="btn btn-primary" onClick={onCalculate} style={{ padding: '1rem 4rem' }}>
                    Project Future Costs
                </button>
            </div>

            <style jsx>{`
        .input-minimal {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 6px 10px;
          color: var(--text-main);
          width: 100%;
          font-size: 0.9rem;
        }
        .input-minimal:focus {
          border-color: var(--primary);
          outline: none;
        }
        th {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
        </div>
    );
};

export default GoalInput;
