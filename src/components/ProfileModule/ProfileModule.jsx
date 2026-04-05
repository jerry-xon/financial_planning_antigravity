import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ProfileInput from './ProfileInput';
import ProfileOutput from './ProfileOutput';
import { calculateFamilyProfile } from './ProfileLogic';

const ProfileModule = ({ members, setMembers, onNext }) => {
    const [results, setResults] = React.useState(null);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const calculated = calculateFamilyProfile(members);
        setResults(calculated);
    }, [members]);

    return (
        <div className="fade-in">
            <div className="card">
                <h1>Family Profile & Objectives</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Please provide details for yourself and your family members to build a comprehensive financial roadmap.
                </p>

                <ProfileInput members={members} setMembers={setMembers} />
            </div>

            {results && (
                <div className="fade-in">
                    <ProfileOutput familyResults={results} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem', marginBottom: '4rem' }}>
                        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}
                        <button 
                            className="btn btn-primary" 
                            onClick={() => {
                                const missingMobile = members.some(m => (m.relation === 'Self' || m.relation === 'Spouse') && !m.mobile);
                                if (missingMobile) {
                                    setError('Please provide mobile number for Self and Spouse.');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    setError('');
                                    onNext();
                                }
                            }} 
                            style={{ padding: '1rem 3rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-lg)' }}
                        >
                            Proceed to Cash Flow
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileModule;
