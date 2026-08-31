import React, { useState, useMemo } from 'react';
import { Search, Music, Clock, FileText, ChevronRight, X, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

const SEATabLibrary = ({ items, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');

    // Filtrar solo items que tengan contenido de tablatura
    const tabItems = useMemo(() => {
        return items.filter(item => item.practiceTab && item.practiceTab.trim() !== '');
    }, [items]);

    const filteredItems = useMemo(() => {
        return tabItems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [tabItems, searchTerm, activeCategory]);

    const getCategoryIcon = (catId) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return cat ? cat.icon : Music;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
            {/* SEARCH HEADER */}
            <div className="p-4 border-b border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar tablaturas..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 ring-blue-500 outline-none transition"
                        />
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button 
                        onClick={() => setActiveCategory('ALL')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${activeCategory === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                    >
                        Todas
                    </button>
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                        <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-50">No se encontraron tablaturas</p>
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const Icon = getCategoryIcon(item.category);
                        return (
                            <button 
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className="w-full text-left bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl transition group flex items-center gap-4"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-900 border border-slate-800 group-hover:border-blue-500/30 transition`}>
                                    <Icon className="text-blue-500" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition truncate">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {item.artist && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{item.artist}</span>}
                                        {item.artist && <span className="w-1 h-1 rounded-full bg-slate-800" />}
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                            {item.practiceTab.split(' ').length} notas
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-500 transition translate-x-0 group-hover:translate-x-1" />
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SEATabLibrary;
