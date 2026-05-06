import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore, Terminology } from '../store/auditStore';
import { ChevronLeft, Plus, Trash2, Image as ImageIcon, Search, Book, X } from 'lucide-react';

const TerminologyPage = () => {
  const navigate = useNavigate();
  const { terminology, addTerm, deleteTerm } = useAuditStore();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');

  const filteredTerms = terminology.filter(t => 
    t.word.toLowerCase().includes(search.toLowerCase()) || 
    t.definition.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newWord || !newDef) return;
    const term: Terminology = {
      id: Date.now().toString(),
      word: newWord,
      definition: newDef,
    };
    addTerm(term);
    setNewWord('');
    setNewDef('');
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#0A0F1E] px-6 pt-16 pb-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <button onClick={() => navigate('/profile')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-white text-xl font-[900] italic uppercase tracking-tight">Strategic Glossary</h1>
              <p className="text-[#C9A84C] text-[8px] font-black uppercase tracking-[3px] mt-1">Enterprise Terminology</p>
            </div>
            <button onClick={() => setIsAdding(true)} className="w-10 h-10 bg-[#C9A84C] rounded-xl flex items-center justify-center text-[#0A0F1E] active:scale-90 transition-all">
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="mt-10 relative z-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Knowledge Base..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-xs font-bold placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
              />
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((term) => (
              <div key={term.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#C9A84C] rounded-full" />
                    <h3 className="text-[#0A0F1E] font-[900] text-lg uppercase italic tracking-tight">{term.word}</h3>
                  </div>
                  <button 
                    onClick={() => deleteTerm(term.id)}
                    className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  {term.definition}
                </p>
                {term.imageUri && (
                  <div className="mt-6 rounded-2xl overflow-hidden border border-slate-100 aspect-video bg-slate-50">
                    <img src={term.imageUri} alt={term.word} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
              <Book size={48} className="mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[4px]">No matches found</p>
            </div>
          )}
        </main>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-[#0A0F1E]/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-[900] text-[#0A0F1E] italic uppercase leading-none">Add Term</h3>
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-[3px] mt-2">Expansion of Knowledge</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-slate-400 text-[9px] font-black uppercase tracking-[3px] mb-3 block ml-1">Strategic Term</label>
                <input 
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="e.g. Planogram"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C] transition-all"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[9px] font-black uppercase tracking-[3px] mb-3 block ml-1">Definition</label>
                <textarea 
                  value={newDef}
                  onChange={(e) => setNewDef(e.target.value)}
                  placeholder="Provide a professional definition..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C] transition-all resize-none"
                />
              </div>
              <button 
                onClick={handleAdd}
                className="w-full bg-[#C9A84C] text-[#0A0F1E] py-6 rounded-3xl font-black text-lg uppercase italic tracking-tight shadow-xl active:scale-[0.98] transition-all mt-4"
              >
                Index New Term
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminologyPage;
