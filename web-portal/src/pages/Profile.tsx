import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { User as UserIcon, LogOut, Settings, Shield, Bell, ChevronRight, Home, Store, ClipboardCheck } from 'lucide-react';

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
        <header className="bg-[#0A0F1E] px-6 pt-16 pb-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-[#C9A84C] rounded-3xl flex items-center justify-center text-[#0A0F1E] shadow-2xl">
                 <UserIcon size={40} strokeWidth={2.5} />
              </div>
              <div>
                 <h1 className="text-white text-2xl font-[900] italic uppercase tracking-tight">{auth.auditorName}</h1>
                 <p className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[3px] mt-1">ID: {auth.auditorId}</p>
              </div>
           </div>
        </header>

        <main className="p-6 space-y-4">
           <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100">
              <div 
                onClick={() => handleProtocolAlert('Account Security')}
                className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer"
              >
                 <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><Shield size={18} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Account Security</span>
                 </div>
                 <ChevronRight size={16} className="text-slate-300" />
              </div>
              <div 
                onClick={() => handleProtocolAlert('Notification Preferences')}
                className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer"
              >
                 <div className="flex items-center gap-4">
                    <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600"><Bell size={18} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Notification Prefs</span>
                 </div>
                 <ChevronRight size={16} className="text-slate-300" />
              </div>
              <div 
                onClick={() => handleProtocolAlert('App Settings')}
                className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer"
              >
                 <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600"><Settings size={18} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">App Settings</span>
                 </div>
                 <ChevronRight size={16} className="text-slate-300" />
              </div>
              <div 
                onClick={() => navigate('/manage-stores')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer"
              >
                 <div className="flex items-center gap-4">
                    <div className="bg-[#C9A84C]/10 p-2.5 rounded-xl text-[#C9A84C]"><Store size={18} /></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Enterprise Registry</span>
                 </div>
                 <ChevronRight size={16} className="text-slate-300" />
              </div>
           </div>

           <button 
            onClick={handleLogout}
            className="w-full bg-white rounded-[32px] p-6 flex items-center justify-center gap-3 text-red-500 shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
           >
              <LogOut size={20} />
              <span className="font-black text-xs uppercase tracking-[4px]">Sign Out of Portal</span>
           </button>
           
           <div className="pt-8 text-center">
              <p className="text-slate-300 text-[8px] font-black uppercase tracking-[4px]">GHOST STABLE V4.0.2</p>
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
