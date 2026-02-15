import React from 'react';
import { User, Calendar, Briefcase, GraduationCap, Clock, AlertTriangle } from 'lucide-react';

const ProfileOutput = ({ familyResults }) => {
    return (
        <div className="family-output">
            <h2 style={{ marginBottom: '2rem' }}>Family Profile Analysis</h2>

            <div className="grid">
                {familyResults.map((result, index) => (
                    <div key={index} className="card fade-in" style={{ borderLeft: '4px solid var(--accent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <User size={20} color="var(--primary)" />
                            <h3 style={{ margin: 0 }}>{result.name || result.relation} ({result.relation})</h3>
                        </div>

                        <div className="member-stats">
                            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} color="var(--text-muted)" />
                                <span><strong>Age:</strong> {result.age} Years</span>
                            </div>

                            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={14} color="var(--text-muted)" />
                                <span><strong>Occupation:</strong> {result.occupation || 'Not Specified'}</span>
                            </div>

                            {result.standard && (
                                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <GraduationCap size={14} color="var(--text-muted)" />
                                    <span><strong>Education:</strong> {result.standard}</span>
                                </div>
                            )}

                            {(result.relation === 'Self' || result.relation === 'Spouse') && (
                                <>
                                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} color="var(--text-muted)" />
                                        <span><strong>Retirement Year:</strong> {result.retirementYear}</span>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} color="var(--text-muted)" />
                                        <span><strong>Window:</strong> {result.yearsToRetire} Years</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {result.isLateStart && (
                            <div className="insight-box">
                                <AlertTriangle size={18} />
                                <p>Late start for retirement. Immediate planning recommended.</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
        .member-stats span {
          font-size: 0.9375rem;
        }
        .insight-box {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fff7ed;
          border-radius: 6px;
          display: flex;
          gap: 0.5rem;
          color: #9a3412;
          font-size: 0.8125rem;
          align-items: center;
        }
      `}</style>
        </div>
    );
};

export default ProfileOutput;
