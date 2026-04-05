import React from 'react';
import { User, Calendar, Briefcase, GraduationCap, Clock, AlertTriangle } from 'lucide-react';

const ProfileOutput = ({ familyResults }) => {
    return (
        <div className="family-output">
            <h2 style={{ marginBottom: '2rem' }}>Family Profile Analysis</h2>

            <div className="grid-cols-3">
                {familyResults.map((result, index) => {
                    const styleConfig = result.relation === 'Self' 
                        ? { border: 'var(--primary-light)', bg: 'linear-gradient(to bottom right, var(--primary-light), #fff)', iconBg: 'var(--primary)', subtitle: 'Primary Member' }
                        : result.relation === 'Spouse'
                            ? { border: 'var(--accent-light)', bg: 'linear-gradient(to bottom right, var(--accent-light), #fff)', iconBg: 'var(--accent)', subtitle: 'Family Member' }
                            : { border: 'var(--tertiary-light)', bg: 'linear-gradient(to bottom right, var(--tertiary-light), #fff)', iconBg: 'var(--tertiary)', subtitle: 'Dependent' };
                    
                    const initial = (result.name || result.relation).charAt(0).toUpperCase();

                    return (
                    <div key={index} className="card fade-in" style={{ border: `2px solid ${styleConfig.border}`, background: styleConfig.bg, padding: '1.5rem', borderRadius: '12px', boxShadow: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: styleConfig.iconBg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>
                                {initial}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{result.name || result.relation} ({result.relation})</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{styleConfig.subtitle}</p>
                            </div>
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

                            {result.standard && result.occupation === 'School' && (
                                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <GraduationCap size={14} color="var(--text-muted)" />
                                    <span><strong>Education:</strong> {result.standard}</span>
                                </div>
                            )}

                            {result.occupation === 'College' && (
                                <div className="college-details" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <GraduationCap size={14} color="var(--text-muted)" />
                                        <span><strong>Course:</strong> {result.courseName || 'Not Specified'}</span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} color="var(--text-muted)" />
                                        <span><strong>Duration:</strong> {result.courseDuration} Years</span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} color="var(--text-muted)" />
                                        <span><strong>Current:</strong> {result.currentSemYear}</span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} color="var(--text-muted)" />
                                        <span><strong>Remaining:</strong> {result.remainingTime} Years</span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertTriangle size={14} color="var(--text-muted)" />
                                        <span><strong>Total Cost:</strong> ₹{result.costOfCompleteCourse}</span>
                                    </div>
                                    {result.isFeePaid && (
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertTriangle size={14} color={result.isFeePaid === 'YES' ? '#22c55e' : '#ef4444'} />
                                            <span><strong>Fee Paid:</strong> {result.isFeePaid}</span>
                                        </div>
                                    )}
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
                    );
                })}
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
