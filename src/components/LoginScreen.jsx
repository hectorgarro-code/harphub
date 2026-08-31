import React, { useState } from 'react';
import { Mic2, User, Lock, Mail, ChevronRight, Chrome, ArrowRight, Music, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const LoginScreen = ({ onLogin, onGoogleLogin, loading, onBack }) => {
    console.log("LoginScreen Render", { hasOnLogin: !!onLogin, loading });
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submit pressed", { username, isRegistering });
        if (isRegistering && !agreeTerms) {
            alert("Debes aceptar los términos y condiciones.");
            return;
        }
        onLogin(username, password, isRegistering, email);
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0f1d] flex items-center justify-center relative overflow-hidden font-sans p-4">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
            
            {/* Decoractive floating elements */}
            <div className="absolute top-20 right-[15%] text-blue-500/20 rotate-12 hidden lg:block"><Music size={120} /></div>
            <div className="absolute bottom-20 left-[10%] text-indigo-500/10 -rotate-12 hidden lg:block"><ShieldCheck size={100} /></div>

            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10">
                
                {/* Left Side: Branding & Info (Hidden on small mobile if needed, but here we keep it nice) */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-10 border border-white/20 shadow-xl">
                            <Mic2 size={32} className="text-white" />
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
                            Domina la <br /> Armónica <span className="text-blue-200">Blues</span>
                        </h1>
                        <p className="text-blue-100/80 text-xl font-medium leading-relaxed max-w-sm">
                            Únete a la comunidad más grande de armonicistas y lleva tu sonido al siguiente nivel.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center text-blue-300 font-bold">01</div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">Plan de Estudios Estructurado</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center text-blue-300 font-bold">02</div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">Herramientas de Práctica Pro</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center text-blue-300 font-bold">03</div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">Comunidad & Feedback</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="p-8 sm:p-16 flex flex-col justify-center bg-slate-900/60">
                    <div className="lg:hidden flex items-center justify-between mb-10 w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Mic2 size={24} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">HarpHub</h2>
                        </div>
                        {onBack && (
                            <button onClick={onBack} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition">Volver</button>
                        )}
                    </div>
                    
                    {/* Desktop Back Button */}
                    <div className="hidden lg:block mb-8">
                        {onBack && (
                            <button onClick={onBack} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition flex items-center gap-2 group">
                                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Volver al Inicio
                            </button>
                        )}
                    </div>

                    <div className="mb-10">
                        <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                            {isRegistering ? 'Crea tu cuenta' : '¡Bienvenido de nuevo!'}
                        </h3>
                        <p className="text-slate-500 font-medium">
                            {isRegistering ? 'Únete a miles de armonicistas hoy.' : 'Inicia sesión para continuar practicando.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block ml-1">Nombre de Usuario</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. SonnyBoy22"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:ring-2 ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            {isRegistering && (
                                <div className="relative animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block ml-1">Email (Opcional)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:ring-2 ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block">Contraseña</label>
                                    {!isRegistering && <button type="button" className="text-[10px] uppercase font-black text-blue-500 hover:text-blue-400 transition">¿Olvidaste tu clave?</button>}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:ring-2 ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {isRegistering && (
                            <div className="flex items-center gap-3 px-1 animate-in fade-in duration-500">
                                <button 
                                    type="button" 
                                    onClick={() => setAgreeTerms(!agreeTerms)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${agreeTerms ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-950 border-slate-800'}`}
                                >
                                    {agreeTerms && <ChevronRight size={14} className="text-white" />}
                                </button>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Acepto los términos de la red social HarpHub</p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-2xl font-black text-sm shadow-xl shadow-blue-900/40 text-white flex items-center justify-center gap-3 uppercase tracking-widest group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isRegistering ? 'Crear mi cuenta' : 'Entrar ahora'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10">
                        <div className="relative mb-10 text-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                            <span className="relative bg-[#0c1527] px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">O continuar con</span>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    if (onGoogleLogin) {
                                        onGoogleLogin(credentialResponse.credential);
                                    }
                                }}
                                onError={() => {
                                    console.error('Google Login Failed');
                                    alert('Error al iniciar sesión con Google.');
                                }}
                                theme="filled_black"
                                size="large"
                                width="300"
                                text="continue_with"
                                shape="pill"
                            />
                        </div>
                    </div>

                    <div className="mt-12 text-center pt-8 border-t border-slate-800/50">
                        <p className="text-sm text-slate-500 font-medium">
                            {isRegistering ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
                        </p>
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-blue-500 font-black hover:text-blue-400 transition text-sm mt-2 uppercase tracking-widest"
                        >
                            {isRegistering ? 'Entrar a tu cuenta' : 'Regístrate Gratis'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Footer info */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 HarpHub Social</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Privacidad</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Términos</span>
            </div>
        </div>
    );
};

export default LoginScreen;
