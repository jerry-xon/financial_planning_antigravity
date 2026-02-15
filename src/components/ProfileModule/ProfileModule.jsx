import React, { useState } from 'react';
import ProfileInput from './ProfileInput';
import ProfileOutput from './ProfileOutput';
import { calculateFamilyProfile } from './ProfileLogic';

const ProfileModule = ({ members, setMembers, onNext }) => {
    const [results, setResults] = useState(null);

    const handleCalculate = () => {
        const calculated = calculateFamilyProfile(members);
        setResults(calculated);
    };

    return (
        <div className="fade-in">
            <div className="card">
                <h1>Family Profile & Objectives</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Please provide details for yourself and your family members to build a comprehensive financial roadmap.
                </p>

                <ProfileInput members={members} setMembers={setMembers} onCalculate={handleCalculate} />
            </div>

            {results && (
                <div className="fade-in">
                    <ProfileOutput familyResults={results} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '4rem' }}>
                        <button className="btn btn-primary" onClick={onNext} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                            Proceed to Cash Flow
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileModule;
