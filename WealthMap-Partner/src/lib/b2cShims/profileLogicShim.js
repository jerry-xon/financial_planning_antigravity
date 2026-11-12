/** Slim shim — avoid pulling B2C allocation engines into the partner bundle. */
export const calculateAge = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
};

export const calculateRetirementYear = (dob, retirementAge) => {
  if (!dob || !retirementAge) return '';
  return new Date(dob).getFullYear() + parseInt(retirementAge, 10);
};

export const calculateProfile = () => ({});
