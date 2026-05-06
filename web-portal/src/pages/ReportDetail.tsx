import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { auditQuestions } from '../data/auditQuestions';
import { ChevronLeft, Download, AlertCircle } from 'lucide-react';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completedAudits } = useAuditStore();
  const audit = completedAudits.find(a => a.id === id);

  if (!audit) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-black text-white mb-4">Record Not Found</h2>
        <button onClick={() => navigate('/history')} className="text-brand-gold text-xs font-black uppercase tracking-widest border border-brand-gold/30 px-8 py-3 rounded-xl">Return to Archive</button>
      </div>
    );
  }

  const isLensCrafters = audit.headerInfo.storeBrand === 'LensCrafters';
  const categoryOrder = ['cleanliness', 'merchandising', 'operations', 'staff', 'rayban_meta', ...(isLensCrafters ? ['clinical'] : [])];
  
  const categoryLabels: Record<string, string> = {
    cleanliness: 'CLEANLINESS & HYGIENE',
    merchandising: 'VISUAL MERCHANDISING & BRAND INTEGRITY',
    operations: 'STORE OPERATIONS & ASSET PROTECTION',
    staff: 'STAFF BEHAVIOUR & CUSTOMER EXPERIENCE',
    rayban_meta: 'RAY-BAN META EXCELLENCE',
    clinical: 'LENSCRAFTERS CLINICAL OPERATIONS'
  };

  return (
    <div className="min-h-screen bg-slate-200 py-12 px-4 print:p-0 print:bg-white">
      {/* Web Controls */}
      <div className="max-w-[850px] mx-auto mb-8 flex justify-between items-center print:hidden">
        <button onClick={() => navigate('/history')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all text-[10px] font-black uppercase tracking-[3px]">
          <ChevronLeft className="w-4 h-4" />
          Vault Archive
        </button>
        <button onClick={() => window.print()} className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[4px] shadow-2xl active:scale-95 transition-all flex items-center gap-3">
          <Download className="w-4 h-4 text-[#C9A84C]" />
          Generate Official Export
        </button>
      </div>

      {/* THE ACTUAL REPORT */}
      <div className="max-w-[850px] mx-auto bg-white p-[60px] text-[#1e293b] font-sans shadow-2xl print:shadow-none print:w-full print:p-[40px]">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
           <div>
              <h1 className="text-[32px] font-[900] tracking-tight text-[#0f172a] mb-8 uppercase">RETAIL AUDIT REPORT</h1>
              <div className="space-y-1.5 text-[14px]">
                 <p><span className="font-bold text-slate-400">Brand:</span> <span className="font-bold text-slate-700">{audit.headerInfo.storeBrand}</span></p>
                 <p><span className="font-bold text-slate-400">Store:</span> <span className="font-bold text-slate-700">{audit.headerInfo.storeCode} - {audit.headerInfo.store.split(',')[0]}</span></p>
                 <p><span className="font-bold text-slate-400">Auditor:</span> <span className="font-bold text-slate-700">{audit.headerInfo.auditorName}</span></p>
                 <p><span className="font-bold text-slate-400">Date:</span> <span className="font-bold text-slate-700">{audit.headerInfo.date}</span></p>
              </div>
           </div>
           <div className="pt-8">
              <div className="text-[#C9A84C] font-black text-xl italic tracking-tighter">ESSILORLUXOTTICA</div>
              <div className="text-slate-300 text-[8px] font-black uppercase tracking-[3px] mt-1 text-right">Strategic Hub v3.1</div>
           </div>
        </div>

        {/* Thick Gold Line */}
        <div className="h-[3px] bg-[#C9A84C] w-full mb-12" />

        {/* Hero Score Box */}
        <div className="bg-[#0f172a] rounded-[32px] p-[50px] text-center mb-20 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A84C]/5 rounded-full blur-[60px] -mr-24 -mt-24" />
           <p className="text-white/40 text-[11px] font-black uppercase tracking-[5px] mb-6 relative z-10">Compliance Index</p>
           <h2 className="text-[90px] font-[900] text-[#C9A84C] leading-none mb-6 relative z-10">{audit.finalPercentage}%</h2>
           <p className="text-white text-[14px] font-bold uppercase tracking-[2px] relative z-10">{audit.finalScore} / {audit.totalMax} TOTAL POINTS EARNED</p>
        </div>

        {/* Detailed Category Scoring */}
        <div className="mb-12 flex items-center gap-4">
           <div className="w-[6px] h-8 bg-[#C9A84C] rounded-full" />
           <h3 className="text-[24px] font-[900] text-[#0f172a] italic uppercase tracking-tight">Performance Metrics</h3>
        </div>

        <div className="space-y-12">
           {categoryOrder.map(catKey => {
              const catQuestions = auditQuestions.filter(q => q.category === catKey);
              if (catQuestions.length === 0) return null;
              
              let subEarned = 0;
              let subMax = 0;
              catQuestions.forEach(q => {
                subEarned += audit.scores[q.id] || 0;
                subMax += 5;
              });

              return (
                <div key={catKey} className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm page-break-inside-avoid">
                   <div className="bg-[#0f172a] px-6 py-4">
                      <h4 className="text-[#C9A84C] text-[12px] font-black tracking-[2px] uppercase">{categoryLabels[catKey]}</h4>
                   </div>
                   <div className="divide-y divide-slate-100">
                      {catQuestions.map((q, idx) => {
                        const score = audit.scores[q.id] || 0;
                        const remark = audit.remarks?.[q.id];
                        return (
                          <div key={q.id} className={`px-6 py-6 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                             <div className="flex justify-between items-start mb-2">
                                <p className="text-[11px] font-bold text-slate-500 leading-relaxed pr-8 max-w-[85%]">{q.text}</p>
                                <p className={`text-[14px] font-black whitespace-nowrap ${score >= 4 ? 'text-emerald-600' : score <= 2 ? 'text-rose-600' : 'text-slate-800'}`}>
                                  {score} / 5
                                </p>
                             </div>
                             {remark && (
                               <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                                  <p className="text-[10px] text-amber-800 font-bold italic leading-relaxed">
                                    Strategic Remark: {remark}
                                  </p>
                               </div>
                             )}
                          </div>
                        );
                      })}
                      <div className="bg-slate-50 px-6 py-5 flex justify-end items-center gap-6">
                         <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Subtotal:</span>
                         <span className="text-[16px] font-black text-slate-900">{subEarned} / {subMax}</span>
                      </div>
                   </div>
                </div>
              );
           })}
        </div>

        {/* Visual Evidence Vault */}
        {audit.photos && audit.photos.length > 0 && (
          <div className="mt-24 page-break-before">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-[6px] h-8 bg-[#C9A84C] rounded-full" />
                <h3 className="text-[24px] font-[900] text-[#0f172a] italic uppercase tracking-tight">Visual Evidence Vault</h3>
             </div>

             <div className="grid grid-cols-2 gap-8">
                {audit.photos.map(photo => (
                  <div key={photo.id} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-md page-break-inside-avoid">
                     <img src={photo.uri} className="w-full h-48 object-cover border-bottom border-slate-100" alt="Evidence" />
                     <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[70%]">{photo.title}</h4>
                           <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${photo.tag === 'negative' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                             {photo.tag === 'negative' ? 'At Risk' : 'Compliance'}
                           </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                          "{photo.remark}"
                        </p>
                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-4">Captured: {new Date(photo.timestamp).toLocaleTimeString()}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Final Footer */}
        <div className="mt-32 border-t border-slate-100 pt-10 text-center text-slate-300 font-black text-[9px] uppercase tracking-[5px] italic">
           © 2026 ESSILORLUXOTTICA RETAIL AUDIT HUB • GHOST SHIELD ARCHIVER v3.1
        </div>
      </div>

      <style>{`
        @media print {
          .page-break-before { page-break-before: always; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportDetail;
