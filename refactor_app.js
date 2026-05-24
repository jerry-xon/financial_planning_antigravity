const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'apps/web/src/App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. imports
content = content.replace(
  "import { useEffect, useState, useMemo } from 'react';",
  "import { useState } from 'react';"
);
content = content.replace(
  "import { signOut } from './services/authService';",
  "import { signOut } from './services/authService';\nimport { useFinancialPlan } from './contexts/FinancialPlanContext';"
);
content = content.replace(
  "import { createFinancialPlan, getActivePlan, updateFinancialPlan } from './services/financialPlanService';\n",
  ""
);

// 2. Remove states between `function App() { ...` and `// Handle logout`
const logoutIndex = content.indexOf('// Handle logout');
const startAppIndex = content.indexOf('function App() {');
const endOfHookDeclarations = content.indexOf('const { lg } = useBreakpoints();') + 'const { lg } = useBreakpoints();'.length;

const topChunk = content.substring(0, endOfHookDeclarations);
const bottomChunk = content.substring(logoutIndex);

const newHooks = `
  
  const { 
    loading, saving, lastSaved, planSyncError, setPlanReloadToken,
    currentStep, setCurrentStep, maxStep, handleStepProgression,
    insuranceMode, cashFlowSubStep, setCashFlowSubStep,
    handleLogoutCleanup, planId 
  } = useFinancialPlan();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [activeSection, setActiveSection] = useState('modules'); // 'modules' or 'calculators'
  const [activeCalculator, setActiveCalculator] = useState(null);

  `;

content = topChunk + newHooks + bottomChunk;

// 3. Update handleLogout inside bottomChunk
content = content.replace(
  `// Handle logout
  const handleLogout = async () => {
    setSaving(true);
    await savePlanData();
    await signOut();
    resetState(); // Clear data immediately after logout
  };`,
  `// Handle logout
  const handleLogout = async () => {
    await signOut();
    handleLogoutCleanup(); // Clear data immediately after logout
  };`
);

// 4. Remove massive prop drillings inside module renderings.
content = content.replace(/<ProfileModule\s+members=\{familyMembers\}\s+setMembers=\{setFamilyMembers\}\s+onNext=\{/g, '<ProfileModule\n                  onNext={');

content = content.replace(/<CashFlowModule\s+familyMembers=\{familyMembers\}\s+income=\{income\}\s+setIncome=\{setIncome\}\s+expenseCategories=\{expenseCategories\}\s+setExpenseCategories=\{setExpenseCategories\}\s+currentYearLedger=\{currentYearLedger\}\s+setCurrentYearLedger=\{setCurrentYearLedger\}\s+cashFlowSubStep=\{cashFlowSubStep\}\s+setCashFlowSubStep=\{setCashFlowSubStep\}\s+planStartMonth=\{planStartMonth\}\s+onNext=\{/g, '<CashFlowModule\n                  onNext={');

content = content.replace(/<AssetModule\s+assetCategories=\{assetCategories\}\s+setAssetCategories=\{setAssetCategories\}\s+liabilityCategories=\{liabilityCategories\}\s+setLiabilityCategories=\{setLiabilityCategories\}\s+onNext=\{/g, '<AssetModule\n                  onNext={');

content = content.replace(/<GoalModule\s+familyMembers=\{familyMembers\}\s+goals=\{goals\}\s+setGoals=\{setGoals\}\s+onNext=\{/g, '<GoalModule\n                  onNext={');

content = content.replace(/<InsuranceModule\s+familyMembers=\{familyMembers\}\s+policies=\{policies\}\s+setPolicies=\{setPolicies\}\s+expenseCategories=\{expenseCategories\}\s+setExpenseCategories=\{setExpenseCategories\}\s+investmentAllocations=\{investmentAllocations\}\s+onNext=\{/g, '<InsuranceModule\n                  onNext={');

content = content.replace(/<ProtectionGapModule\s+familyMembers=\{familyMembers\}\s+expenseCategories=\{expenseCategories\}\s+policies=\{policies\}\s+assetCategories=\{assetCategories\}\s+calculatorInputs=\{calculatorInputs\}\s+proposedSIPs=\{proposedSIPs\}\s+proposedEquities=\{proposedEquities\}\s+goals=\{goals\}\s+goalMappings=\{goalMappings\}\s+onNext=\{/g, '<ProtectionGapModule\n                  onNext={');

content = content.replace(/<ContingencyModule\s+expenseCategories=\{expenseCategories\}\s+contingencyFund=\{contingencyFund\}\s+setContingencyFund=\{setContingencyFund\}\s+onNext=\{/g, '<ContingencyModule\n                  onNext={');

content = content.replace(/<JourneyModule\s+familyMembers=\{familyMembers\}\s+income=\{income\}\s+expenseCategories=\{expenseCategories\}\s+goals=\{goals\}\s+inflationRates=\{inflationRates\}\s+setInflationRates=\{setInflationRates\}\s+journeyAdjustments=\{journeyAdjustments\}\s+setJourneyAdjustments=\{setJourneyAdjustments\}\s+policies=\{policies\}\s+projections=\{journeyProjections\}\s+onNext=\{/g, '<JourneyModule\n                  onNext={');

content = content.replace(/<AllocationModule\s+familyMembers=\{familyMembers\}\s+expenseCategories=\{expenseCategories\}\s+netInvestibleSurplus=\{\s*\(journeyProjections\.find\(p => p\.year === new Date\(\)\.getFullYear\(\)\)\)\?\.netInvestibleSurplus \|\| 0\s*\}\s+allocations=\{investmentAllocations\}\s+setAllocations=\{setInvestmentAllocations\}\s+projections=\{journeyProjections\}\s+planStartMonth=\{planStartMonth\}\s+onNext=\{/g, '<AllocationModule\n                  onNext={');

content = content.replace(/<GrowthModule\s+familyMembers=\{familyMembers\}\s+assetCategories=\{assetCategories\}\s+expenseCategories=\{expenseCategories\}\s+allocations=\{investmentAllocations\}\s+goals=\{goals\}\s+calculatorInputs=\{calculatorInputs\}\s+journeyProjections=\{journeyProjections\}\s+policies=\{policies\}\s+goalMappings=\{goalMappings\}\s+currentYearLedger=\{currentYearLedger\}\s+onNext=\{/g, '<GrowthModule\n                  onNext={');

content = content.replace(/<FulfillmentModule\s+familyMembers=\{familyMembers\}\s+goals=\{expandedGoals\}\s+allocations=\{investmentAllocations\}\s+goalMappings=\{goalMappings\}\s+setGoalMappings=\{setGoalMappings\}\s+expenseCategories=\{expenseCategories\}\s+calculatorInputs=\{calculatorInputs\}\s+assetCategories=\{assetCategories\}\s+loanProposals=\{loanProposals\}\s+setLoanProposals=\{setLoanProposals\}\s+allocationPlans=\{allocationPlans\}\s+setAllocationPlans=\{setAllocationPlans\}\s+onNext=\{/g, '<FulfillmentModule\n                  onNext={');

content = content.replace(/<ReportView\s+familyMembers=\{familyMembers\}\s+income=\{income\}\s+expenseCategories=\{expenseCategories\}\s+assetCategories=\{assetCategories\}\s+liabilityCategories=\{liabilityCategories\}\s+goals=\{expandedGoals\}\s+policies=\{policies\}\s+allocations=\{investmentAllocations\}\s+goalMappings=\{goalMappings\}\s+contingencyFund=\{contingencyFund\}\s+journeyAdjustments=\{journeyAdjustments\}\s+projections=\{journeyProjections\}\s+calculatorInputs=\{calculatorInputs\}\s+onBack=\{/g, '<ReportView\n                  onBack={');

// Remove props from calculcators too
content = content.replace(/<IncomeTaxModule[\s\S]*?isCalculatorMode=\{true\}\s*\/>/g, '<IncomeTaxModule isCalculatorMode={true} />');

content = content.replace(/<SIPCalculator[\s\S]*?setData=\{updateCalculatorData\('sip'\)\}\s*\/>/g, '<SIPCalculator calculatorKey="sip" />');
content = content.replace(/<PersonalLoanCalculator[\s\S]*?journeyAdjustments=\{journeyAdjustments\}\s*\/>/g, '<PersonalLoanCalculator calculatorKey="personal_loan" />');
content = content.replace(/<HomeLoanCalculator[\s\S]*?journeyAdjustments=\{journeyAdjustments\}\s*\/>/g, '<HomeLoanCalculator calculatorKey="home_loan" />');
content = content.replace(/<CarLoanCalculator[\s\S]*?journeyAdjustments=\{journeyAdjustments\}\s*\/>/g, '<CarLoanCalculator calculatorKey="car_loan" />');
content = content.replace(/<TwoWheelerCalculator[\s\S]*?journeyAdjustments=\{journeyAdjustments\}\s*\/>/g, '<TwoWheelerCalculator calculatorKey="two_wheeler_loan" />');
content = content.replace(/<EducationLoanCalculator[\s\S]*?loanProposals=\{loanProposals\}\s*\/>/g, '<EducationLoanCalculator calculatorKey="edu_loan" />');
content = content.replace(/<LumpsumCalculator[\s\S]*?setData=\{updateCalculatorData\('lumpsum'\)\}\s*\/>/g, '<LumpsumCalculator calculatorKey="lumpsum" />');
content = content.replace(/<EquityCalculator[\s\S]*?goals=\{expandedGoals\}\s*\/>/g, '<EquityCalculator calculatorKey="equity" />');
content = content.replace(/<PPFCalculator[\s\S]*?setData=\{\(val\) => setCalculatorInputs\(prev => \(\{ \.\.\.prev, ppf: val \}\)\)\}\s*\/>/g, '<PPFCalculator calculatorKey="ppf" />');
content = content.replace(/<NPSCalculator[\s\S]*?setData=\{\(val\) => setCalculatorInputs\(prev => \(\{ \.\.\.prev, nps: val \}\)\)\}\s*\/>/g, '<NPSCalculator calculatorKey="nps" />');
content = content.replace(/<FDCalculator[\s\S]*?setData=\{\(val\) => setCalculatorInputs\(prev => \(\{ \.\.\.prev, fd: val \}\)\)\}\s*\/>/g, '<FDCalculator calculatorKey="fd" />');
content = content.replace(/<RDCalculator[\s\S]*?setData=\{\(val\) => setCalculatorInputs\(prev => \(\{ \.\.\.prev, rd: val \}\)\)\}\s*\/>/g, '<RDCalculator calculatorKey="rd" />');
content = content.replace(/<SWPCalculator[\s\S]*?setData=\{\(val\) => setCalculatorInputs\(prev => \(\{ \.\.\.prev, swp: val \}\)\)\}\s*\/>/g, '<SWPCalculator calculatorKey="swp" />');


fs.writeFileSync(appPath, content);
console.log("App.jsx refactored successfully.");
