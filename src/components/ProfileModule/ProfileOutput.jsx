import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ProfileOutput = ({ familyResults }) => {
    return (
        <div className="family-output fade-in" style={{ marginTop: '2rem' }}>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-1)', marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
                Family <span style={{ fontWeight: 400, color: 'var(--text-main)', marginLeft: '0.5rem' }}>Profile Matrix</span>
            </h1>

            <div className="profile-grid">
                {familyResults.map((result, index) => {
                    
                    let cardClass = 'card-dependent';
                    let avatarClass = 'avatar-child';
                    let relationText = 'Dependent';
                    let badgeClass = 'badge-dependent';
                    
                    if (result.relation === 'Self') {
                        cardClass = 'card-primary';
                        avatarClass = 'avatar-primary';
                        relationText = 'Primary Member (Self)';
                        badgeClass = 'badge-primary';
                    } else if (result.relation === 'Spouse') {
                        cardClass = 'card-spouse';
                        avatarClass = 'avatar-spouse';
                        relationText = 'Family Member (Spouse)';
                        badgeClass = 'badge-spouse';
                    }
                    
                    const initial = (result.name || result.relation).charAt(0).toUpperCase();

                    return (
                        <div key={index} className={`profile-card ${cardClass}`}>
                            <div className="card-header">
                                <div className={`avatar ${avatarClass}`}>{initial}</div>
                                <div className="header-info">
                                    <h2>{result.name || result.relation}</h2>
                                    <p>{relationText}</p>
                                    <div className="badges">
                                        <span className={`badge ${badgeClass}`}>{result.relation}</span>
                                        {result.occupation === 'School' || result.occupation === 'College' ? (
                                            <span className="badge" style={{ background: 'var(--color-3)', color: 'white', border: 'none' }}>Student</span>
                                        ) : (
                                            <span className="badge">Earning</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-label">Current Age</div>
                                    <div className="info-value">{result.age} Years</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Occupation</div>
                                    <div className="info-value">{result.occupation || 'Not Specified'}</div>
                                </div>

                                {result.standard && result.occupation === 'School' && (
                                    <div className="info-item">
                                        <div className="info-label">Standard</div>
                                        <div className="info-value">{result.standard}</div>
                                    </div>
                                )}

                                {(result.relation === 'Self' || result.relation === 'Spouse') && (
                                    <>
                                        <div className="info-item">
                                            <div className="info-label">Retirement Yr</div>
                                            <div className="info-value">{result.retirementYear}</div>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-label">Retirement Horizon</div>
                                            <div className="info-value">{result.yearsToRetire} Years</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Education Details block for dependents */}
                            {result.occupation === 'College' && (
                                <div className="education-section">
                                    <div className="info-item full-width">
                                        <div className="info-label">Course Name</div>
                                        <div className="info-value">{result.courseName || 'Not Specified'}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Course Duration</div>
                                        <div className="info-value">{result.courseDuration} Years</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Remaining Time</div>
                                        <div className="info-value">{result.remainingTime} Years</div>
                                    </div>
                                    
                                    <div className="info-item full-width" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <div>
                                            <div className="info-label">Total Est. Cost</div>
                                            <div className="info-value">₹ {result.costOfCompleteCourse}</div>
                                        </div>
                                        {result.isFeePaid && (
                                            <div style={{ textAlign: 'right' }}>
                                                <div className="info-label">Fee Paid Status</div>
                                                <div className="info-value" style={{ color: result.isFeePaid === 'YES' ? '#10b981' : '#ef4444' }}>{result.isFeePaid}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {result.isLateStart && (
                                <div className="alert-box">
                                    <AlertTriangle size={20} color="#e11d48" style={{flexShrink: 0}} />
                                    <p>Late start for retirement planning. Immediate strategic planning is highly recommended to bridge the wealth gap.</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .profile-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2rem;
                }

                .profile-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                }

                .profile-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                }

                .profile-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 6px;
                    background: var(--color-1);
                }

                .card-spouse::before { background: var(--color-2); }
                .card-dependent::before { background: var(--color-3); }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }

                .avatar {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    flex-shrink: 0;
                }

                .avatar-primary { background: linear-gradient(135deg, var(--color-1), var(--color-3)); }
                .avatar-spouse { background: linear-gradient(135deg, var(--color-2), var(--color-4)); }
                .avatar-child { background: linear-gradient(135deg, var(--color-3), var(--color-5)); }

                .header-info h2 {
                    font-size: 1.2rem;
                    color: var(--text-main);
                    margin-bottom: 0.25rem;
                    margin-top: 0;
                }

                .header-info p {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    margin: 0;
                }

                .badges {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    flex-wrap: wrap;
                }

                .badge {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: var(--bg-main);
                    color: var(--text-muted);
                    border: 1px solid var(--border);
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    margin-bottom: auto;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .info-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .info-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .education-section {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px dashed var(--border);
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    background: rgba(120, 124, 254, 0.03);
                    margin-left: -2rem;
                    margin-right: -2rem;
                    padding-left: 2rem;
                    padding-right: 2rem;
                    padding-bottom: 0.5rem;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                }

                .alert-box {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: #fff1f2;
                    border: 1px solid #fecdd3;
                    border-radius: 8px;
                    display: flex;
                    gap: 0.75rem;
                    align-items: flex-start;
                }

                .alert-box p {
                    font-size: 0.85rem;
                    color: #9f1239;
                    margin: 0;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
};

export default ProfileOutput;
