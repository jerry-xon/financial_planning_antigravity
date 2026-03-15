import { LogOut, User } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import AssetModule from './components/AssetModule/AssetModule';
import RoleBasedRouting from './components/Auth/RoleBasedRouting';
import CashFlowModule from './components/CashFlowModule/CashFlowModule';
import ContingencyModule from './components/ContingencyModule/ContingencyModule';
import GoalModule from './components/GoalModule/GoalModule';
import InsuranceModule from './components/InsuranceModule/InsuranceModule';
import IncomeTaxModule from './components/IncomeTaxModule/IncomeTaxModule';
import JourneyModule from './components/JourneyModule/JourneyModule';
import { generateProjections } from './components/JourneyModule/ProjectionLogic';
import ProfileModule from './components/ProfileModule/ProfileModule';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectionGapModule from './components/ProtectionGapModule/ProtectionGapModule';
import AllocationModule from './components/AllocationModule/AllocationModule';
import GrowthModule from './components/GrowthModule/GrowthModule';
import FulfillmentModule from './components/FulfillmentModule/FulfillmentModule';
import ReportView from './components/ReportModule/ReportView';
import CalculatorPlaceholder from './components/Calculators/CalculatorPlaceholder';
import SIPCalculator from './components/Calculators/SIPCalculator';
import PersonalLoanCalculator from './components/Calculators/PersonalLoanCalculator';
import HomeLoanCalculator from './components/Calculators/HomeLoanCalculator';
import CarLoanCalculator from './components/Calculators/CarLoanCalculator';
import LumpsumCalculator from './components/Calculators/LumpsumCalculator';
import SWPCalculator from './components/Calculators/SWPCalculator';
import { useAuth } from './contexts/AuthContext';
import { signOut } from './services/authService';
import { getActivePlan, updateFinancialPlan } from './services/financialPlanService';

/**
 * Main App Component
 * 
 * This component manages the overall state for the financial planning application,
 * including family profile, cash flow, assets, goals, insurance, and contingency funds.
 * It uses a step-based navigation to guide the user through the planning process.
 */
function App() {
  const { user } = useAuth();
  
  // Supabase plan ID
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for tracking the current navigation step (1-9)
  const [currentStep, setCurrentStep] = useState(1);

  // New states for Secondary Navigation (Calculators)
  const [activeSection, setActiveSection] = useState('modules'); // 'modules' or 'calculators'
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [insuranceMode, setInsuranceMode] = useState(null); // 'accurate' or 'anyway'

  // State for Family Profile details
  const [familyMembers, setFamilyMembers] = useState([
    {
      name: '',
      dob: '',
      occupation: '',
      retirementAge: 60,
      relation: 'Self',
      natureOfBusiness: '',
      organizationName: '',
      educationalQualification: '',
      mobile: '',
    }
  ]);

  // Cash Flow State
  const [income, setIncome] = useState({
    self: '',
    selfBonus: '',
    selfPassive: '',
    selfOther: '',
    spouse: '',
    spouseBonus: '',
    spousePassive: '',
    spouseOther: '',
    bonus: '', // Keep for sync/migration
    passive: '',
    other: ''
  });
  const [expenseCategories, setExpenseCategories] = useState({
    household: { grocery: '', rent: '', education: '', lifestyle: '', medical: '', travel: '' },
    emi: { personalLoan: '', homeLoan: '', educationLoan: '', otherEmi: '' },
    insurance: {
      health: { value: '', frequency: 'Annual' },
      car: { value: '', frequency: 'Annual' },
      bike: { value: '', frequency: 'Annual' },
      life: {},
      others: { value: '', frequency: 'Annual' }
    },
    savings: { rd: '', fd: '', ppf: '', savingSchemes: '', mfSip: '', otherSaving: '' }
  });

  // Asset State
  const [assetCategories, setAssetCategories] = useState({
    realEstate: { residential: '', secondProperty: '', landPlot: '' },
    vehicles: { idv: '' },
    valuables: { gold: '', art: '' },
    cash: { savings: '' },
    investments: { equity: '', mutualFunds: '', fixedDeposit: '', recurringDeposit: '' },
    insurance: { savingPlans: '', ulip: '' },
    retirement: { epf: '', ppf: '', nps: '' },
    others: { other: '' },
    custom: []
  });
  const [liabilityCategories, setLiabilityCategories] = useState({
    loans: { home: '', personal: '', car: '', education: '', otherEmis: '', creditCard: '' },
    custom: []
  });

  // Goals State
  const [goals, setGoals] = useState([]);

  // Insurance State
  const [policies, setPolicies] = useState([]);

  // Contingency State
  const [contingencyFund, setContingencyFund] = useState('');

  // Journey/Inflation State
  const [inflationRates, setInflationRates] = useState({
    incomeIncrement: 10,
    householdInflation: 6,
    educationInflation: 8
  });
  const [journeyAdjustments, setJourneyAdjustments] = useState([]);
  const [investmentAllocations, setInvestmentAllocations] = useState([]);
  const [goalMappings, setGoalMappings] = useState({});

  // Calculator Persistence State
  const [calculatorInputs, setCalculatorInputs] = useState({
    personal_loan: { amount: 0, rate: 10.5, tenure: 5, events: [] },
    home_loan: { amount: 0, rate: 8.5, tenure: 20, events: [] },
    car_loan: { amount: 0, rate: 9.5, tenure: 5, events: [] },
    lumpsum: { amount: 0, rate: 12, tenure: 10, events: [] },
    swp: { amount: 0, withdrawal: 0, rate: 10, tenure: 15, events: [] },
    sip: { amount: 0, rate: 12, tenure: 10, increments: [] }
  });

  // --- Reset All State ---
  const resetState = () => {
    setPlanId(null);
    setCurrentStep(1);
    setActiveSection('modules');
    setActiveCalculator(null);
    setInsuranceMode(null);
    setSaving(false);
    setFamilyMembers([
      {
        name: '',
        dob: '',
        occupation: '',
        retirementAge: 60,
        relation: 'Self',
        natureOfBusiness: '',
        organizationName: '',
        educationalQualification: '',
        mobile: '',
      }
    ]);
    setIncome({
      self: '',
      selfBonus: '',
      selfPassive: '',
      selfOther: '',
      spouse: '',
      spouseBonus: '',
      spousePassive: '',
      spouseOther: '',
      bonus: '',
      passive: '',
      other: ''
    });
    setExpenseCategories({
      household: { grocery: '', rent: '', education: '', lifestyle: '', medical: '', travel: '' },
      emi: { personalLoan: '', homeLoan: '', educationLoan: '', otherEmi: '' },
      insurance: {
        health: { value: '', frequency: 'Annual' },
        car: { value: '', frequency: 'Annual' },
        bike: { value: '', frequency: 'Annual' },
        life: {},
        others: { value: '', frequency: 'Annual' }
      },
      savings: { rd: '', fd: '', ppf: '', savingSchemes: '', mfSip: '', otherSaving: '' }
    });
    setAssetCategories({
      realEstate: { residential: '', secondProperty: '', landPlot: '' },
      vehicles: { idv: '' },
      valuables: { gold: '', art: '' },
      cash: { savings: '' },
      investments: { equity: '', mutualFunds: '', fixedDeposit: '', recurringDeposit: '' },
      insurance: { savingPlans: '', ulip: '' },
      retirement: { epf: '', ppf: '', nps: '' },
      others: { other: '' },
      custom: []
    });
    setLiabilityCategories({
      loans: { home: '', personal: '', car: '', education: '', otherEmis: '', creditCard: '' },
      custom: []
    });
    setGoals([]);
    setPolicies([]);
    setContingencyFund('');
    setInflationRates({
      incomeIncrement: 10,
      householdInflation: 6,
      educationInflation: 8
    });
    setJourneyAdjustments([]);
    setInvestmentAllocations([]);
    setGoalMappings({});
    setCalculatorInputs({
      personal_loan: { amount: 0, rate: 10.5, tenure: 5, events: [] },
      home_loan: { amount: 0, rate: 8.5, tenure: 20, events: [] },
      car_loan: { amount: 0, rate: 9.5, tenure: 5, events: [] },
      lumpsum: { amount: 0, rate: 12, tenure: 10, events: [] },
      swp: { amount: 0, withdrawal: 0, rate: 10, tenure: 15, events: [] },
      sip: { amount: 0, rate: 12, tenure: 10, increments: [] }
    });
  };

  // --- Load Financial Plan from Supabase ---
  useEffect(() => {
    const loadPlan = async () => {
      // First, reset local state to ensure no stale data remains
      resetState();

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await getActivePlan();
      
      if (error) {
        console.error('Error loading plan from Supabase:', error);
        console.log('Using default/cached data...');
        // Continue without setting planId - will use default state
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Successfully loaded plan:', data.id);
        setPlanId(data.id);
        setCurrentStep(data.current_step || 1);
        setInsuranceMode(data.insurance_mode || null);
        setFamilyMembers(data.family_members && data.family_members.length > 0 
          ? data.family_members.map(m => ({ ...m, mobile: m.mobile || '' })) 
          : [{ name: '', dob: '', occupation: '', retirementAge: 60, relation: 'Self', mobile: '' }]);
        const loadedIncome = data.income || {};
        
        // Handle migration from old flat structure to new per-person structure
        const migrationIncome = {
            self: loadedIncome.self ?? loadedIncome.family ?? '',
            selfBonus: loadedIncome.selfBonus ?? loadedIncome.bonus ?? '',
            selfPassive: loadedIncome.selfPassive ?? loadedIncome.passive ?? '',
            selfOther: loadedIncome.selfOther ?? loadedIncome.other ?? '',
            spouse: loadedIncome.spouse ?? '',
            spouseBonus: loadedIncome.spouseBonus ?? '',
            spousePassive: loadedIncome.spousePassive ?? '',
            spouseOther: loadedIncome.spouseOther ?? ''
        };
        
        setIncome(migrationIncome);
        
        // Merge loaded expense_categories with default structure
        const defaultExpenseCategories = {
          household: { grocery: '', rent: '', education: '', lifestyle: '', medical: '', travel: '' },
          emi: { personalLoan: '', homeLoan: '', educationLoan: '', otherEmi: '' },
          insurance: {
            health: { value: '', frequency: 'Annual' },
            car: { value: '', frequency: 'Annual' },
            bike: { value: '', frequency: 'Annual' },
            life: {},
            others: { value: '', frequency: 'Annual' }
          },
          savings: { rd: '', fd: '', ppf: '', savingSchemes: '', mfSip: '', otherSaving: '' }
        };
        const loadedExpenseCategories = data.expense_categories || {};
        
        // Migration logic for insurance and savings
        const loadedInsurance = loadedExpenseCategories.insurance || {};
        
        // Ensure life premiums are migrated to a member-specific structure if they exist in old format
        let migratedLife = {};
        const selfMember = (data.family_members || []).find(m => m.relation === 'Self') || { name: '', relation: 'Self' };
        const selfKey = selfMember.name || selfMember.relation;

        if (loadedInsurance.life && typeof loadedInsurance.life === 'object' && 'value' in loadedInsurance.life) {
            // Check if it actually has members (already partially migrated or polluted)
            const hasMembers = Object.keys(loadedInsurance.life).some(k => k !== 'value' && k !== 'frequency');
            if (hasMembers) {
                // Keep only the members
                migratedLife = { ...loadedInsurance.life };
                delete migratedLife.value;
                delete migratedLife.frequency;
            } else {
                // Pure old format
                migratedLife = { [selfKey]: { value: loadedInsurance.life.value, frequency: loadedInsurance.life.frequency || 'Annual' } };
            }
        } else if (loadedInsurance.life) {
            // Already a member-specific object, but check for 'Self' pollution if name exists
            migratedLife = { ...loadedInsurance.life };
            if (selfMember.name && migratedLife['Self']) {
                if (!migratedLife[selfMember.name]) {
                    migratedLife[selfMember.name] = migratedLife['Self'];
                }
                delete migratedLife['Self'];
            }
        }

        const migratedInsurance = {
            health: loadedInsurance.health || { value: loadedExpenseCategories.emi?.healthInsurance || '', frequency: 'Annual' },
            car: loadedInsurance.car || { value: loadedExpenseCategories.emi?.carInsurance || '', frequency: 'Annual' },
            bike: loadedInsurance.bike || { value: loadedExpenseCategories.emi?.bikeInsurance || '', frequency: 'Annual' },
            life: migratedLife,
            others: loadedInsurance.others || { value: loadedExpenseCategories.emi?.otherInsurance || '', frequency: 'Annual' }
        };

        const mergedExpenseCategories = {
          household: { ...defaultExpenseCategories.household, ...(loadedExpenseCategories.household || {}) },
          emi: { 
            personalLoan: loadedExpenseCategories.emi?.personalLoan ?? '',
            homeLoan: loadedExpenseCategories.emi?.homeLoan ?? '',
            educationLoan: loadedExpenseCategories.emi?.educationLoan ?? '',
            otherEmi: loadedExpenseCategories.emi?.otherEmi ?? ''
          },
          insurance: migratedInsurance,
          savings: { 
            ...defaultExpenseCategories.savings, 
            ...(loadedExpenseCategories.savings || {})
          }
        };
        // Explicitly remove lifeInsurance if it exists in loaded savings
        delete mergedExpenseCategories.savings.lifeInsurance;
        
        setExpenseCategories(mergedExpenseCategories);
        
        // Merge loaded asset_categories with default structure
        const defaultAssetCategories = {
          realEstate: { residential: '', secondProperty: '', landPlot: '' },
          vehicles: { idv: '' },
          valuables: { gold: '', art: '' },
          cash: { savings: '' },
          investments: { equity: '', mutualFunds: '', fixedDeposit: '', recurringDeposit: '' },
          insurance: { savingPlans: '', ulip: '' },
          retirement: { epf: '', ppf: '', nps: '' },
          others: { other: '' },
          custom: []
        };
        const loadedAssetCategories = data.asset_categories || {};
        
        // Surgical migration: Only map known fields and avoid polluting with old top-level keys
        const migratedAssetCategories = {
          ...defaultAssetCategories,
          realEstate: { 
            ...defaultAssetCategories.realEstate, 
            ...(loadedAssetCategories.realEstate || {}),
            residential: loadedAssetCategories.realEstate?.residential || loadedAssetCategories.realEstate?.residence || '',
            secondProperty: loadedAssetCategories.realEstate?.secondProperty || loadedAssetCategories.realEstate?.investmentProp || ''
          },
          vehicles: { ...defaultAssetCategories.vehicles, ...(loadedAssetCategories.vehicles || {}) },
          valuables: { 
            ...defaultAssetCategories.valuables, 
            ...(loadedAssetCategories.valuables || {}),
            gold: loadedAssetCategories.valuables?.gold || loadedAssetCategories.others?.gold || ''
          },
          cash: { ...defaultAssetCategories.cash, ...(loadedAssetCategories.cash || {}) },
          investments: {
            ...defaultAssetCategories.investments,
            ...(loadedAssetCategories.investments || {}),
            equity: loadedAssetCategories.investments?.equity || loadedAssetCategories.equity?.stocks || '',
            mutualFunds: loadedAssetCategories.investments?.mutualFunds || loadedAssetCategories.equity?.mfEquity || '',
            fixedDeposit: loadedAssetCategories.investments?.fixedDeposit || loadedAssetCategories.debt?.fd || ''
          },
          insurance: { ...defaultAssetCategories.insurance, ...(loadedAssetCategories.insurance || {}) },
          retirement: {
            ...defaultAssetCategories.retirement,
            ...(loadedAssetCategories.retirement || {}),
            ppf: loadedAssetCategories.retirement?.ppf || loadedAssetCategories.debt?.ppf || ''
          },
          others: {
            ...defaultAssetCategories.others,
            ...(loadedAssetCategories.others || {}),
            other: loadedAssetCategories.others?.other || loadedAssetCategories.others?.others || ''
          },
          custom: Array.isArray(loadedAssetCategories.custom) ? loadedAssetCategories.custom : []
        };
        setAssetCategories(migratedAssetCategories);
        
        // Merge loaded liability_categories with default structure
        const defaultLiabilityCategories = { 
          loans: { home: '', personal: '', car: '', education: '', otherEmis: '', creditCard: '' },
          custom: []
        };
        const loadedLiabilityCategories = data.liability_categories || {};
        const migratedLiabilityCategories = {
          loans: { 
            ...defaultLiabilityCategories.loans, 
            ...(loadedLiabilityCategories.loans || {}),
            // Map old keys if they exist and new ones are empty
            home: loadedLiabilityCategories.loans?.home || '',
            car: loadedLiabilityCategories.loans?.car || '',
            otherEmis: loadedLiabilityCategories.loans?.otherEmis || loadedLiabilityCategories.loans?.other || ''
          },
          custom: Array.isArray(loadedLiabilityCategories.custom) ? loadedLiabilityCategories.custom : []
        };

        // Final cleanup: remove ghost keys that might have been accidentally merged via spread
        delete migratedLiabilityCategories.loans.other; 

        setLiabilityCategories(migratedLiabilityCategories);
        
        setGoals(data.goals || []);
        setPolicies(data.policies || []);
        setContingencyFund(data.contingency_fund || '');
        setInflationRates(data.inflation_rates || { incomeIncrement: 10, householdInflation: 6, educationInflation: 8 });
        setJourneyAdjustments(data.journey_adjustments || []);
        setInvestmentAllocations(data.investment_allocations || []);
        setGoalMappings(data.goal_mappings || {});
        if (data.calculator_inputs) {
            setCalculatorInputs(data.calculator_inputs);
        }
      }
      
      setLoading(false);
    };

    loadPlan();
  }, [user]);

  const journeyProjections = useMemo(() => {
    if (!familyMembers.find(m => m.relation?.toLowerCase() === 'self')) return [];
    return generateProjections({
      familyMembers,
      income,
      expenseCategories,
      goals,
      inflationRates,
      journeyAdjustments,
      investmentAllocations,
      policies
    });
  }, [familyMembers, income, expenseCategories, goals, inflationRates, journeyAdjustments, investmentAllocations, policies]);

  const savePlanData = async () => {
    if (!planId) return;
    try {
      console.log('Attemping to save plan...', planId);
      const { data, error } = await updateFinancialPlan(planId, {
        current_step: currentStep,
        family_members: familyMembers,
        income,
        expense_categories: expenseCategories,
        asset_categories: assetCategories,
        liability_categories: liabilityCategories,
        goals,
        policies,
        contingency_fund: parseFloat(contingencyFund) || 0,
        inflation_rates: inflationRates,
        journey_adjustments: journeyAdjustments,
        investment_allocations: investmentAllocations,
        goal_mappings: goalMappings,
        insurance_mode: insuranceMode,
        calculator_inputs: calculatorInputs
      });
      
      if (error) {
          console.error('Save failed with error:', error);
      } else {
          console.log('Save successful at:', new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Save crashed with exception:', err);
    }
  };

  // --- Save to Supabase with debouncing ---
  useEffect(() => {
    if (!planId || loading) return;

    setSaving(true);
    const timeoutId = setTimeout(async () => {
      await savePlanData();
      setSaving(false);
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [planId, loading, currentStep, familyMembers, income, expenseCategories, assetCategories, liabilityCategories, goals, policies, contingencyFund, inflationRates, journeyAdjustments, investmentAllocations, goalMappings, insuranceMode, calculatorInputs]);

  // Handle logout
  const handleLogout = async () => {
    setSaving(true);
    await savePlanData();
    await signOut();
    resetState(); // Clear data immediately after logout
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <RoleBasedRouting>
      <ProtectedRoute>
        <div className="app-container">
        <header style={{
          height: 'auto',
          padding: '1rem 0',
          borderBottom: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>FinPlan</h1>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {saving && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saving...</span>}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '4px' }}>PWA v1.1</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} /> {user?.email}
                </span>
                <button className="btn" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--border)' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Primary Nav: Planning Modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', width: '100px' }}>Process</span>
              <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  'Profile', 'Cash Flow', 'Assets', 'Goals', 'Insurance', 
                  'Protection Gap', 'Contingency', 'Journey', 'Allocation', 'Growth', 'Roadmap', 'Overview'
                ].map((name, idx) => (
                  <button
                    key={name}
                    className={`btn ${activeSection === 'modules' && currentStep === idx + 1 ? 'btn-primary' : ''}`}
                    disabled={name === 'Insurance' && insuranceMode === 'anyway'}
                    onClick={() => {
                      setCurrentStep(idx + 1);
                      setActiveSection('modules');
                    }}
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem', 
                      whiteSpace: 'nowrap',
                      opacity: name === 'Insurance' && insuranceMode === 'anyway' ? 0.5 : 1,
                      cursor: name === 'Insurance' && insuranceMode === 'anyway' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {idx + 1}. {name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Secondary Nav: Calculators */}
            <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', width: '100px' }}>Calculators</span>
              <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'tax', label: 'Income Tax' },
                  { id: 'sip', label: 'SIP' },
                  { id: 'per_loan', label: 'Personal Loan' },
                  { id: 'home_loan', label: 'Home Loan' },
                  { id: 'car_loan', label: 'Car Loan' },
                  { id: 'lumpsum', label: 'Lumpsum' },
                  { id: 'swp', label: 'SWP' }
                ].map((calc) => (
                  <button
                    key={calc.id}
                    className={`btn ${activeSection === 'calculators' && activeCalculator === calc.id ? 'btn-primary' : ''}`}
                    onClick={() => {
                      setActiveCalculator(calc.id);
                      setActiveSection('calculators');
                    }}
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem', 
                      whiteSpace: 'nowrap',
                      background: activeSection === 'calculators' && activeCalculator === calc.id ? 'var(--primary)' : 'var(--bg-card)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {calc.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main>
          {activeSection === 'modules' ? (
            <>
              {currentStep === 1 && (
                <ProfileModule
                  members={familyMembers}
                  setMembers={setFamilyMembers}
                  onNext={() => { setCurrentStep(2); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 2 && (
                <CashFlowModule
                  familyMembers={familyMembers}
                  income={income}
                  setIncome={setIncome}
                  expenseCategories={expenseCategories}
                  setExpenseCategories={setExpenseCategories}
                  onNext={() => { setCurrentStep(3); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(1); window.scrollTo(0, 0); }}
                  setCurrentStep={setCurrentStep}
                />
              )}
              {currentStep === 3 && (
                <AssetModule
                  assetCategories={assetCategories}
                  setAssetCategories={setAssetCategories}
                  liabilityCategories={liabilityCategories}
                  setLiabilityCategories={setLiabilityCategories}
                  onNext={() => { setCurrentStep(4); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(2); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 4 && (
                <GoalModule
                  familyMembers={familyMembers}
                  goals={goals}
                  setGoals={setGoals}
                  onNext={() => { setCurrentStep(5); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(3); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 5 && (
                <InsuranceModule
                  familyMembers={familyMembers}
                  policies={policies}
                  setPolicies={setPolicies}
                  expenseCategories={expenseCategories}
                  setExpenseCategories={setExpenseCategories}
                  investmentAllocations={investmentAllocations}
                  onNext={() => { setCurrentStep(6); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(4); window.scrollTo(0, 0); }}
                  setCurrentStep={setCurrentStep}
                />
              )}
              {currentStep === 6 && (
                <ProtectionGapModule
                  familyMembers={familyMembers}
                  expenseCategories={expenseCategories}
                  policies={policies}
                  onNext={() => { setCurrentStep(7); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(5); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 7 && (
                <ContingencyModule
                  expenseCategories={expenseCategories}
                  contingencyFund={contingencyFund}
                  setContingencyFund={setContingencyFund}
                  onNext={() => { setCurrentStep(8); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(6); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 8 && (
                <JourneyModule
                  familyMembers={familyMembers}
                  income={income}
                  expenseCategories={expenseCategories}
                  goals={goals}
                  inflationRates={inflationRates}
                  setInflationRates={setInflationRates}
                  journeyAdjustments={journeyAdjustments}
                  setJourneyAdjustments={setJourneyAdjustments}
                  policies={policies}
                  projections={journeyProjections}
                  onNext={() => { setCurrentStep(9); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(7); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 9 && (
                <AllocationModule
                  familyMembers={familyMembers}
                  netInvestibleSurplus={
                    (journeyProjections.find(p => p.year === new Date().getFullYear()))?.netInvestibleSurplus || 0
                  }
                  allocations={investmentAllocations}
                  setAllocations={setInvestmentAllocations}
                  projections={journeyProjections}
                  onNext={() => { setCurrentStep(10); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(8); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 10 && (
                <GrowthModule
                  familyMembers={familyMembers}
                  assetCategories={assetCategories}
                  expenseCategories={expenseCategories}
                  allocations={investmentAllocations}
                  goals={goals}
                  onNext={() => { setCurrentStep(11); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(9); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 11 && (
                <FulfillmentModule
                  goals={goals}
                  allocations={investmentAllocations}
                  goalMappings={goalMappings}
                  setGoalMappings={setGoalMappings}
                  onNext={() => { setCurrentStep(12); window.scrollTo(0, 0); }}
                  onBack={() => { setCurrentStep(10); window.scrollTo(0, 0); }}
                />
              )}
              {currentStep === 12 && (
                <ReportView
                  familyMembers={familyMembers}
                  income={income}
                  expenseCategories={expenseCategories}
                  assetCategories={assetCategories}
                  liabilityCategories={liabilityCategories}
                  goals={goals}
                  policies={policies}
                  allocations={investmentAllocations}
                  goalMappings={goalMappings}
                  onBack={() => { setCurrentStep(11); window.scrollTo(0, 0); }}
                />
              )}
            </>
          ) : (
            <>
              {activeCalculator === 'tax' && (
                <IncomeTaxModule
                  familyMembers={familyMembers}
                  income={income}
                  isCalculatorMode={true}
                />
              )}
              {activeCalculator === 'sip' && (
                <SIPCalculator 
                  expenseCategories={expenseCategories} 
                  assetCategories={assetCategories} 
                  familyMembers={familyMembers}
                  proposedSIPs={investmentAllocations.filter(a => ['SIP', 'PPF', 'NPS'].includes(a.type))}
                  data={calculatorInputs.sip}
                  setData={(val) => setCalculatorInputs(prev => ({ ...prev, sip: val }))}
                />
              )}
              {activeCalculator === 'per_loan' && (
                <PersonalLoanCalculator 
                  data={calculatorInputs.personal_loan}
                  setData={(val) => setCalculatorInputs(prev => ({ ...prev, personal_loan: val }))}
                />
              )}
              {activeCalculator === 'home_loan' && (
                <HomeLoanCalculator 
                  data={calculatorInputs.home_loan}
                  setData={(val) => setCalculatorInputs(prev => ({ ...prev, home_loan: val }))}
                />
              )}
              {activeCalculator === 'car_loan' && (
                <CarLoanCalculator 
                  data={calculatorInputs.car_loan}
                  setData={(val) => setCalculatorInputs(prev => ({ ...prev, car_loan: val }))}
                />
              )}
              {activeCalculator === 'lumpsum' && (
                <LumpsumCalculator 
                  familyMembers={familyMembers} 
                  proposedLumpsums={investmentAllocations.filter(a => !['SIP', 'PPF', 'NPS'].includes(a.type))}
                  data={calculatorInputs.lumpsum}
                  setData={(val) => setCalculatorInputs(prev => ({ ...prev, lumpsum: val }))}
                />
              )}
              {activeCalculator === 'swp' && (
                <SWPCalculator 
                  data={calculatorInputs.swp}
                  setData={(val) => setCalculatorInputs(prev => ({ ...prev, swp: val }))}
                />
              )}
            </>
          )}
        </main>

        <footer style={{
          marginTop: '4rem',
          padding: '2rem 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          borderTop: '1px solid var(--border)'
        }}>
          © 2026 FinPlan - Comprehensive Financial Planning Report
        </footer>
      </div>
      </ProtectedRoute>
    </RoleBasedRouting>
  );
}

export default App;
