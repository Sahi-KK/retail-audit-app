import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { User, ShieldCheck, ArrowRight, ClipboardCheck } from 'lucide-react';

const Login = () => {
  const { auth, updateAuth } = useAuditStore();
  const [name, setName] = useState(auth.auditorName || '');
  const [id, setId] = useState(auth.auditorId || '');
  const navigate = useNavigate();

  const ALLOWED_ACCOUNTS = [
    { name: 'Krishnakant Singh', id: 'KK13' },
    { name: 'Sahi', id: 'EMP-001' }
  ];

  const handleSignIn = () => {
    const trimmedName = name.trim();
    const trimmedId = id.trim().toUpperCase();

    const isAuthorized = ALLOWED_ACCOUNTS.some(
      acc => acc.name.toLowerCase() === trimmedName.toLowerCase() && acc.id === trimmedId
    );

    if (isAuthorized) {
      updateAuth(trimmedName, trimmedId);
      navigate('/');
    } else {
      alert("UNAUTHORIZED ACCESS: Please use your validated Enterprise credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-8 selection:bg-[#C9A84C] selection:text-black">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 bg-[#C9A84C]/20 rounded-3xl flex items-center justify-center border border-[#C9A84C]/30 mb-6 shadow-[0_0_50px_rgba(201,168,76,0.1)]">
          <ClipboardCheck size={40} className="text-[#C9A84C]" />
        </div>
        <h1 className="text-white text-4xl font-[900] tracking-tighter text-center italic uppercase">Retail Audit</h1>
        <p className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[5px] mt-2 text-center">Enterprise Hub</p>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-sm bg-white/5 p-10 rounded-[48px] border border-white/10 shadow-2xl backdrop-blur-xl">
        <p className="text-white/30 text-[9px] font-black uppercase tracking-[3px] mb-10 text-center">Employee Identity Required</p>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 ml-2">
              <User size={14} className="text-[#C9A84C]" />
              <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Full Name</label>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-white/10 h-16 rounded-2xl px-6 text-white font-bold border border-white/5 outline-none focus:border-[#C9A84C]/30 transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 ml-2">
              <ShieldCheck size={14} className="text-[#C9A84C]" />
              <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Employee ID</label>
            </div>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. EMP-9921"
              className="w-full bg-white/10 h-16 rounded-2xl px-6 text-white font-bold border border-white/5 outline-none focus:border-[#C9A84C]/30 transition-all placeholder:text-white/10 uppercase"
            />
          </div>

          <button 
            onClick={handleSignIn}
            className="w-full bg-[#C9A84C] h-18 py-6 rounded-2xl flex items-center justify-center shadow-2xl shadow-[#C9A84C]/20 active:scale-[0.98] transition-all group"
          >
            <span className="text-[#0A0F1E] font-black text-lg mr-3 tracking-tighter uppercase">ACCESS HUB</span>
            <ArrowRight size={20} className="text-[#0A0F1E] group-hover:translate-x-1 transition-transform" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="mt-20 text-[#C9A84C]/20 text-center">
        <p className="text-[8px] font-black uppercase tracking-[3px]">Enterprise v2.3.0 • GHOST STABLE • Sync Active</p>
      </div>
    </div>
  );
};

export default Login;
