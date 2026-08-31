import React, { useState, useEffect } from 'react';
import { X, Folder, Save, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const CollectionModal = ({ isOpen, onClose, user, onCreated, collection = null }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [loading, setLoading] = useState(false);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    useEffect(() => {
        if (collection) {
            setTitle(collection.title || '');
            setDescription(collection.description || '');
            setVisibility(collection.visibility || 'private');
            setCoverPreview(collection.cover_image ? (collection.cover_image.startsWith('http') ? collection.cover_image : `http://localhost/harphub/${collection.cover_image}`) : null);
        } else {
            setTitle('');
            setDescription('');
            setVisibility('private');
            setCoverPreview(null);
        }
        setCoverFile(null);
    }, [collection, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('action', 'save_collection');
            formData.append('user_id', user.id);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('visibility', visibility);
            if (collection?.id) formData.append('id', collection.id);
            if (coverFile) formData.append('cover_image', coverFile);

            const res = await api.request('save_collection', 'POST', formData);
            if (res.success) {
                onCreated();
                window.dispatchEvent(new CustomEvent('collections-updated'));
                onClose();
            }
        } catch (error) {
            console.error("Error saving collection:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
                
                {/* Image Preview / Upload Area */}
                <div className="w-full md:w-72 bg-slate-950 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative group">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {coverPreview ? (
                        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                            <img src={coverPreview} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon className="text-white" size={32} />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 group-hover:border-blue-500/50 group-hover:text-blue-500 transition-all bg-slate-900/50">
                            <ImageIcon size={40} className="mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Subir Carátula</span>
                        </div>
                    )}
                    <div className="mt-6 text-center">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Medida Sugerida</p>
                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">800 x 600 px</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                                <Folder size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">{collection ? 'Editar Colección' : 'Nueva Colección'}</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{collection ? 'Modifica los detalles' : 'Organiza tu conocimiento'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block">Título</label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: Repertorio Blues 2024"
                                required
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 ring-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block">Descripción</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="¿De qué trata esta colección?"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 ring-blue-500 transition h-24 resize-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block">Visibilidad</label>
                            <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5">
                                {['private', 'public', 'remixable'].map(v => (
                                    <button 
                                        key={v}
                                        type="button"
                                        onClick={() => setVisibility(v)}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${visibility === v ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-600 hover:text-slate-400'}`}
                                    >
                                        {v === 'private' ? 'Privada' : v === 'public' ? 'Pública' : 'Editable'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            Guardar Cambios
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CollectionModal;
