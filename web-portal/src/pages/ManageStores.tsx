import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore, StoreBrand } from '../store/auditStore';
import { locationData } from '../data/locationData';
import { ChevronLeft, Plus, Trash2, Edit3, RefreshCw, X, CheckCircle2, Store, Search, Home, ClipboardCheck, User as UserIcon, ChevronDown } from 'lucide-react';

const ManageStores = () => {
  const navigate = useNavigate();
  const { customStores, addCustomStore, deleteCustomStore, updateStore } = useAuditStore();

  const [isAddExpanded, setIsAddExpanded] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newBrand, setNewBrand] = useState<StoreBrand>('Sunglass Hut');
  const [newCity, setNewCity] = useState('Bengaluru');

  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState<StoreBrand>('Sunglass Hut');
  const [editCity, setEditCity] = useState('Bengaluru');

  const allStores = useMemo(() => {
    const defaults = locationData["Karnataka"]["Bengaluru"];
    const combined = [...(customStores || []), ...defaults];
    const unique = [];
    const seen = new Set();
    for (const s of combined) {
      if (!seen.has(s.code)) {
        seen.add(s.code);
        unique.push(s);
      }
    }
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [customStores]);

  const handleAddStore = () => {
    if (!newName || !newCode) return;
    addCustomStore({ name: newName, code: newCode, brand: newBrand, city: newCity });
    setNewName('');
    setNewCode('');
    setIsAddExpanded(false);
  };

  const handleUpdate = () => {
    if (!editingCode) return;
    updateStore(editingCode, { name: editName, brand: editBrand, city: editCity });
    setEditingCode(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#0A0F1E] px-6 pt-16 pb-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A84C]/5 rounded-full blur-[60px] -mr-24 -mt-24" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
             <button onClick={() => navigate('/profile')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#C9A84C] active:scale-95 transition-all">
                <ChevronLeft size={24} />
             </button>
             <p className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[4px] opacity-60">Fleet Registry</p>
          </div>

          <h1 className="text-white text-4xl font-[900] tracking-tighter italic uppercase leading-tight relative z-10">
            Store<br/>Management
          </h1>
        </header>

        <main className="p-6 space-y-8">
          {/* Add Section */}
          <section>
            <button 
              onClick={() => setIsAddExpanded(!isAddExpanded)}
              className="w-full bg-[#0A0F1E] p-6 rounded-3xl flex items-center justify-between shadow-xl group active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center text-[#C9A84C]">
                  <Plus size={24} strokeWidth={3} />
                </div>
                <span className="text-white font-black text-xs uppercase tracking-widest">Register New Location</span>
              </div>
              <ChevronDown size={18} className={`text-white/20 transition-transform ${isAddExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isAddExpanded && (
              <div className="mt-4 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm animate-in slide-in-from-top duration-300">
                <div className="flex gap-2 mb-4">
                  {(['Sunglass Hut', 'LensCrafters'] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setNewBrand(b)}
                      className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${newBrand === b ? 'bg-[#0A0F1E] text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-8">
                  {(['Bengaluru', 'Delhi/Gurgaon', 'Mumbai'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setNewCity(c)}
                      className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${newCity === c ? 'bg-[#C9A84C] text-slate-900' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Store Name (e.g. Phoenix Mall)" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold text-slate-800 outline-none focus:border-[#C9A84C]/30 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Store Identification Code" 
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold text-slate-800 outline-none focus:border-[#C9A84C]/30 transition-all"
                  />
                  <button 
                    onClick={handleAddStore}
                    className="w-full bg-[#C9A84C] h-14 rounded-2xl font-black text-[10px] uppercase tracking-[3px] text-[#0A0F1E] shadow-lg active:scale-95 transition-all mt-4"
                  >
                    Authorize Location
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* List Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2 mb-4">
               <h2 className="text-slate-400 text-[9px] font-black uppercase tracking-[3px]">Active Registry</h2>
               <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{allStores.length} Stores</span>
            </div>

            {allStores.map(store => (
              <div key={store.code} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 group relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${store.brand === 'LensCrafters' ? 'bg-blue-500' : 'bg-[#C9A84C]'}`} />
                      <span className="text-slate-400 text-[8px] font-black uppercase tracking-widest">{store.brand}</span>
                    </div>
                    <h3 className="text-[#0A0F1E] font-[900] text-xl tracking-tight leading-tight italic uppercase">
                      {store.brand === 'LensCrafters' ? (store.name.split(',')[1]?.trim() || store.name) : store.name.split(',')[0]}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                     <button 
                      onClick={() => { setEditingCode(store.code); setEditName(store.name); setEditBrand(store.brand); setEditCity(store.city || 'Bengaluru'); }}
                      className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:bg-[#0A0F1E] hover:text-white transition-all"
                     >
                        <Edit3 size={16} />
                     </button>
                     <button 
                      onClick={() => deleteCustomStore(store.code)}
                      className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-300 hover:bg-rose-500 hover:text-white transition-all"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-2">
                     <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase">{store.code}</span>
                     </div>
                     <div className="bg-slate-100 px-4 py-2 rounded-xl">
                        <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{store.city || 'Bengaluru'}</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Active</span>
                   </div>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>

      {/* Edit Modal */}
      {editingCode && (
        <div className="fixed inset-0 z-[100] bg-[#0A0F1E]/80 backdrop-blur-md flex items-end justify-center px-4 pb-12">
           <div className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-[3px] mb-1">Adjust Registry</p>
                    <h3 className="text-xl font-[900] text-[#0A0F1E] italic uppercase">Modify Store</h3>
                 </div>
                 <button onClick={() => setEditingCode(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  {(['Sunglass Hut', 'LensCrafters'] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setEditBrand(b)}
                      className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${editBrand === b ? 'bg-[#0A0F1E] text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {(['Bengaluru', 'Delhi/Gurgaon', 'Mumbai'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setEditCity(c)}
                      className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${editCity === c ? 'bg-[#C9A84C] text-slate-900' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold text-slate-800 outline-none"
                />

                <button 
                  onClick={handleUpdate}
                  className="w-full bg-[#0A0F1E] text-white h-16 rounded-2xl font-black text-[10px] uppercase tracking-[3px] shadow-2xl active:scale-95 transition-all mt-4"
                >
                  Normalize Profile
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 h-20 bg-[#0A0F1E] border-t border-white/5 flex items-center justify-around px-8 z-[50]">
          <div className="max-w-2xl w-full mx-auto flex items-center justify-around">
            <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-white/20">
              <Home className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Home</span>
            </button>
            <button onClick={() => navigate('/stores')} className="flex flex-col items-center gap-1 text-white/20">
              <Store className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Stores</span>
            </button>
            <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-white/20">
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">History</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-[#C9A84C]">
              <UserIcon className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Profile</span>
            </button>
          </div>
      </div>
    </div>
  );
};

export default ManageStores;
