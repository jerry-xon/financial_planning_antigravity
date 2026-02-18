import React, { useState } from 'react';
import ProfileModule from './components/ProfileModule/ProfileModule';
import CashFlowModule from './components/CashFlowModule/CashFlowModule';
import AssetModule from './components/AssetModule/AssetModule';
import GoalModule from './components/GoalModule/GoalModule';
import InsuranceModule from './components/InsuranceModule/InsuranceModule';
import ProtectionGapModule from './components/ProtectionGapModule/ProtectionGapModule';
import ContingencyModule from './components/ContingencyModule/ContingencyModule';
import JourneyModule from './components/JourneyModule/JourneyModule';
import ReportView from './components/ReportModule/ReportView';

//I am learning with Jayesh

/**
 * Main App Component
 * 
 * This component manage the overall state for the financial planning application,
 * including family profile, cash flow, assets, goals, insurance, and contingency funds.
 * It uses a step-based navigation to guide the user through the planning process.
 */
function App() {
  // State for tracking the current navigation step (1-8)
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

  // Phase 1: Journey Inflation Rates State
  const [inflationRates, setInflationRates] = useState({
    incomeIncrement: 10,
    householdInflation: 6,
    educationInflation: 8
  });

  // --- Data Persistence Effects ---

  // Load state from local storage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('finplan_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.familyMembers) setFamilyMembers(state.familyMembers);
        if (state.income) setIncome(state.income);
        if (state.expenseCategories) setExpenseCategories(state.expenseCategories);
        if (state.assetCategories) setAssetCategories(state.assetCategories);
        if (state.liabilityCategories) setLiabilityCategories(state.liabilityCategories);
        if (state.goals) setGoals(state.goals);
        if (state.policies) setPolicies(state.policies);
        if (state.contingencyFund) setContingencyFund(state.contingencyFund);
        if (state.inflationRates) setInflationRates(state.inflationRates);
        if (state.currentStep) setCurrentStep(state.currentStep);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save state to local storage whenever any relevant state changes
  React.useEffect(() => {
    const state = {
      familyMembers,
      income,
      expenseCategories,
      assetCategories,
      liabilityCategories,
      goals,
      policies,
      contingencyFund,
      inflationRates,
      currentStep
    };
    localStorage.setItem('finplan_state', JSON.stringify(state));
  }, [familyMembers, income, expenseCategories, assetCategories, liabilityCategories, goals, policies, contingencyFund, inflationRates, currentStep]);

  return (
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
            6. Protection Gap Analysis
          </button>
          <button
            className={`btn ${currentStep === 7 ? 'btn-primary' : ''}`}
            onClick={() => setCurrentStep(7)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            7. Contingency Fund
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
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          background: 'var(--border)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>PWA v1.0</span>
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
  );
}

export default App;
