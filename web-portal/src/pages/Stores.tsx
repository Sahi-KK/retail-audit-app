import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoreCalc } from '../hooks/useScoreCalc';
import { locationData } from '../data/locationData';
import { useAuditStore } from '../store/auditStore';
import { Store, Search, ArrowRight, Activity, ClipboardCheck, User as UserIcon, Home, X } from 'lucide-react';

const Stores = () => {
  const navigate = useNavigate();
  const { getStoreStats } = useScoreCalc();
  const { customStores, setHeaderField, startNewAudit } = useAuditStore();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const bengaluruStores = React.useMemo(() => {
    const stores = [
      ...(customStores || []),
      ...locationData["Karnataka"]["Bengaluru"].filter(s => s && s.code !== 'CUSTOM')
    ];
    
    if (!searchQuery) return stores;
    
    const query = searchQuery.toLowerCase();
    return stores.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.code.toLowerCase().includes(query)
    );
  }, [customStores, searchQuery]);

  const handleLaunchAudit = (store: any) => {
    startNewAudit();
    setHeaderField('store', store.name);
    setHeaderField('storeCode', store.code);
    setHeaderField('storeBrand', store.brand);
    setHeaderField('isCustomStore', !!customStores.find(s => s.code === store.code));
    navigate('/audit-form');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#0A0F1E] px-6 pt-16 pb-8 rounded-b-[40px] shadow-2xl">
           <p className="text-[#C9A84C] text-[8px] font-black uppercase tracking-[3px] mb-1">Fleet Registry</p>
           <h1 className="text-white text-3xl font-[900] italic uppercase">Stores</h1>
        </header>

        <main className="p-6 space-y-4">
            <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-100 shadow-sm mb-6">
              <Search size={18} className="text-slate-300" />
              <input 
                type="text" 
                placeholder="Search store name or code..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-800" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-500">
                   <X size={14} />
                </button>
              )}
            </div>

           {bengaluruStores.map(store => {
             const stats = getStoreStats(store.code);
             return (
               <div key={store.code} onClick={() => handleLaunchAudit(store)} className="bg-white rounded-2xl p-5 flex justify-between items-center group active:scale-[0.98] transition-all border border-slate-100 shadow-sm cursor-pointer">
                  <div className="flex-1">
                    <p className="text-slate-800 font-black text-xs uppercase tracking-wide mb-0.5">
                      {store.brand === 'LensCrafters' ? (store.name.split(',')[1]?.trim() || store.name) : store.name.split(',')[0]}
                    </p>
                    <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">{store.code}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {stats.avgScore !== null && (
                       <p className="text-slate-800 font-[900] text-base italic">{stats.avgScore}%</p>
                    )}
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#C9A84C] group-hover:text-white transition-all">
                      <ArrowRight size={16} strokeWidth={3} />
                    </div>
                  </div>
               </div>
             );
           })}
        </main>
      </div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 h-20 bg-[#0A0F1E] border-t border-white/5 flex items-center justify-around px-8 z-[50]">
          <div className="max-w-2xl w-full mx-auto flex items-center justify-around">
            <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-white/20">
              <Home className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-[#C9A84C]">
              <Store className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Stores</span>
            </button>
            <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-white/20">
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">History</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-white/20">
              <UserIcon className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Profile</span>
            </button>
          </div>
      </div>
    </div>
  );
};

export default Stores;
