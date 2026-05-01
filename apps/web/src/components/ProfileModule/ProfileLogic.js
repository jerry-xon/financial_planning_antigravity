export const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const calculateRetirementYear = (dob, retirementAge) => {
    if (!dob || !retirementAge) return '';
    const birthDate = new Date(dob);
    const birthYear = birthDate.getFullYear();
    return birthYear + parseInt(retirementAge);
};

export const calculateProfile = (member) => {
    const age = calculateAge(member.dob);
    const yearsToRetire = member.retirementAge - age;
    const retirementYear = calculateRetirementYear(member.dob, member.retirementAge);

    let lifeStage = '';
    if (age < 25) lifeStage = 'Early Career / Foundation';
    else if (age < 40) lifeStage = 'Wealth Accumulation / Family Building';
    else if (age < 55) lifeStage = 'Peak Earnings / Maturity';
    else lifeStage = 'Transition to Wisdom Years';

    return {
        ...member,
        age,
        yearsToRetire,
        retirementYear,
        lifeStage,
        isLateStart: age > 40 && yearsToRetire < 15
    };
};

export const calculateFamilyProfile = (members) => {
    return members.map(member => calculateProfile(member));
};
