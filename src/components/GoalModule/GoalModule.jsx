import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import GoalInput from './GoalInput';
import GoalOutput from './GoalOutput';
import { categorizeGoals, getPredefinedGoals } from './GoalLogic';
import { calculateAge } from '../ProfileModule/ProfileLogic';

const GoalModule = ({ familyMembers, goals, setGoals, onNext, onBack }) => {
    const [results, setResults] = useState(null);

    // Sync goals with family members whenever they change
    useEffect(() => {
        const freshPredefined = getPredefinedGoals(familyMembers);

        setGoals(prev => {
            // 1. Separate existing custom goals from predefined ones
            const existingCustom = prev.filter(g => !g.isPredefined);
            
            // 2. Map existing data to the fresh predefined list by ID
            const updatedPredefined = freshPredefined.map(newGoal => {
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
                        totalCourseCost: existing.totalCourseCost,
                        name: newGoal.name // Always use the name from logic for predefined (includes child names)
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

            // 3. Combine updated predefined goals with existing custom goals
            return [...updatedPredefined, ...existingCustom];
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

            {results && (
                <div className="fade-in">
                    <GoalOutput categorizedGoals={results} />
                </div>
            )}

            <div className="sticky-action-bar">
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChevronLeft size={20} />
                    Back to Assets
                </button>
                {results && (
                    <button className="btn btn-primary" onClick={onNext} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                        Proceed to Insurance
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default GoalModule;
