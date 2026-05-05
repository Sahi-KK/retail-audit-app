import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { ChevronRight, Calendar, MapPin, Activity, Clock, Search, Filter, User as UserIcon, Home, Store, ClipboardCheck, Cloud, Smartphone, ExternalLink, Folder } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const { completedAudits: allAudits, cloudAudits, auth, syncFromCloud } = useAuditStore();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'local' | 'cloud'>('local');
  const [selectedCloudAudit, setSelectedCloudAudit] = React.useState<any>(null);

  const handleCloudSync = async () => {
    setIsSyncing(true);
    await syncFromCloud();
    setTimeout(() => setIsSyncing(false), 1000);
  };
  
  const completedAudits = React.useMemo(() => {
    return allAudits.filter(a => a && a.headerInfo?.auditorId === auth.auditorId);
  }, [allAudits, auth.auditorId]);

  const CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycbypy7sK63OxQWqR9RzvZ3xMw47pJukssnIdPlRXad0-3o6wblJ5T7lLv19DCpAeKOuL/exec";
  const displayAudits = viewMode === 'local' ? completedAudits : cloudAudits;

  const handleOpenInApp = async (audit: any) => {
    if (!audit.id) {
      alert("Error: Missing Cloud ID for this record.");
      return;
    }
    
    setIsSyncing(true);
    try {
      // Handshake Step 1: Direct Fetch
      const response = await fetch(`${CLOUD_SYNC_URL}?action=getAuditDetail&auditId=${audit.id}`);
      const rawText = await response.text();
      
      const jsonStart = rawText.indexOf('{');
      if (jsonStart === -1) {
        throw new Error("Master Hub: The cloud response is protected or malformed.");
      }
      
      const cleanJson = rawText.substring(jsonStart);
      const fullAudit = JSON.parse(cleanJson);
      
      if (fullAudit && (fullAudit.id || fullAudit.headerInfo)) {
        useAuditStore.getState().loadAudit({ ...fullAudit, id: fullAudit.id || audit.id });
        navigate('/audit-form');
      }
    } catch (e) {
      console.error("[CLOUD HANDSHAKE FAILED]", e);
      alert(`Master Hub Handshake Failed: ${e instanceof Error ? e.message : 'Connectivity Issue'}\n\nNote: Browsers may block deep-cloud access for security. Please use the Google Folder option to view the official report.`);
    } finally {
      setIsSyncing(false);
      setSelectedCloudAudit(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#0A0F1E] px-6 pt-16 pb-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <p className="text-[#C9A84C] text-[8px] font-black uppercase tracking-[3px] mb-1">Audit Ledger</p>
                  <h1 className="text-white text-3xl font-[900] italic uppercase">History</h1>
               </div>
               <button 
                onClick={handleCloudSync}
                disabled={isSyncing}
                className={`bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 active:scale-95 transition-all ${isSyncing ? 'opacity-50' : ''}`}
               >
                  <Cloud size={14} className={isSyncing ? 'animate-bounce text-[#C9A84C]' : 'text-[#C9A84C]'} />
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
               </button>
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mb-8">
              <button 
                onClick={() => setViewMode('local')}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${viewMode === 'local' ? 'bg-[#C9A84C] text-[#0A0F1E]' : 'text-white/40'}`}
              >
                <Smartphone size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Device</span>
              </button>
              <button 
                onClick={() => { setViewMode('cloud'); handleCloudSync(); }}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${viewMode === 'cloud' ? 'bg-[#C9A84C] text-[#0A0F1E]' : 'text-white/40'}`}
              >
                <Cloud size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cloud</span>
              </button>
            </div>

            {viewMode === 'cloud' && (
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl p-4 mb-8">
                 <div className="flex items-center gap-2 mb-2">
                    <Activity size={12} className="text-[#C9A84C]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Master Hub Sentinel</span>
                 </div>
                 <div className="space-y-1 mb-4">
                    <p className="text-white/40 text-[8px] font-bold uppercase tracking-wider">
                       Target: <span className="text-white/60 lowercase italic">...{CLOUD_SYNC_URL.slice(-30)}</span>
                    </p>
                    <p className="text-white/40 text-[8px] font-bold uppercase tracking-wider">
                       Auditor: <span className="text-[#C9A84C]">{auth.auditorId} ({auth.auditorName})</span>
                    </p>
                 </div>
                 
                 <button 
                  onClick={async () => {
                    setIsSyncing(true);
                    try {
                      // Attempt to fetch root folder from Master Hub
                      const response = await fetch(`${CLOUD_SYNC_URL}?action=getRootFolder`);
                      const data = await response.json();
                      if (data.folderUrl) {
                        window.open(data.folderUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        // Fallback to Google Drive Search for this Brand
                        window.open(`https://drive.google.com/drive/search?q=EssilorLuxottica Audit Reports`, '_blank');
                      }
                    } catch (e) {
                      // Final Fallback: Direct Drive Search
                      window.open(`https://drive.google.com/drive/u/0/search?q=owner:me "Audit"`, '_blank');
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  className="w-full bg-[#C9A84C] py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
                 >
                    <Folder size={12} className="text-[#0A0F1E]" />
                    <span className="text-[9px] font-black text-[#0A0F1E] uppercase tracking-tighter">Open Cloud Vault</span>
                 </button>
              </div>
            )}
        </header>

        <main className="p-6 space-y-6">
           <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-100 shadow-sm">
              <Search size={18} className="text-slate-300" />
              <input type="text" placeholder="Search archive..." className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-800" />
           </div>

           <div className="space-y-4">
              {displayAudits.length > 0 ? displayAudits.map((audit: any, index: number) => {
                if (viewMode === 'cloud') {
                  return (
                    <div 
                      key={index}
                      onClick={() => setSelectedCloudAudit(audit)}
                      className="bg-white p-6 rounded-[32px] flex items-center gap-4 border border-slate-100 shadow-sm hover:border-emerald-500/30 transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex flex-col items-center justify-center border border-emerald-100 shadow-inner group-hover:border-emerald-500/50 transition-colors">
                        <span className="text-xl font-black text-emerald-600">{audit.score}%</span>
                        <span className="text-[7px] text-emerald-400 font-black uppercase tracking-tighter">CLOUD</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-slate-800 mb-1">{audit.store}</p>
                        <div className="flex items-center gap-1.5">
                           <Calendar className="w-3 h-3 text-slate-300" />
                           <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                             {new Date(audit.date).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                         <ChevronRight size={18} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={audit.id} 
                    onClick={() => navigate(`/report/${audit.id}`)}
                    className="bg-white p-5 rounded-[32px] flex items-center gap-4 border border-slate-100 shadow-sm hover:border-[#C9A84C]/30 transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shadow-inner group-hover:border-[#C9A84C]/50 transition-colors">
                      <span className="text-xl font-black text-slate-800">{audit.finalPercentage}%</span>
                      <span className="text-[7px] text-slate-400 font-black uppercase tracking-tighter">SCORE</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-slate-800 mb-1">{audit.headerInfo.store.split(',')[0]}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                            {new Date(audit.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-300" />
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                            {audit.headerInfo.storeCode}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-[#C9A84C] transition-colors" />
                  </div>
                );
              }) : (
               <div className="py-24 text-center bg-white border-2 border-dashed border-slate-100 rounded-[40px]">
                 <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                 <p className="font-black text-xs uppercase tracking-[3px] text-slate-200">No Records Found</p>
               </div>
             )}
           </div>
        </main>
      </div>

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
            <button className="flex flex-col items-center gap-1 text-[#C9A84C]">
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">History</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-white/20">
              <UserIcon className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Profile</span>
            </button>
          </div>
      </div>

      {/* Cloud Action Modal */}
      {selectedCloudAudit && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
           <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm" onClick={() => setSelectedCloudAudit(null)} />
           <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 duration-300">
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 sm:hidden" />
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Cloud size={24} />
                 </div>
                 <div>
                    <h3 className="text-slate-900 font-black text-lg tracking-tight truncate max-w-[200px]">
                      {selectedCloudAudit.store}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cloud Master File</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={() => handleOpenInApp(selectedCloudAudit)}
                  className="w-full bg-[#0A0F1E] h-16 rounded-2xl flex items-center px-6 gap-4 group active:scale-95 transition-all"
                 >
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#C9A84C]">
                       <Smartphone size={18} />
                    </div>
                    <div className="text-left">
                       <p className="text-white font-black text-xs uppercase tracking-widest">Open in App</p>
                       <p className="text-white/30 text-[8px] font-bold">Edit audit metrics locally</p>
                    </div>
                 </button>

                 <button 
                  onClick={() => {
                    // Smart Discovery: Search for any property that looks like a URL
                    const possibleKeys = ['link', 'Link', 'url', 'URL', 'driveLink', 'Google Folder', 'folderLink'];
                    let foundUrl = null;
                    
                    for (const key of possibleKeys) {
                      const val = selectedCloudAudit[key];
                      if (val && typeof val === 'string' && val.toLowerCase().startsWith('http')) {
                        foundUrl = val;
                        break;
                      }
                    }

                    if (foundUrl) {
                      window.open(foundUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      // DEEP DISCOVERY: If link is a placeholder, try to fetch it from the detail engine
                      if (selectedCloudAudit.link === "View Report" || !foundUrl) {
                         setIsSyncing(true);
                         const CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycbypy7sK63OxQWqR9RzvZ3xMw47pJukssnIdPlRXad0-3o6wblJ5T7lLv19DCpAeKOuL/exec";
                         fetch(`${CLOUD_SYNC_URL}?action=getAuditDetail&auditId=${selectedCloudAudit.id}`)
                          .then(res => res.json())
                          .then(fullData => {
                             // Check for link in full data
                             const deepUrl = fullData.link || fullData.url || fullData.driveLink || fullData.googleDriveLink;
                             if (deepUrl && deepUrl.toLowerCase().startsWith('http')) {
                               window.open(deepUrl, '_blank', 'noopener,noreferrer');
                             } else {
                               alert("Master Hub: Full report link is still being indexed by Google. Please try again in 1 minute.");
                             }
                          })
                          .catch(() => alert("Deep Link Discovery failed. Master Hub is unreachable."))
                          .finally(() => {
                            setIsSyncing(false);
                            setSelectedCloudAudit(null);
                          });
                         return;
                      }

                      const debugKeys = Object.keys(selectedCloudAudit).join(', ');
                      const debugValues = Object.values(selectedCloudAudit).map(v => typeof v === 'string' ? v.substring(0, 20) : typeof v).join(', ');
                      alert(`DIAGNOSTIC: No valid URL found in record.\n\nFields: [${debugKeys}]\n\nData Snippets: [${debugValues}]\n\nPlease refresh Cloud Sync.`);
                    }
                  }}
                  className="w-full bg-slate-50 h-16 rounded-2xl flex items-center px-6 gap-4 border border-slate-100 group active:scale-95 transition-all"
                 >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                       <ExternalLink size={18} />
                    </div>
                    <div className="text-left">
                       <p className="text-slate-900 font-black text-xs uppercase tracking-widest">Google Folder</p>
                       <p className="text-slate-400 text-[8px] font-bold">View official cloud exports</p>
                    </div>
                 </button>
              </div>

              <button 
                onClick={() => setSelectedCloudAudit(null)}
                className="w-full mt-8 py-4 text-slate-300 font-black text-[10px] uppercase tracking-[4px] hover:text-slate-500"
              >
                Cancel Protocol
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default History;
