import React, { useMemo } from 'react';
import { TrendingUp, PieChart, GraduationCap, Map } from 'lucide-react';
import { generateProjections } from './ProjectionLogic';
import JourneyTable from './JourneyTable';

const JourneyModule = ({ 
    familyMembers, 
    income, 
    expenseCategories, 
    goals, 
    inflationRates, 
    setInflationRates,
    policies,
    onNext 
}) => {
    
    const handleRateChange = (name, value) => {
        setInflationRates({
            ...inflationRates,
            [name]: parseFloat(value) || 0
        });
    };

    const projections = useMemo(() => {
        return generateProjections({
            familyMembers,
            income,
            expenseCategories,
            goals,
            inflationRates,
            policies
        });
    }, [familyMembers, income, expenseCategories, goals, inflationRates, policies]);

    return (
        <div className="journey-module fade-in">
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Map size={24} className="text-primary" />
                    <h2 style={{ margin: 0 }}>Step 8: Journey & Projections</h2>
                </div>
                
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Map out your financial journey until retirement. Adjust inflation and growth rates to see how your surplus evolves.
                </p>

                <div className="grid" style={{ gap: '1.5rem' }}>
                    <div className="input-group">
                        <label>
                            <TrendingUp size={14} /> Annual Income Increment (%)
                        </label>
                        <input
                            type="number"
                            value={inflationRates.incomeIncrement}
                            onChange={(e) => handleRateChange('incomeIncrement', e.target.value)}
                            placeholder="e.g. 10"
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            <TrendingUp size={14} /> Household Inflation (%)
                        </label>
                        <input
                            type="number"
                            value={inflationRates.householdInflation}
                            onChange={(e) => handleRateChange('householdInflation', e.target.value)}
                            placeholder="e.g. 6"
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            <GraduationCap size={14} /> Education Inflation (%)
                        </label>
                        <input
                            type="number"
                            value={inflationRates.educationInflation}
                            onChange={(e) => handleRateChange('educationInflation', e.target.value)}
                            placeholder="e.g. 8"
                        />
                    </div>
                </div>
            </div>

            {projections.length > 0 ? (
                <div className="card fade-in">
                    <h3>Yearly Inflow-Outflow Timeline</h3>
                    <JourneyTable projections={projections} />
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Please ensure you have entered details for "Self" in the Profile module to generate the retirement timeline.</p>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn btn-primary" onClick={onNext}>
                    Proceed to Financial Overview
                </button>
            </div>
        </div>
    );
};

export default JourneyModule;
