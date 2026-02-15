import React from 'react';
import { User, Calendar, Target, Briefcase, Plus, Trash2, GraduationCap } from 'lucide-react';

const ProfileInput = ({ members, setMembers, onCalculate }) => {
    const handleMemberChange = (index, e) => {
        const { name, value } = e.target;
        const updatedMembers = [...members];
        updatedMembers[index] = { ...updatedMembers[index], [name]: value };
        setMembers(updatedMembers);
    };

    const addMember = (relation) => {
        setMembers([...members, {
            name: '',
            dob: '',
            occupation: '',
            retirementAge: 60,
            relation: relation,
            standard: relation === 'Child' ? '' : undefined
        }]);
    };

    const removeMember = (index) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="profile-input-container">
            {members.map((member, index) => (
                <div key={index} className="card member-card fade-in" style={{ borderTop: `4px solid ${member.relation === 'Self' ? 'var(--primary)' : 'var(--accent)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>{member.relation} Details</h3>
                        {index !== 0 && (
                            <button className="btn" onClick={() => removeMember(index)} style={{ color: '#ef4444', padding: '0.25rem' }}>
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <div className="grid">
                        <div className="input-group">
                            <label><User size={14} /> Name</label>
                            <input
                                type="text"
                                name="name"
                                value={member.name}
                                onChange={(e) => handleMemberChange(index, e)}
                                placeholder="Name"
                            />
                        </div>

                        <div className="input-group">
                            <label><Calendar size={14} /> Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={member.dob}
                                onChange={(e) => handleMemberChange(index, e)}
                            />
                        </div>

                        <div className="input-group">
                            <label><Briefcase size={14} /> Occupation</label>
                            <input
                                type="text"
                                name="occupation"
                                value={member.occupation}
                                onChange={(e) => handleMemberChange(index, e)}
                                placeholder="e.g. Engineer"
                            />
                        </div>

                        {(member.relation === 'Self' || member.relation === 'Spouse') && (
                            <div className="input-group">
                                <label><Calendar size={14} /> Retirement Age</label>
                                <input
                                    type="number"
                                    name="retirementAge"
                                    value={member.retirementAge}
                                    onChange={(e) => handleMemberChange(index, e)}
                                />
                            </div>
                        )}

                        {member.relation === 'Child' && (
                            <>
                                <div className="input-group">
                                    <label><GraduationCap size={14} /> Studying in Standard</label>
                                    <input
                                        type="text"
                                        name="standard"
                                        value={member.standard || ''}
                                        onChange={(e) => handleMemberChange(index, e)}
                                        placeholder="e.g. 5th Standard"
                                    />
                                </div>
                                <div className="input-group">
                                    <label><GraduationCap size={14} /> Annual School fee (₹)</label>
                                    <input
                                        type="number"
                                        name="annualSchoolFee"
                                        value={member.annualSchoolFee || ''}
                                        onChange={(e) => handleMemberChange(index, e)}
                                        placeholder="e.g. 50000"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => addMember('Spouse')} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Spouse
                </button>
                <button className="btn" onClick={() => addMember('Child')} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Child
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={onCalculate}>
                    Generate Family Analysis
                </button>
            </div>

            <style jsx>{`
        .member-card {
          margin-bottom: 1.5rem;
          padding: 1.25rem;
        }
      `}</style>
        </div>
    );
};

export default ProfileInput;
