import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { useScoreCalc } from '../hooks/useScoreCalc';
import { useCriticalIssues } from '../hooks/useCriticalIssues';
import { locationData } from '../data/locationData';
import { TrendingUp, Crown, AlertTriangle, ChevronDown, CheckCircle2, AlertCircle, X, ClipboardCheck, ArrowRight, Plus, Activity, Search, Store, User as UserIcon, Home } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Wrapped in try-catch to diagnose hidden hook errors
  try {
    const { fleetStats, getRankedStores, getStoreStats, fleetCategoryStats, getChartData } = useScoreCalc();
    const { customStores, setHeaderField, startNewAudit, auth } = useAuditStore();
    const { allStores, topPerformers, actionRequired } = getRankedStores();

    const [selectedStoreCode, setSelectedStoreCode] = useState('ALL');
    const [pickerVisible, setPickerVisible] = useState(false);
    
    const { criticalIssues } = useCriticalIssues(selectedStoreCode);
    const chartDataRaw = getChartData();
    
    const chartData = useMemo(() => {
      if (!chartDataRaw || !chartDataRaw.labels || !chartDataRaw.datasets || !chartDataRaw.datasets[0]) {
        return [];
      }
      return chartDataRaw.labels.map((label, index) => ({
        name: label || 'N/A',
        value: chartDataRaw.datasets[0].data?.[index] || 0
      }));
    }, [chartDataRaw]);

    const bengaluruStores = useMemo(() => {
      const cityData = locationData["Karnataka"]?.["Bengaluru"] || [];
      return [
        ...(customStores || []),
        ...cityData.filter(s => s && s.code !== 'CUSTOM')
      ];
    }, [customStores]);

    const selectedStoreStats = useMemo(() => {
      if (selectedStoreCode === 'ALL') return null;
      return getStoreStats(selectedStoreCode);
    }, [selectedStoreCode, getStoreStats]);

    const activeCategoryStats = selectedStoreCode === 'ALL' ? fleetCategoryStats : (selectedStoreStats?.categoryStats || []);
    const activeScore = selectedStoreCode === 'ALL' ? fleetStats.avgScore : (selectedStoreStats?.avgScore || 0);

    const selectedStoreName = selectedStoreCode === 'ALL' 
      ? 'All Bengaluru Stores' 
      : (() => {
          const s = bengaluruStores.find(st => st.code === selectedStoreCode);
          if (!s) return 'Selected Store';
          return s.brand === 'LensCrafters' ? (s.name.split(',')[1]?.trim() || s.name) : s.name.split(',')[0];
        })();

    const handleLaunchAudit = (store?: any) => {
      setPickerVisible(false);
      startNewAudit();
      if (store) {
        setHeaderField('store', store.name);
        setHeaderField('storeCode', store.code);
        setHeaderField('storeBrand', store.brand);
        setHeaderField('isCustomStore', !!customStores.find(s => s.code === store.code));
      }
      navigate('/audit-form');
    };

    return (
      <div className="min-h-screen bg-[#F4F4F6] pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Header & Stats Section */}
          <div className="bg-[#0A0F1E] px-6 pt-16 pb-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A84C]/5 rounded-full blur-[60px] -mr-24 -mt-24" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <p className="text-[#C9A84C] text-[8px] font-black uppercase tracking-[3px] mb-1 opacity-60">Regional Intelligence</p>
                <h1 className="text-white text-3xl font-[900] tracking-tighter italic uppercase leading-none">STRATEGIC<br/>HUB</h1>
                <p className="text-white/20 text-[7px] font-black uppercase tracking-widest mt-1 italic">Logged in as {auth.auditorName}</p>
              </div>
              <button 
                onClick={() => handleLaunchAudit()}
                className="w-12 h-12 bg-[#C9A84C] rounded-xl flex items-center justify-center shadow-xl active:scale-90 transition-all"
              >
                <Plus size={20} className="text-[#0A0F1E]" strokeWidth={4} />
              </button>
            </div>

            <button 
              onClick={() => setPickerVisible(true)}
              className="w-full flex items-center justify-between bg-white/5 px-6 py-4 rounded-2xl border border-white/10 mb-8 active:bg-white/10 transition-all group"
            >
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mr-3 shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
                <span className="text-white font-black text-[10px] uppercase tracking-[2px] group-hover:text-[#C9A84C] transition-colors">{selectedStoreName}</span>
              </div>
              <ChevronDown size={14} className="text-[#C9A84C]" />
            </button>

            <div className="grid grid-cols-1 gap-4 relative z-10">
              <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 backdrop-blur-md">
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[3px] mb-1">
                  {selectedStoreCode === 'ALL' ? 'Fleet Average' : 'Store Rating'}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-5xl font-[900] tracking-tighter italic leading-none">{activeScore}</span>
                  <span className="text-[#C9A84C] text-lg font-black">%</span>
                </div>
              </div>
            </div>

            {fleetStats.totalAudits > 0 && (
              <div className="mt-8 bg-white/5 rounded-[32px] p-6 border border-white/10 backdrop-blur-md animate-in fade-in duration-700">
                <div className="flex-row items-center mb-6 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-white/60 text-[9px] font-black uppercase tracking-[3px]">
                     Category Performance Metrics
                  </p>
                </div>
                <div className="space-y-6">
                  {activeCategoryStats.map((cat: any) => (
                    <div key={cat.category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                        <span className="text-white font-black text-[10px]">{cat.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full rounded-full ${cat.percentage >= 85 ? 'bg-emerald-500' : cat.percentage >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Metrics */}
          <div className="mx-6 mt-6 bg-white p-8 rounded-[40px] shadow-sm mb-12 border border-slate-100">
            <div className="flex items-center justify-between mb-10 px-2">
              <div>
                 <h2 className="text-[#0A0F1E] font-[900] text-xl tracking-tight uppercase italic">Active Metrics</h2>
                 <p className="text-slate-400 text-[9px] font-black uppercase tracking-[2px] mt-1.5">Market Segment Performance</p>
              </div>
              <TrendingUp size={18} className="text-slate-200" />
            </div>
            
            <div className="h-[200px] flex items-end justify-between gap-2 px-2">
              {fleetStats.totalAudits > 0 ? (
                chartData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-700 ${item.value >= 85 ? 'bg-emerald-500' : item.value >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ height: `${Math.max(item.value, 5)}%`, opacity: 0.8 }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F1E] text-white text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.value}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">Pending Performance Data</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Problems */}
          <div className="px-6 mb-12">
            <h2 className="text-[#0A0F1E] font-[900] text-xl tracking-tight uppercase italic mb-8 px-2">Critical Problems</h2>
            <div className="space-y-4">
              {criticalIssues.length > 0 ? (
                criticalIssues.map((agg) => (
                  <div key={agg.id} className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-rose-500 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest">{agg.storeName.split(',')[0]}</p>
                        <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          <p className="text-slate-500 font-black text-[8px] uppercase tracking-widest">{agg.category}</p>
                        </div>
                      </div>
                      <p className="text-[#0A0F1E] font-black text-sm tracking-tight mb-2">{agg.count} Issues Detected</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="items-center py-12 flex flex-col bg-white rounded-[40px] border border-slate-100">
                  <CheckCircle2 size={40} className="text-emerald-500 mb-4" />
                  <h3 className="text-[#0A0F1E] font-black text-center italic uppercase">Fleet Healthy</h3>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PINNED BOTTOM NAVIGATION */}
        <div className="fixed bottom-0 inset-x-0 h-20 bg-[#0A0F1E] border-t border-white/5 flex items-center justify-around px-8 z-[50]">
            <div className="max-w-2xl w-full mx-auto flex items-center justify-around">
              <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-[#C9A84C]">
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
              <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-white/20">
                <UserIcon className="w-5 h-5" />
                <span className="text-[7px] font-black uppercase tracking-widest">Profile</span>
              </button>
            </div>
        </div>

        {/* Modal handling */}
        {pickerVisible && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-12 bg-[#0A0F1E]/80 backdrop-blur-md">
             <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl relative">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-[900] text-[#0A0F1E] italic uppercase">Select Store</h3>
                   <button onClick={() => setPickerVisible(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><X size={18} /></button>
                </div>
                <div className="max-h-[350px] overflow-y-auto space-y-3">
                   <button onClick={() => { setSelectedStoreCode('ALL'); setPickerVisible(false); }} className={`w-full p-6 rounded-2xl text-left border ${selectedStoreCode === 'ALL' ? 'bg-[#0A0F1E] text-white' : 'bg-slate-50'}`}>
                      <p className="font-black text-[10px] uppercase">All Bengaluru Stores</p>
                   </button>
                   {bengaluruStores.map(store => (
                     <button key={store.code} onClick={() => { setSelectedStoreCode(store.code); setPickerVisible(false); }} className="w-full p-4 bg-slate-50 rounded-2xl text-left border border-transparent">
                        <p className="text-slate-800 font-black text-[10px] uppercase">
                          {store.brand === 'LensCrafters' ? (store.name.split(',')[1]?.trim() || store.name) : store.name.split(',')[0]}
                        </p>
                     </button>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('[DASHBOARD CRASH]', error);
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-8">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h1 className="text-[#0A0F1E] font-black text-2xl uppercase italic text-center">Dashboard Malfunction</h1>
        <p className="text-slate-500 text-sm text-center mt-2 max-w-xs uppercase font-bold tracking-widest">A critical data error occurred in the Strategic Engine.</p>
        <button onClick={() => window.location.reload()} className="mt-8 bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-tighter">Emergency Reset</button>
        <pre className="mt-8 text-[8px] text-rose-300 bg-rose-900/10 p-4 rounded-xl overflow-auto max-w-full">
          {String(error)}
        </pre>
      </div>
    );
  }
};

export default Dashboard;
