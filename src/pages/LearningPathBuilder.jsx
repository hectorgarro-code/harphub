import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Plus, Trash2, GripVertical, 
    Save, Eye, Settings, Music, BookOpen, 
    Award, Clock, CheckCircle2, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function LearningPathBuilder() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [pathData, setPathData] = useState({
        title: '',
        description: '',
        difficulty: 'beginner',
        instrument: 'harmonica',
        visibility: 'public'
    });
    
    const [nodes, setNodes] = useState([]);
    const [availableLessons, setAvailableLessons] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchInitialData();
    }, [user, id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch user's lessons to add to path
            const lessons = await api.request('lessons', 'GET', { user_id: user.id });
            setAvailableLessons(Array.isArray(lessons) ? lessons : []);

            if (id) {
                const res = await api.getLearningPath(id, user.id);
                if (res.success) {
                    setPathData({
                        title: res.path.title,
                        description: res.path.description,
                        difficulty: res.path.difficulty,
                        instrument: res.path.instrument,
                        visibility: res.path.visibility
                    });
                    setNodes(res.nodes);
                }
            }
        } catch (error) {
            console.error("Error fetching builder data:", error);
        } finally {
            setLoading(false);
        }
    };

    const addNode = (lesson) => {
        const newNode = {
            entity_type: 'lesson',
            entity_id: lesson.id,
            entity_title: lesson.title,
            entity_difficulty: lesson.difficulty,
            milestone: 0,
            notes: ''
        };
        setNodes([...nodes, newNode]);
    };

    const removeNode = (index) => {
        const newNodes = [...nodes];
        newNodes.splice(index, 1);
        setNodes(newNodes);
    };

    const updateNode = (index, field, value) => {
        const newNodes = [...nodes];
        newNodes[index][field] = value;
        setNodes(newNodes);
    };

    const handleSave = async () => {
        if (!pathData.title) return alert("El título es obligatorio");
        setIsSaving(true);
        try {
            const res = await api.saveLearningPath({
                ...pathData,
                creator_id: user.id,
                id: id,
                nodes: nodes
            });
            if (res.success) {
                alert("¡Ruta guardada con éxito!");
                navigate(`/path/${res.id}`);
            }
        } catch (error) {
            console.error("Error saving path:", error);
            alert("Error al guardar la ruta");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center gap-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Preparando el Estudio de Rutas...</p>
        </div>
    );

    return (
        <div className="flex-1 bg-slate-950 min-h-screen flex flex-col">
            {/* Top Toolbar */}
            <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-white transition">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Editor de Rutas Viva</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-blue-900/40 disabled:opacity-50"
                        >
                            <Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10">
                {/* Left Column: Metadata */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 p-8">
                        <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-8">Información General</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Título de la Ruta</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500/50 transition"
                                    placeholder="Ej: Blues Mastery 101"
                                    value={pathData.title}
                                    onChange={e => setPathData({...pathData, title: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Descripción</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500/50 transition min-h-[120px] resize-none"
                                    placeholder="Describe el viaje musical..."
                                    value={pathData.description}
                                    onChange={e => setPathData({...pathData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Instrumento</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500/50 transition appearance-none"
                                        value={pathData.instrument}
                                        onChange={e => setPathData({...pathData, instrument: e.target.value})}
                                    >
                                        <option value="harmonica">Armónica</option>
                                        <option value="piano">Piano</option>
                                        <option value="guitar">Guitarra</option>
                                        <option value="ukelele">Ukelele</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dificultad</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500/50 transition appearance-none"
                                        value={pathData.difficulty}
                                        onChange={e => setPathData({...pathData, difficulty: e.target.value})}
                                    >
                                        <option value="beginner">Principiante</option>
                                        <option value="intermediate">Intermedio</option>
                                        <option value="advanced">Avanzado</option>
                                        <option value="master">Maestro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Visibilidad</label>
                                <div className="flex gap-2">
                                    {['public', 'private'].map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => setPathData({...pathData, visibility: v})}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition border ${
                                                pathData.visibility === v ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'
                                            }`}
                                        >
                                            {v === 'public' ? 'Público' : 'Privado'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 p-8">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                            Tus Lecciones
                            <span className="text-[10px] text-slate-600">{availableLessons.length}</span>
                        </h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {availableLessons.map(lesson => (
                                <div 
                                    key={lesson.id} 
                                    className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition cursor-pointer"
                                    onClick={() => addNode(lesson)}
                                >
                                    <div className="truncate pr-4">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">{lesson.instrument}</p>
                                        <p className="text-xs font-bold text-white truncate">{lesson.title}</p>
                                    </div>
                                    <button className="p-2 bg-slate-900 text-slate-500 group-hover:text-blue-500 rounded-lg transition">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Node Sequence */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-900/30 rounded-[3rem] border border-dashed border-white/10 p-10 min-h-full">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Secuencia de Aprendizaje</h3>
                                <p className="text-slate-500 font-bold text-sm">Arrastra para reordenar el camino del estudiante.</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {nodes.length} NODOS
                            </div>
                        </div>

                        {nodes.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center text-slate-600 mb-6">
                                    <BookOpen size={32} />
                                </div>
                                <h4 className="text-xl font-black text-white mb-2">Tu ruta está vacía</h4>
                                <p className="text-slate-500 font-bold max-w-xs">Agrega lecciones desde el panel lateral para empezar a construir el camino.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 relative">
                                {/* Visual Path Line */}
                                <div className="absolute left-6 top-10 bottom-10 w-[2px] bg-slate-800/50"></div>
                                
                                {nodes.map((node, index) => (
                                    <div key={index} className="relative flex gap-6 group">
                                        {/* Node Index */}
                                        <div className="relative z-10 w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 font-black text-xs shrink-0 group-hover:border-blue-500 group-hover:text-white transition">
                                            {index + 1}
                                        </div>

                                        {/* Node Card */}
                                        <div className="flex-1 bg-slate-900/80 rounded-[2rem] border border-white/5 p-6 group-hover:border-white/10 transition">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="truncate pr-8">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{node.entity_type}</span>
                                                        {node.milestone == 1 && (
                                                            <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                                                <Award size={10} /> Milestone
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-lg font-black text-white truncate">{node.entity_title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => updateNode(index, 'milestone', node.milestone ? 0 : 1)}
                                                        className={`p-2 rounded-xl transition ${node.milestone ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-600 hover:text-slate-400'}`}
                                                        title="Marcar como Hito"
                                                    >
                                                        <Award size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => removeNode(index)}
                                                        className="p-2 bg-slate-800 text-slate-600 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <textarea 
                                                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-slate-400 text-xs font-bold outline-none focus:border-blue-500/30 transition min-h-[60px] resize-none"
                                                    placeholder="Notas u objetivos para este paso..."
                                                    value={node.notes}
                                                    onChange={e => updateNode(index, 'notes', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <button className="ml-18 flex items-center gap-3 px-6 py-4 bg-slate-900/50 hover:bg-slate-900 border border-dashed border-white/10 rounded-[2rem] text-slate-600 hover:text-blue-500 transition w-full justify-center">
                                    <Plus size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Arrastra o haz clic en una lección para continuar</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
