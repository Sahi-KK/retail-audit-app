import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { User as UserIcon, LogOut, Settings, Shield, Bell, ChevronRight, Home, Store, ClipboardCheck, Book, Activity, Folder } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuditStore();

  const handleProtocolAlert = (feature: string) => {
    alert(`${feature} is currently locked by Enterprise Policy. Please contact the Master Hub Admin for changes.`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#0A0F1E] px-8 pt-20 pb-16 rounded-b-[64px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
           
           <div className="flex items-center gap-8 relative z-10">
              <div className="w-24 h-24 bg-[#C9A84C] rounded-[32px] flex items-center justify-center text-[#0A0F1E] shadow-[0_20px_40px_rgba(201,168,76,0.3)] rotate-3">
                 <UserIcon size={48} strokeWidth={2.5} className="-rotate-3" />
              </div>
              <div>
                 <p className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[5px] mb-2 opacity-60 italic">Senior Auditor</p>
                 <h1 className="text-white text-3xl font-[900] italic uppercase tracking-tighter leading-none">{auth.auditorName}</h1>
                 <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[3px]">Protocol ID: {auth.auditorId}</p>
                 </div>
              </div>
           </div>
        </header>

        <main className="p-6 space-y-6">
           <div className="bg-white rounded-[48px] overflow-hidden shadow-xl border border-slate-100 p-2">
              <div 
                onClick={() => handleProtocolAlert('Account Security')}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
              >
                 <div className="flex items-center gap-5">
                    <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform"><Shield size={20} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Identity & Security</span>
                 </div>
                 <ChevronRight size={18} className="text-slate-200" />
              </div>

              <div 
                onClick={() => navigate('/terminology')}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
              >
                 <div className="flex items-center gap-5">
                    <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><Book size={20} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Strategic Glossary</span>
                 </div>
                 <ChevronRight size={18} className="text-slate-200" />
              </div>

              <div 
                onClick={async () => {
                  const sync = useAuditStore.getState().syncFromCloud;
                  alert("Initiating Master Sync Protocol...");
                  await sync();
                  alert("Cloud Ledger Synchronized.");
                }}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
              >
                 <div className="flex items-center gap-5">
                    <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform"><Activity size={20} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Cloud Master Sync</span>
                 </div>
                 <ChevronRight size={18} className="text-slate-200" />
              </div>

              <div 
                onClick={() => window.open('https://drive.google.com/drive/u/0/my-drive', '_blank')}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
              >
                 <div className="flex items-center gap-5">
                    <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><Folder size={20} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Global Drive Vault</span>
                 </div>
                 <ChevronRight size={18} className="text-slate-200" />
              </div>

              <div 
                onClick={() => navigate('/manage-stores')}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
              >
                 <div className="flex items-center gap-5">
                    <div className="bg-[#C9A84C]/10 p-3.5 rounded-2xl text-[#C9A84C] group-hover:scale-110 transition-transform"><Store size={20} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Enterprise Registry</span>
                 </div>
                 <ChevronRight size={18} className="text-slate-200" />
              </div>
           </div>

           <button 
            onClick={handleLogout}
            className="w-full bg-[#0A0F1E] rounded-[40px] p-8 flex items-center justify-center gap-4 text-white shadow-2xl active:scale-[0.98] transition-all group"
           >
              <LogOut size={24} className="text-[#C9A84C] group-hover:rotate-12 transition-transform" />
              <span className="font-black text-sm uppercase tracking-[6px] italic">Terminate Session</span>
           </button>
           
           <div className="pt-12 text-center">
              <p className="text-slate-300 text-[9px] font-black uppercase tracking-[5px] italic">Strategic Hub Premium v3.1</p>
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
            <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-white/20">
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">History</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-[#C9A84C]">
              <UserIcon className="w-5 h-5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Profile</span>
            </button>
          </div>
      </div>
    </div>
  );
};

export default Profile;
