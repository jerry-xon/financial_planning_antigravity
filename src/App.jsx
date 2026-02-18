import { LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import AssetModule from './components/AssetModule/AssetModule';
import RoleBasedRouting from './components/Auth/RoleBasedRouting';
import CashFlowModule from './components/CashFlowModule/CashFlowModule';
import ContingencyModule from './components/ContingencyModule/ContingencyModule';
import GoalModule from './components/GoalModule/GoalModule';
import InsuranceModule from './components/InsuranceModule/InsuranceModule';
import JourneyModule from './components/JourneyModule/JourneyModule';
import ProfileModule from './components/ProfileModule/ProfileModule';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectionGapModule from './components/ProtectionGapModule/ProtectionGapModule';
import ReportView from './components/ReportModule/ReportView';
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

  // State for Family Profile details
  const [familyMembers, setFamilyMembers] = useState([
    {
      name: '',
      dob: '',
      occupation: '',
      retirementAge: 60,
      relation: 'Self'
    }
  ]);

  // Cash Flow State
  const [income, setIncome] = useState({
    family: '',
    bonus: '',
    passive: '',
    other: ''
  });
  const [expenseCategories, setExpenseCategories] = useState({
    household: { grocery: '', rent: '', education: '', lifestyle: '', medical: '', travel: '' },
    emi: { personalLoan: '', homeLoan: '', educationLoan: '', otherEmi: '', healthInsurance: '', carInsurance: '', bikeInsurance: '', otherInsurance: '' },
    savings: { rd: '', fd: '', lifeInsurance: '', ppf: '', savingSchemes: '', mfSip: '', otherSaving: '' }
  });

  // Asset State
  const [assetCategories, setAssetCategories] = useState({
    equity: { stocks: '', mfEquity: '' },
    debt: { ppf: '', fd: '' },
    realEstate: { residence: '', investmentProp: '' },
    others: { gold: '', others: '' }
  });
  const [liabilityCategories, setLiabilityCategories] = useState({
    loans: { home: '', car: '', other: '' }
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

  // --- Load Financial Plan from Supabase ---
  useEffect(() => {
    const loadPlan = async () => {
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
        setFamilyMembers(data.family_members && data.family_members.length > 0 ? data.family_members : [{ name: '', dob: '', occupation: '', retirementAge: 60, relation: 'Self' }]);
        setIncome(data.income || { family: '', bonus: '', passive: '', other: '' });
        
        // Merge loaded expense_categories with default structure
        const defaultExpenseCategories = {
          household: { grocery: '', rent: '', education: '', lifestyle: '', medical: '', travel: '' },
          emi: { personalLoan: '', homeLoan: '', educationLoan: '', otherEmi: '', healthInsurance: '', carInsurance: '', bikeInsurance: '', otherInsurance: '' },
          savings: { rd: '', fd: '', lifeInsurance: '', ppf: '', savingSchemes: '', mfSip: '', otherSaving: '' }
        };
        const loadedExpenseCategories = data.expense_categories || {};
        const mergedExpenseCategories = {
          household: { ...defaultExpenseCategories.household, ...(loadedExpenseCategories.household || {}) },
          emi: { ...defaultExpenseCategories.emi, ...(loadedExpenseCategories.emi || {}) },
          savings: { ...defaultExpenseCategories.savings, ...(loadedExpenseCategories.savings || {}) }
        };
        setExpenseCategories(mergedExpenseCategories);
        
        // Merge loaded asset_categories with default structure
        const defaultAssetCategories = {
          equity: { stocks: '', mfEquity: '' },
          debt: { ppf: '', fd: '' },
          realEstate: { residence: '', investmentProp: '' },
          others: { gold: '', others: '' }
        };
        const loadedAssetCategories = data.asset_categories || {};
        const mergedAssetCategories = {
          equity: { ...defaultAssetCategories.equity, ...(loadedAssetCategories.equity || {}) },
          debt: { ...defaultAssetCategories.debt, ...(loadedAssetCategories.debt || {}) },
          realEstate: { ...defaultAssetCategories.realEstate, ...(loadedAssetCategories.realEstate || {}) },
          others: { ...defaultAssetCategories.others, ...(loadedAssetCategories.others || {}) }
        };
        setAssetCategories(mergedAssetCategories);
        
        // Merge loaded liability_categories with default structure
        const defaultLiabilityCategories = { loans: { home: '', car: '', other: '' } };
        const loadedLiabilityCategories = data.liability_categories || {};
        const mergedLiabilityCategories = {
          loans: { ...defaultLiabilityCategories.loans, ...(loadedLiabilityCategories.loans || {}) }
        };
        setLiabilityCategories(mergedLiabilityCategories);
        
        setGoals(data.goals || []);
        setPolicies(data.policies || []);
        setContingencyFund(data.contingency_fund || '');
        setInflationRates(data.inflation_rates || { incomeIncrement: 10, householdInflation: 6, educationInflation: 8 });
      }
      
      setLoading(false);
    };

    loadPlan();
  }, [user]);

  // --- Save to Supabase with debouncing ---
  useEffect(() => {
    if (!planId || loading) return;

    setSaving(true);
    const timeoutId = setTimeout(async () => {
      await updateFinancialPlan(planId, {
        current_step: currentStep,
        family_members: familyMembers,
        income,
        expense_categories: expenseCategories,
        asset_categories: assetCategories,
        liability_categories: liabilityCategories,
        goals,
        policies,
        contingency_fund: parseFloat(contingencyFund) || 0,
        inflation_rates: inflationRates
      });
      setSaving(false);
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [planId, loading, currentStep, familyMembers, income, expenseCategories, assetCategories, liabilityCategories, goals, policies, contingencyFund, inflationRates]);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
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
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>FinPlan</h1>
          <nav style={{ marginLeft: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              className={`btn ${currentStep === 1 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(1)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              1. Profile
            </button>
            <button
              className={`btn ${currentStep === 2 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(2)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              2. Cash Flow
            </button>
            <button
              className={`btn ${currentStep === 3 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(3)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              3. Assets
            </button>
            <button
              className={`btn ${currentStep === 4 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(4)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              4. Goals
            </button>
            <button
              className={`btn ${currentStep === 5 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(5)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              5. Insurance
            </button>
            <button
              className={`btn ${currentStep === 6 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(6)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              6. Protection Gap
            </button>
            <button
              className={`btn ${currentStep === 7 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(7)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              7. Contingency
            </button>
            <button
              className={`btn ${currentStep === 8 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(8)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              8. Journey
            </button>
            <button
              className={`btn ${currentStep === 9 ? 'btn-primary' : ''}`}
              onClick={() => setCurrentStep(9)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              9. Overview
            </button>
          </nav>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {saving && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Saving...
              </span>
            )}
            <span style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              background: 'var(--border)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>PWA v1.0</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ 
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <User size={16} />
                {user?.email}
              </span>
              <button
                className="btn"
                onClick={handleLogout}
                style={{ 
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: '1px solid var(--border)'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area - Renders the module corresponding to the current step */}
        <main>
          {currentStep === 1 && (
            <ProfileModule
              members={familyMembers}
              setMembers={setFamilyMembers}
              onNext={() => { setCurrentStep(2); window.scrollTo(0, 0); }}
            />
          )}
          {currentStep === 2 && (
            <CashFlowModule
              income={income}
              setIncome={setIncome}
              expenseCategories={expenseCategories}
              setExpenseCategories={setExpenseCategories}
              onNext={() => { setCurrentStep(3); window.scrollTo(0, 0); }}
              onBack={() => { setCurrentStep(1); window.scrollTo(0, 0); }}
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
              onNext={() => { setCurrentStep(6); window.scrollTo(0, 0); }}
              onBack={() => { setCurrentStep(4); window.scrollTo(0, 0); }}
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
              onNext={() => { setCurrentStep(9); window.scrollTo(0, 0); }}
            />
          )}
          {currentStep === 9 && (
            <ReportView
              familyMembers={familyMembers}
              income={income}
              expenseCategories={expenseCategories}
              assetCategories={assetCategories}
              liabilityCategories={liabilityCategories}
              goals={goals}
              policies={policies}
            />
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
