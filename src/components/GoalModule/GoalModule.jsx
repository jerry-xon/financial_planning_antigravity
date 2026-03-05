import React, { useState, useEffect } from 'react';
import GoalInput from './GoalInput';
import GoalOutput from './GoalOutput';
import { categorizeGoals, getPredefinedGoals } from './GoalLogic';
import { calculateAge } from '../ProfileModule/ProfileLogic';

const GoalModule = ({ familyMembers, goals, setGoals, onNext, onBack }) => {
    const [results, setResults] = useState(null);

    // Sync goals with family members whenever they change
    useEffect(() => {
        const freshGoals = getPredefinedGoals(familyMembers);

        setGoals(prev => {
            // Map existing data to the fresh list by ID
            return freshGoals.map(newGoal => {
                const existing = prev.find(p => p.id === newGoal.id);
                if (existing) {
                    return {
                        ...existing,
                        ...newGoal, // Update predefined names/ids from logic
                        // Re-apply values from existing to prioritize user input over predefined defaults
                        yearsToGoal: existing.yearsToGoal,
                        presentValue: existing.presentValue,
                        inflationRate: existing.inflationRate,
                        profession: existing.profession,
                        courseDuration: existing.courseDuration,
                        courseDuration: existing.courseDuration,
                        totalCourseCost: existing.totalCourseCost,
                        name: newGoal.isPredefined ? newGoal.name : existing.name
                    };
                }

                let yearsToGoal = '';
                if (newGoal.id === 'retirement') {
                    const self = familyMembers.find(m => m.relation === 'Self');
                    if (self && self.dob && self.retirementAge) {
                        const age = calculateAge(self.dob);
                        yearsToGoal = (parseInt(self.retirementAge) - age).toString();
                    }
                }

                return {
                    ...newGoal,
                    yearsToGoal: yearsToGoal,
                    presentValue: '',
                    inflationRate: 6
                };
            });
        });
    }, [familyMembers, setGoals]);

    const handleCalculate = () => {
        // Filter out rows where required data is missing
        const validGoals = goals.filter(g => g.yearsToGoal && g.presentValue && (g.name || g.placeholder));
        const categorized = categorizeGoals(validGoals);
        setResults(categorized);
    };

    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card">
                <h1>Life Goals & Financial Projections</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Define your future milestones and let the system calculate the inflation-adjusted corpus required to achieve them.
                </p>

                <GoalInput
                    goals={goals}
                    setGoals={setGoals}
                    onCalculate={handleCalculate}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.8rem 2rem' }}>
                    Back to Assets
                </button>
            </div>

            {results && (
                <div className="fade-in">
                    <GoalOutput categorizedGoals={results} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', marginBottom: '5rem' }}>
                        <button className="btn btn-primary" onClick={onNext} style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', fontWeight: 600 }}>
                            Generate Final Financial Roadmap
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalModule;
