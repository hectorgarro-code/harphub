import React, { useMemo } from 'react';

export default function PracticeContributionGraph({ dailyData }) {
    // Generate last 365 days of empty data
    const days = useMemo(() => {
        const today = new Date();
        const arr = [];
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const session = dailyData?.find(s => s.date === dateStr);
            arr.push({
                date: dateStr,
                minutes: session ? parseInt(session.minutes) : 0
            });
        }
        return arr;
    }, [dailyData]);

    const getColor = (minutes) => {
        if (minutes === 0) return 'bg-slate-900';
        if (minutes < 15) return 'bg-blue-900/40';
        if (minutes < 30) return 'bg-blue-700/60';
        if (minutes < 60) return 'bg-blue-500';
        return 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]';
    };

    // Group days by weeks (7 days each)
    const weeks = useMemo(() => {
        const w = [];
        for (let i = 0; i < days.length; i += 7) {
            w.push(days.slice(i, i + 7));
        }
        return w;
    }, [days]);

    return (
        <div className="bg-slate-950/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mapa de Esfuerzo Musical</h3>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Menos</span>
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-slate-900" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-blue-900/40" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-blue-700/60" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Más</span>
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-4 custom-scrollbar">
                {weeks.map((week, widx) => (
                    <div key={widx} className="flex flex-col gap-1 shrink-0">
                        {week.map((day, didx) => (
                            <div 
                                key={day.date}
                                title={`${day.date}: ${day.minutes} min`}
                                className={`w-3 h-3 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-help ${getColor(day.minutes)}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase tracking-widest pt-2">
                <span>Hace un año</span>
                <span>Hoy</span>
            </div>
        </div>
    );
}
