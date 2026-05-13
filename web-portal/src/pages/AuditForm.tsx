import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore, PhotoEvidence } from '../store/auditStore';
import { auditQuestions, AuditCategory } from '../data/auditQuestions';
import { locationData } from '../data/locationData';
import { ChevronLeft, ChevronRight, CheckCircle2, Building2, Image as ImageIcon, MessageSquare, AlertCircle, TrendingUp, X, Camera, Plus, Minus, Send, Edit3, Trash2, Cloud, ChevronDown, MapPin, Calendar, User } from 'lucide-react';
import { SubmitModal } from '../components/SubmitModal';

const AuditForm = () => {
  const navigate = useNavigate();
  const { headerInfo, setHeaderField, scores, setScore, remarks, setRemark, photos, addPhoto, updatePhoto, removePhoto, submitAudit } = useAuditStore();
  const [activeRemarkId, setActiveRemarkId] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftUri, setDraftUri] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftRemark, setDraftRemark] = useState('');
  const [draftTag, setDraftTag] = useState<'positive' | 'negative' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { customStores } = useAuditStore();

  const activeStores = useMemo(() => {
    const city = headerInfo.city || 'Bengaluru';
    const defaults = (locationData["Karnataka"]?.[city] || []).filter(s => s && s.code !== 'CUSTOM');
    const custom = (customStores || []).filter(s => s.city === city || (!s.city && city === 'Bengaluru'));
    return [...custom, ...defaults];
  }, [customStores, headerInfo.city]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const categories: AuditCategory[] = ['cleanliness', 'merchandising', 'operations', 'staff', 'clinical', 'rayban_meta'].filter(cat => 
    cat !== 'clinical' || headerInfo.storeBrand === 'LensCrafters'
  ) as AuditCategory[];

  const categoryLabels = {
    cleanliness: 'Cleanup',
    merchandising: 'Merch',
    operations: 'Ops',
    staff: 'Staff',
    clinical: 'Clinic',
    rayban_meta: 'Ray-Ban Meta'
  };

  const currentCategory = categories[currentStep];
  const questions = auditQuestions.filter(q => q.category === currentCategory);
  const handleScore = (qid: string, val: number) => setScore(qid, val);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setDraftUri(compressed);
        setEditingId(null);
        setDraftTitle('');
        setDraftRemark('');
        setDraftTag(null);
        setModalVisible(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const openEditEvidence = (p: PhotoEvidence) => {
    setEditingId(p.id);
    setDraftUri(p.uri);
    setDraftTitle(p.title);
    setDraftRemark(p.remark);
    setDraftTag(p.tag);
    setModalVisible(true);
  };

  const handleSaveEvidence = () => {
    if (!draftTitle || !draftRemark || !draftTag || !draftUri) {
      alert('Please complete all fields.');
      return;
    }
    if (editingId) {
      updatePhoto(editingId, { title: draftTitle, remark: draftRemark, tag: draftTag });
    } else {
      addPhoto({
        id: Date.now().toString(),
        uri: draftUri,
        title: draftTitle,
        remark: draftRemark,
        tag: draftTag,
        timestamp: new Date().toISOString()
      });
    }
    setModalVisible(false);
  };

  const calculateResults = () => {
    const relevantQuestions = auditQuestions.filter(q => categories.includes(q.category));
    let totalMax = relevantQuestions.length * 5;
    if (totalMax === 0) return { percentage: 0, earned: 0, total: 0 };
    let earned = relevantQuestions.reduce((acc, q) => acc + (scores[q.id] || 0), 0);
    return {
      percentage: Math.round((earned / totalMax) * 100),
      earned,
      total: totalMax
    };
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] pb-52">
      <SubmitModal 
        isOpen={showSubmitModal} 
        onClose={() => setShowSubmitModal(false)} 
      />
      <div className="max-w-2xl mx-auto">
        <input type="file" ref={fileInputRef} onChange={onFilePicked} className="hidden" accept="image/*" />
        
        {/* Evidence Modal */}
        {modalVisible && (
          <div className="fixed inset-0 z-[100] bg-[#0A0F1E] flex flex-col animate-in slide-in-from-bottom duration-500">
             <header className="p-6 flex justify-between items-center border-b border-white/5 max-w-2xl mx-auto w-full">
                <div>
                  <h3 className="text-xl font-[900] text-white italic uppercase tracking-tighter">Evidence Entry</h3>
                  <p className="text-[#C9A84C] text-[8px] font-black uppercase tracking-[3px]">Visual Documentation</p>
                </div>
                <button onClick={() => setModalVisible(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><X size={18} /></button>
             </header>
             <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar max-w-2xl mx-auto w-full">
                {draftUri && <img src={draftUri} className="w-full aspect-video rounded-2xl object-cover border border-white/10" alt="Preview" />}
                <div className="space-y-6">
                   <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-2 block ml-1">Title</label>
                      <input type="text" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="e.g., Merchandising" className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-5 text-xs font-bold text-white outline-none" />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-2 block ml-1">Remark</label>
                      <textarea value={draftRemark} onChange={(e) => setDraftRemark(e.target.value)} placeholder="Observed details..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white outline-none resize-none" />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-2 block ml-1">Compliance Tag</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setDraftTag('positive')} className={`h-14 rounded-xl border flex items-center justify-center gap-2 transition-all ${draftTag === 'positive' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/5 bg-white/5 text-white/20'}`}><Plus size={16} strokeWidth={4} /><span className="text-[9px] font-black uppercase tracking-[1px]">Positive</span></button>
                         <button onClick={() => setDraftTag('negative')} className={`h-14 rounded-xl border flex items-center justify-center gap-2 transition-all ${draftTag === 'negative' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/5 bg-white/5 text-white/20'}`}><Minus size={16} strokeWidth={4} /><span className="text-[9px] font-black uppercase tracking-[1px]">Negative</span></button>
                      </div>
                   </div>
                </div>
             </main>
             <footer className="p-6 bg-[#0A0F1E] border-t border-white/5">
                <div className="max-w-2xl mx-auto w-full">
                   <button onClick={handleSaveEvidence} className="w-full bg-[#C9A84C] text-[#0A0F1E] h-14 rounded-xl font-black text-[10px] uppercase tracking-[3px]">FINALIZE EVIDENCE</button>
                </div>
             </footer>
          </div>
        )}

        {/* Header */}
        <header className="bg-[#0A0F1E] px-6 pb-6 rounded-b-[32px] shadow-2xl z-50 sticky top-0">
          <div className="flex items-center justify-between pt-12 mb-6">
            <div className="flex items-center gap-3">
               <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40"><ChevronLeft size={18} /></button>
               <div>
                  <h2 className="text-white text-lg font-[900] tracking-tight italic uppercase">
                    {headerInfo.storeBrand === 'LensCrafters' ? (headerInfo.store.split(',')[1]?.trim() || headerInfo.store) : headerInfo.store.split(',')[0]}
                  </h2>
                  <p className="text-slate-500 text-[8px] font-black uppercase tracking-[2px]">{headerInfo.auditorName}</p>
               </div>
            </div>
            <div className={`px-3 py-1 rounded-xl border font-black text-[10px] ${calculateResults().percentage >= 85 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20'}`}>
              {calculateResults().percentage}%
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            {!isHeaderExpanded ? (
              <button onClick={() => setIsHeaderExpanded(true)} className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-[#C9A84C]" />
                   <span className="text-white/60 text-[8px] font-black uppercase tracking-[2px]">Location Intelligence</span>
                </div>
                <span className="bg-[#C9A84C]/10 text-[#C9A84C] px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border border-[#C9A84C]/20">Edit</span>
              </button>
            ) : (
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/30 uppercase tracking-widest">City</label>
                      <select 
                        value={headerInfo.city || 'Bengaluru'}
                        onChange={(e) => {
                          setHeaderField('city', e.target.value);
                          setHeaderField('store', '');
                          setHeaderField('storeCode', '');
                        }}
                        className="w-full bg-white/5 h-10 rounded-lg px-3 text-white text-[9px] font-bold border border-white/5 outline-none appearance-none cursor-pointer"
                      >
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Delhi/Gurgaon">Delhi/Gurgaon</option>
                        <option value="Mumbai">Mumbai</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/30 uppercase tracking-widest">Select Location</label>
                      <select 
                        value={headerInfo.storeCode}
                        onChange={(e) => {
                          const store = activeStores.find(s => s.code === e.target.value);
                          if (store) {
                            setHeaderField('store', store.name);
                            setHeaderField('storeCode', store.code);
                            setHeaderField('storeBrand', store.brand);
                            setHeaderField('city', (store as any).city || headerInfo.city || 'Bengaluru');
                          }
                        }}
                        className="w-full bg-white/5 h-10 rounded-lg px-3 text-white text-[9px] font-bold border border-white/5 outline-none appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Choose Mall...</option>
                        {activeStores.map(s => (
                          <option key={s.code} value={s.code}>
                            {s.brand === 'LensCrafters' ? (s.name.split(',')[1]?.trim() || s.name) : s.name.split(',')[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/30 uppercase tracking-widest">Code</label>
                      <div className="bg-white/5 h-10 rounded-lg flex items-center px-3 text-white text-[9px] font-bold border border-white/5">{headerInfo.storeCode}</div>
                    </div>
                 </div>
                 <button onClick={() => setIsHeaderExpanded(false)} className="w-full bg-white/10 h-10 rounded-lg text-white text-[8px] font-black uppercase tracking-[2px]">Collapse</button>
              </div>
            )}
          </div>

          <div className="flex mt-6 overflow-x-auto no-scrollbar gap-2 pb-1">
            {categories.map((cat, i) => (
              <button key={cat} onClick={() => setCurrentStep(i)} className={`flex-shrink-0 px-4 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${currentStep === i ? 'bg-[#F4F4F6] text-[#0A0F1E] border-[#F4F4F6] shadow-lg' : 'bg-white/5 text-white/30 border-white/5'}`}>
                {categoryLabels[cat]}
                {auditQuestions.filter(q => q.category === cat).every(q => scores[q.id] !== undefined) && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {questions.map((q, idx) => {
            const isBinary = q.text.includes('Scoring: 0 for No, 5 for Yes') || q.text.includes('Scoring: 0 for No/Missing, 5 for Yes/Perfect');
            const visibleScores = isBinary ? [0, 5] : [0, 1, 2, 3, 4, 5];
            
            return (
              <div key={q.id} className="bg-white rounded-[32px] p-8 space-y-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="bg-[#0A0F1E] px-4 py-1.5 rounded-full">
                    <span className="text-white text-[8px] font-black uppercase tracking-x-wide">{q.category}</span>
                  </div>
                  <div className="text-slate-300 font-black text-[10px]">{String(idx + 1).padStart(2, '0')}</div>
                </div>
                <p className="text-lg font-[900] leading-tight text-[#0A0F1E] tracking-tighter">{q.text}</p>
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex bg-[#F4F4F6] p-1.5 rounded-2xl border border-slate-100 gap-2 mb-4">
                    {visibleScores.map((val) => (
                      <button key={val} onClick={() => handleScore(q.id, val)} className={`flex-1 h-10 rounded-xl font-black text-base transition-all flex items-center justify-center ${scores[q.id] === val ? 'bg-[#0A0F1E] text-white shadow-lg' : 'text-slate-300'}`}>{val}</button>
                    ))}
                  </div>

                  {activeRemarkId === q.id || remarks[q.id] ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-2 ml-1">
                        <MessageSquare size={12} className="text-[#C9A84C]" />
                        <span className="text-[8px] font-black uppercase tracking-[2px] text-slate-400">Strategic Remark</span>
                      </div>
                      <textarea 
                        value={remarks[q.id] || ''}
                        onChange={(e) => setRemark(q.id, e.target.value)}
                        placeholder="Detail the observational anomaly..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] font-bold text-slate-900 outline-none resize-none focus:border-[#C9A84C] transition-all"
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveRemarkId(q.id)}
                      className="flex items-center gap-2 py-2 px-1 text-slate-400 hover:text-[#C9A84C] transition-colors group"
                    >
                      <MessageSquare size={14} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-[2px]">Add Observation</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </main>

        {/* Footer Tray */}
        <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 pt-6 pb-8 z-[60] shadow-2xl">
          <div className="max-w-2xl mx-auto w-full">
            <div className="mb-4 flex overflow-x-auto no-scrollbar gap-4">
               {photos.map(p => (
                 <button key={p.id} onClick={() => openEditEvidence(p)} className="flex-shrink-0 relative active:scale-95 transition-all">
                    <img src={p.uri} className="w-16 h-16 rounded-2xl object-cover border border-slate-100" alt="Evid" />
                    <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${p.tag === 'positive' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                       {p.tag === 'positive' ? <Plus size={10} strokeWidth={4} className="text-white" /> : <Minus size={10} strokeWidth={4} className="text-white" />}
                    </div>
                 </button>
               ))}
               <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400">
                  <Camera size={20} />
                  <span className="text-[6px] font-black uppercase tracking-[2px]">Add</span>
               </button>
            </div>
            <button onClick={handleSubmit} className="w-full bg-[#0A0F1E] text-white h-14 rounded-2xl font-black text-xs uppercase tracking-[3px] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
               {calculateResults().percentage === 100 ? 'CERTIFY & SUBMIT' : 'TRANSMIT DATA'}
               <CheckCircle2 size={18} className="text-[#C9A84C]" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuditForm;
