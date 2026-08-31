import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Info, HelpCircle } from 'lucide-react';

const InteractiveTour = ({ isOpen, onClose, onStepChange, steps = [] }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0, fallback: true });
    const timerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            if (onStepChange) onStepChange(currentStep);
            
            // Continuous tracking for dynamic elements (accordions, etc)
            timerRef.current = setInterval(updatePosition, 100);
            
            if (steps[currentStep]) {
                const element = document.querySelector(steps[currentStep].target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen, currentStep, steps]);

    const updatePosition = () => {
        const step = steps[currentStep];
        const element = document.querySelector(step.target);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Only update if changed to avoid unnecessary re-renders
            if (rect.top !== coords.top || rect.left !== coords.left || rect.width !== coords.width || coords.fallback) {
                setCoords({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    fallback: false
                });
            }
        } else if (!coords.fallback) {
            setCoords(prev => ({ ...prev, fallback: true }));
        }
    };

    if (!isOpen) return null;

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
            setCurrentStep(0);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Calculate tooltip position based on target and position preference
    const getTooltipStyle = () => {
        const gap = 30;
        const tourWidth = 320;
        const tourHeight = 220; 
        
        if (coords.fallback || steps[currentStep].position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed'
            };
        }

        let top = coords.top;
        let left = coords.left;

        switch (steps[currentStep].position) {
            case 'bottom':
                top = coords.top + coords.height + gap;
                left = coords.left + (coords.width / 2) - (tourWidth / 2);
                break;
            case 'top':
                top = coords.top - gap - tourHeight;
                left = coords.left + (coords.width / 2) - (tourWidth / 2);
                break;
            case 'right':
                top = coords.top + (coords.height / 2) - (tourHeight / 2);
                left = coords.left + coords.width + gap;
                break;
            case 'left':
                top = coords.top + (coords.height / 2) - (tourHeight / 2);
                left = coords.left - tourWidth - gap;
                break;
            default:
                break;
        }

        // Keep within bounds
        left = Math.max(20, Math.min(window.innerWidth - tourWidth - 20, left));
        top = Math.max(20, Math.min(window.innerHeight - 300, top));

        return { top, left, position: 'fixed' };
    };

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Backdrop with hole */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-all pointer-events-auto" onClick={onClose} style={{
                clipPath: coords.fallback ? 'none' : `polygon(
                    0% 0%, 0% 100%, 
                    ${coords.left}px 100%, 
                    ${coords.left}px ${coords.top}px, 
                    ${coords.left + coords.width}px ${coords.top}px, 
                    ${coords.left + coords.width}px ${coords.top + coords.height}px, 
                    ${coords.left}px ${coords.top + coords.height}px, 
                    ${coords.left}px 100%, 
                    100% 100%, 100% 0%
                )`
            }} />

            {/* Target Highlight Ring */}
            {!coords.fallback && steps[currentStep].position !== 'center' && (
                <div 
                    className="absolute border-2 border-blue-500 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse"
                    style={{
                        top: coords.top - 4,
                        left: coords.left - 4,
                        width: coords.width + 8,
                        height: coords.height + 8,
                        position: 'fixed'
                    }}
                />
            )}

            {/* Tooltip Card */}
            <div 
                className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-6 shadow-2xl w-[320px] pointer-events-auto animate-in zoom-in-95 duration-200"
                style={getTooltipStyle()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-600/20 p-2 rounded-xl">
                        <HelpCircle size={20} className="text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentStep + 1} / {steps.length}</span>
                        <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white transition">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase italic leading-tight">
                    {steps[currentStep].title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                    {steps[currentStep].content}
                </p>

                <div className="flex items-center gap-3">
                    {currentStep > 0 && (
                        <button 
                            onClick={prevStep}
                            className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <button 
                        onClick={nextStep}
                        className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
                    >
                        {currentStep === steps.length - 1 ? '¡Listo!' : 'Siguiente'}
                        {currentStep < steps.length - 1 && <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Arrow Pointer */}
                {!coords.fallback && steps[currentStep].position !== 'center' && (
                    <div 
                        className={`absolute w-4 h-4 bg-slate-900 border-l border-t border-slate-700/50 rotate-45 transition-all`}
                        style={{
                            display: steps[currentStep].position === 'bottom' ? 'block' : 'none',
                            top: -9,
                            left: '50%',
                            marginLeft: -8
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default InteractiveTour;
