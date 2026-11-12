// apps/web/src/components/DetailedFlow/employmentTypeSync.js
var EMPLOYMENT_TYPES = [
  "Government Sector",
  "Private Sector",
  "Business Owner",
  "Professional",
  "Pensioner"
];
function syncOccupationFromEmploymentType(employmentType) {
  switch (employmentType) {
    case "Government Sector":
    case "Private Sector":
    case "Pensioner":
      return "Salaried";
    case "Business Owner":
    case "Professional":
      return "Business / Profession";
    default:
      return "Salaried";
  }
}
function guessEmploymentTypeFromSummaryOccupation(occupation) {
  if (occupation === "Business / Profession") return "Business Owner";
  if (occupation === "Salaried") return "Private Sector";
  return "";
}
function resolveEmploymentType(member) {
  return member?.employmentType || guessEmploymentTypeFromSummaryOccupation(member?.occupation) || "Private Sector";
}
function createEmptySpouseMember() {
  return {
    name: "",
    dob: "",
    occupation: "Salaried",
    employmentType: "",
    retirementAge: 60,
    relation: "Spouse",
    natureOfBusiness: "",
    organizationName: "",
    educationalQualification: "",
    mobile: "",
    isSpouseWorking: null
  };
}
var CHILD_COLLEGE_FIELDS = [
  "courseName",
  "courseDuration",
  "currentSemYear",
  "remainingTime",
  "costOfCompleteCourse",
  "isFeePaid"
];
var CHILD_SCHOOL_FIELDS = ["standard"];
var CHILD_FEE_FIELDS = ["monthlyEducationExpense", "annualSchoolFee"];
function createEmptyChildMember() {
  return {
    name: "",
    dob: "",
    occupation: "",
    relation: "Child",
    standard: "",
    courseName: "",
    courseDuration: "",
    currentSemYear: "",
    remainingTime: "",
    costOfCompleteCourse: "",
    isFeePaid: "",
    monthlyEducationExpense: ""
  };
}
function applyChildOccupationFields(child, occupation) {
  const next = { ...child, occupation };
  if (occupation === "School") {
    CHILD_COLLEGE_FIELDS.forEach((f) => {
      next[f] = "";
    });
  } else if (occupation === "College") {
    CHILD_SCHOOL_FIELDS.forEach((f) => {
      next[f] = "";
    });
  } else {
    [...CHILD_SCHOOL_FIELDS, ...CHILD_COLLEGE_FIELDS].forEach((f) => {
      next[f] = "";
    });
  }
  CHILD_FEE_FIELDS.forEach((f) => {
    next[f] = "";
  });
  return next;
}
export {
  CHILD_COLLEGE_FIELDS,
  CHILD_FEE_FIELDS,
  CHILD_SCHOOL_FIELDS,
  EMPLOYMENT_TYPES,
  applyChildOccupationFields,
  createEmptyChildMember,
  createEmptySpouseMember,
  guessEmploymentTypeFromSummaryOccupation,
  resolveEmploymentType,
  syncOccupationFromEmploymentType
};
