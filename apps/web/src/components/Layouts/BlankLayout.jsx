import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, Users, ArrowRightLeft, PiggyBank, Wallet, TrendingDown, Target, ArrowRight, Save, Check, ChevronRight } from 'lucide-react';
import { useFinancialPlan } from '../../contexts/FinancialPlanContext';
import { useAuth } from '../../contexts/AuthContext';
import finbrellaLogo from '../../assets/finbrella_logo.png';

const steps = [
    { id: 'profile', label: 'Profile', path: '/summary-flow/profile', icon: Users },
    { id: 'cashflow', label: 'Cash Flow', path: '/summary-flow/cashflow', icon: ArrowRightLeft },
    { id: 'savings', label: 'Savings', path: '/summary-flow/savings', icon: PiggyBank },
    { id: 'assets', label: 'Assets', path: '/summary-flow/assets', icon: Wallet },
    { id: 'liabilities', label: 'Liabilities', path: '/summary-flow/liabilities', icon: TrendingDown },
    { id: 'goals', label: 'Goals', path: '/summary-flow/goals', icon: Target },
];

const BlankLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { saving, lastSaved, familyMembers } = useFinancialPlan();
    const { user } = useAuth();

    const currentPath = location.pathname;
    const currentStepIndex = steps.findIndex(s => currentPath.includes(s.id));
    const isStepCompleted = (stepIndex) => stepIndex < currentStepIndex;

    const selfMember = familyMembers?.find(m => m.relation === 'Self');
    const userInitials = selfMember?.name
        ? selfMember.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (user?.email?.[0]?.toUpperCase() || 'U');

    const isSummaryFlow = currentPath.startsWith('/summary-flow');

    if (!isSummaryFlow) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', background: 'var(--bg-main)' }}>
                <Outlet />
            </div>
        );
    }

    return (
        <div className="summary-shell">
            {/* Sticky Header */}
            <header className="summary-header">
                <div className="summary-header-logo">
                    <img src={finbrellaLogo} alt="Finbrella" />
                </div>
                <div className="summary-header-right">
                    {saving && (
                        <div className="summary-save-indicator">
                            <Save size={13} /> Saving...
                        </div>
                    )}
                    {!saving && lastSaved && (
                        <div className="summary-save-indicator">
                            <Check size={13} /> Saved
                        </div>
                    )}
                    <button className="summary-profile-btn" title="Profile">
                        {userInitials || <User size={18} />}
                    </button>
                </div>
            </header>

            {/* Horizontal Step Navigation — below header */}
            <nav className="summary-horizontal-nav">
                {steps.map((step, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isCompleted = isStepCompleted(idx);
                    const StepIcon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            {idx > 0 && (
                                <span className="summary-step-separator">
                                    <ChevronRight size={14} />
                                </span>
                            )}
                            <div
                                className={`summary-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                onClick={() => navigate(step.path)}
                            >
                                <div className="summary-step-icon">
                                    <StepIcon size={14} />
                                </div>
                                <span>{step.label}</span>
                                {isCompleted && (
                                    <div className="summary-step-complete-arrow">
                                        <ArrowRight size={14} />
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
            </nav>

            <div className="summary-body">
                {/* Main Content — full width */}
                <main className="summary-content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BlankLayout;
