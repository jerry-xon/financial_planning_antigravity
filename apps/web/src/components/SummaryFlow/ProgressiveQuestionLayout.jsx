import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const steps = [
    { id: 'profile', label: 'Profile', path: '/summary-flow/profile' },
    { id: 'cashflow', label: 'Cash Flow', path: '/summary-flow/cashflow' },
    { id: 'savings', label: 'Savings', path: '/summary-flow/savings' },
    { id: 'assets', label: 'Assets', path: '/summary-flow/assets' },
    { id: 'liabilities', label: 'Liabilities', path: '/summary-flow/liabilities' },
    { id: 'goals', label: 'Goals', path: '/summary-flow/goals' }
];

const ProgressiveQuestionLayout = ({ 
    currentStepId, 
    stepName, 
    questions = [], 
    onComplete 
}) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

    const currentGlobalIndex = steps.findIndex(s => s.id === currentStepId);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        } else {
            if (onComplete) {
                onComplete();
            } else {
                const nextStep = steps[currentGlobalIndex + 1];
                if (nextStep) {
                    navigate(nextStep.path);
                } else {
                    navigate('/summary-report');
                }
            }
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        } else {
            const prevStep = steps[currentGlobalIndex - 1];
            if (prevStep) {
                navigate(prevStep.path);
            }
        }
    };

    // Animation variants for Framer Motion
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <div className="progressive-layout" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            {/* Top Breadcrumb Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '3rem' }}>
                {steps.map((step, idx) => {
                    const isActive = step.id === currentStepId;
                    const isPassed = idx < currentGlobalIndex;
                    return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span 
                                style={{ 
                                    color: isActive ? 'var(--primary)' : isPassed ? 'var(--text-main)' : 'var(--text-muted)',
                                    fontWeight: isActive ? '600' : 'normal',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    fontSize: '0.9rem'
                                }} 
                                onClick={() => navigate(step.path)}
                            >
                                {step.label}
                            </span>
                            {idx < steps.length - 1 && <span style={{ color: 'var(--border)', fontSize: '0.9rem' }}>→</span>}
                        </div>
                    );
                })}
            </div>

            {/* Step Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {stepName} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({questions.length} Questions)</span>
                </h1>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    QUESTION {currentIndex + 1} OF {questions.length}
                </p>
            </div>

            {/* Question Body with Animation */}
            <div style={{ position: 'relative', minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStepId + '-' + currentIndex} // Key must change to trigger animation
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }} // Smooth ease similar to PowerPoint
                        style={{ width: '100%', position: 'absolute' }}
                    >
                        {questions[currentIndex]?.content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dot Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
                {questions.map((_, idx) => (
                    <div 
                        key={idx} 
                        style={{ 
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: idx === currentIndex ? 'var(--primary)' : 'var(--border)',
                            transition: 'background 0.3s, transform 0.3s',
                            transform: idx === currentIndex ? 'scale(1.2)' : 'scale(1)'
                        }} 
                    />
                ))}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                <button 
                    className="btn btn-secondary" 
                    onClick={handleBack}
                    style={{ 
                        visibility: (currentGlobalIndex === 0 && currentIndex === 0) ? 'hidden' : 'visible', 
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', borderRadius: '50px'
                    }}
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={handleNext}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '50px' }}
                >
                    {(currentIndex === questions.length - 1 && currentGlobalIndex === steps.length - 1) ? 'Finish' : 'Next'} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ProgressiveQuestionLayout;
