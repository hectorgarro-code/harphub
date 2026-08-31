import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Layout, Wrench, Mic2, Star, Zap, GraduationCap } from 'lucide-react';

const HelpTutorialModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "¡Bienvenido a HarpHub!",
            description: "Tu ecosistema digital para el estudio profundo de la armónica blues. Vamos a darte un tour rápido por las herramientas.",
            icon: <Mic2 className="text-blue-500" size={48} />,
            color: "blue"
        },
        {
            title: "Dashboard de Lecciones",
            description: "Aquí encontrarás todo tu material. Puedes ver la dificultad (estrellas), la tonalidad de la armónica y si ya completaste la lección.",
            icon: <Layout className="text-emerald-500" size={48} />,
            color: "emerald"
        },
        {
            title: "Herramientas de Blues",
            description: "En la barra lateral tienes acceso al Blues Degree (plan de estudios), Rutinas de práctica, Editor de Tabs y Detector de Tonos.",
            icon: <Wrench className="text-amber-500" size={48} />,
            color: "amber"
        },
        {
            title: "Práctica Interactiva",
            description: "Las lecciones incluyen video con bookmarks inteligentes o partituras interactivas de Guitar Pro para que estudies a tu ritmo.",
            icon: <Play className="text-rose-500" size={48} />,
            color: "rose"
        },
        {
            title: "Plan de Estudios",
            description: "Sigue el 'Blues Degree' para avanzar de nivel de forma estructurada, desde principiante hasta avanzado.",
            icon: <GraduationCap className="text-indigo-500" size={48} />,
            color: "indigo"
        }
    ];

    if (!isOpen) return null;

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Progress Bar */}
                <div className="flex gap-1 p-2 bg-slate-950/50">
                    {steps.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-blue-500' : 'bg-slate-800'}`}
                        />
                    ))}
                </div>

                <div className="p-8 sm:p-12 text-center">
                    {/* Icon Container */}
                    <div className={`w-24 h-24 mx-auto rounded-3xl bg-${steps[currentStep].color}-500/10 flex items-center justify-center mb-8 animate-bounce`}>
                        {steps[currentStep].icon}
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight mb-4">
                        {steps[currentStep].title}
                    </h2>
                    
                    <p className="text-slate-400 text-lg leading-relaxed mb-10">
                        {steps[currentStep].description}
                    </p>

                    <div className="flex items-center gap-4">
                        {currentStep > 0 && (
                            <button 
                                onClick={prevStep}
                                className="h-16 px-6 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        
                        <button 
                            onClick={nextStep}
                            className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition"
                        >
                            {currentStep === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
                            {currentStep < steps.length - 1 && <ChevronRight size={20} />}
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-8 text-center">
                    <button 
                        onClick={onClose}
                        className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition"
                    >
                        Saltar tutorial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpTutorialModal;
