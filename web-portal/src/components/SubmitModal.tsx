import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { useScoreCalc } from '../hooks/useScoreCalc';
import { auditQuestions } from '../data/auditQuestions';
import { Share2, CheckCircle, X, Cloud, Activity, MapPin, User, Calendar } from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { headerInfo, photos, scores, remarks, submitAudit, activeAuditId } = useAuditStore();
  const { percentage, earnedScore, totalMaxScore, categoryScores } = useScoreCalc();

  const generateReportHtml = () => {
    const isLensCrafters = headerInfo?.storeBrand === 'LensCrafters';
    const { customStores } = useAuditStore.getState();
    const currentStore = (customStores || []).find((s: any) => s.code.toLowerCase() === headerInfo.storeCode.toLowerCase());
    const resolvedCity = headerInfo.city || currentStore?.city || 'Bengaluru';
    const categories = [
      { key: 'cleanliness', label: 'Cleanliness & Hygiene' },
      { key: 'merchandising', label: 'Visual Merchandising & Brand Integrity' },
      { key: 'operations', label: 'Store Operations & Asset Protection' },
      { key: 'staff', label: 'Staff Behaviour & Customer Experience' },
      { key: 'rayban_meta', label: 'Ray-Ban Meta Excellence' },
      ...(isLensCrafters ? [{ key: 'clinical', label: 'LensCrafters Clinical Operations' }] : []),
    ];

    let tablesHtml = '';
    categories.forEach((cat) => {
      const catQuestions = auditQuestions.filter(q => q.category === cat.key);
      let catEarned = 0;
      let rows = '';

      catQuestions.forEach((q, idx) => {
        const score = scores[q.id] || 0;
        const qRemark = remarks[q.id] || '';
        catEarned += score;
        rows += `
          <tr style="background: ${idx % 2 === 0 ? '#fff' : '#fcfcfc'}">
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 11px; width: 80%;">
              <div>${q.text}</div>
              ${qRemark ? `<div style="margin-top: 5px; color: #D97706; font-style: italic; font-size: 10px; background: #FFFBEB; padding: 6px; border-radius: 4px; border-left: 3px solid #D97706;">Remark: ${qRemark}</div>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; text-align: center; width: 20%; color: #0A0F1E;">${score} / 5</td>
          </tr>
        `;
      });

      tablesHtml += `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="background: #0A0F1E; color: #C9A84C; padding: 14px; margin: 0; border-radius: 12px 12px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            ${cat.label}
          </h3>
          <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #E5E7EB; border-top: none;">
            ${rows}
            <tr style="background: #F9FAFB; font-weight: bold;">
              <td style="padding: 14px; text-align: right; font-size: 12px;">Category Subtotal:</td>
              <td style="padding: 14px; text-align: center; color: #0A0F1E; font-size: 14px;">${catEarned} / ${catQuestions.length * 5}</td>
            </tr>
      </table>
        </div>
      `;
    });

    // Evidence Photos Section
    let photosHtml = '';
    if (photos && photos.length > 0) {
      const positivePhotos = photos.filter(p => p.tag === 'positive');
      const negativePhotos = photos.filter(p => p.tag === 'negative');

      const renderPhotoGroup = (title: string, color: string, list: any[]) => {
        if (list.length === 0) return '';
        let items = '';
        list.forEach(p => {
          items += `
            <div style="width: 48%; margin-bottom: 20px; border: 1px solid #eee; border-radius: 12px; overflow: hidden; page-break-inside: avoid; background: #fff;">
              <img src="${p.uri}" style="width: 100%; height: 180px; object-fit: cover; border-bottom: 1px solid #eee;" />
              <div style="padding: 12px;">
                <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; color: #0A0F1E;">${p.title}</div>
                <div style="font-size: 10px; color: #666; line-height: 1.4;">${p.remark}</div>
              </div>
            </div>
          `;
        });
        return `
          <div style="margin-top: 40px; page-break-inside: avoid;">
            <h3 style="color: ${color}; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 20px;">
              ${title}
            </h3>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
              ${items}
            </div>
          </div>
        `;
      };

      photosHtml = `
        <div style="margin-top: 60px;">
          <h2 style="text-align: center; font-[900] text-xl uppercase italic tracking-tighter color: #0A0F1E; margin-bottom: 30px;">
            Visual Evidence Vault
          </h2>
          ${renderPhotoGroup('Negative Findings / Action Required', '#EF4444', negativePhotos)}
          ${renderPhotoGroup('Positive Compliance / Best Practices', '#10B981', positivePhotos)}
        </div>
      `;
    }

    return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; max-width: 900px; margin: 0 auto; background: #fff; }
            .header { border-bottom: 4px solid #C9A84C; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; }
            .score-box { background: #0A0F1E; color: #fff; padding: 40px; border-radius: 32px; text-align: center; margin-bottom: 40px; }
            .score-val { font-size: 80px; font-weight: 900; color: #C9A84C; margin: 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0; font-size: 28px; text-transform: uppercase;">Retail Audit Report</h1>
              <p style="color: #666; margin: 5px 0;">Store: ${headerInfo.storeCode} - ${headerInfo.store}</p>
              <p style="color: #666; margin: 5px 0;">City: ${resolvedCity}</p>
              <p style="color: #666; margin: 5px 0;">Auditor: ${headerInfo.auditorName}</p>
              <p style="color: #666; margin: 5px 0;">Date: ${headerInfo.date}</p>
            </div>
            <div style="text-align:right">
               <div style="color: #C9A84C; font-weight: 900; font-size: 20px;">ESSILORLUXOTTICA</div>
               <div style="color: #666; font-size: 10px; margin-top: 5px;">STRATEGIC HUB v3.1</div>
            </div>
          </div>
          <div class="score-box">
            <div style="text-transform: uppercase; letter-spacing: 5px; font-size: 12px; opacity: 0.6; margin-bottom: 10px;">Compliance Index</div>
            <p class="score-val">${percentage}%</p>
            <div style="margin-top: 10px; font-weight: bold;">${earnedScore} / ${totalMaxScore} POINTS</div>
          </div>
          ${tablesHtml}
          ${photosHtml}
          <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
            &copy; ${new Date().getFullYear()} EssilorLuxottica Strategic Hub. Proprietary Data.
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = () => {
    const html = generateReportHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleFinalize = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      await submitAudit({ percentage, earned: earnedScore, total: totalMaxScore });
      setSyncStatus('success');
      setTimeout(() => {
        onClose();
        navigate('/');
      }, 1500);
    } catch (e) {
      setSyncStatus('error');
      setErrorMessage('Hub connection failed');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center px-4 bg-[#0A0F1E]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-t-[56px] sm:rounded-[56px] p-10 shadow-2xl relative animate-in slide-in-from-bottom-20 duration-500">
        
        <header className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-[900] text-[#0A0F1E] italic uppercase tracking-tighter">Audit Summary</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mt-2">Strategic Validation</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </header>

        <main className="space-y-10">
          <div className="bg-slate-50 rounded-[40px] p-10 flex items-center justify-between shadow-inner">
            <div>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[3px] mb-3">Compliance Index</p>
              <h3 className="text-[#0A0F1E] text-7xl font-[900] tracking-tighter italic leading-none">{percentage}%</h3>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[3px] mb-3">Status</p>
              <div className={`text-xl font-black italic uppercase tracking-widest ${percentage >= 85 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {percentage >= 85 ? 'Secure' : 'At Risk'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MapPin size={18} /></div>
              <div>
                 <p className="text-slate-800 font-black text-[10px] uppercase tracking-wider">{headerInfo.storeCode}</p>
                 <p className="text-slate-400 text-[8px] font-bold truncate max-w-[150px]">{headerInfo.store}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><User size={18} /></div>
              <div>
                 <p className="text-slate-800 font-black text-[10px] uppercase tracking-wider">Auditor Lead</p>
                 <p className="text-slate-400 text-[8px] font-bold">{headerInfo.auditorName}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleExport}
              className="w-full bg-slate-50 h-20 rounded-[32px] flex items-center justify-center gap-4 border border-slate-100 hover:bg-slate-100 transition-all active:scale-[0.98]"
            >
              <Share2 size={24} className="text-slate-400" />
              <span className="font-black text-lg uppercase italic tracking-tight text-slate-500">Export Report</span>
            </button>

            <button 
              onClick={handleFinalize}
              disabled={isSyncing}
              className={`w-full h-24 rounded-[40px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl active:scale-[0.98] transition-all ${syncStatus === 'success' ? 'bg-emerald-500' : 'bg-[#0A0F1E]'}`}
            >
              {isSyncing ? (
                <div className="flex flex-col items-center">
                  <Activity size={24} className="text-[#C9A84C] animate-pulse mb-2" />
                  <span className="text-white text-[8px] font-black uppercase tracking-[3px]">Syncing with Hub...</span>
                </div>
              ) : syncStatus === 'success' ? (
                <div className="flex items-center gap-4">
                  <CheckCircle size={28} className="text-white" />
                  <span className="text-white font-black text-xl uppercase italic tracking-tighter">Vaulted</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-3 mb-1">
                      <Cloud size={20} className="text-[#C9A84C]" />
                      <span className="text-white font-black text-xl uppercase italic tracking-tight">Finish & Sync</span>
                   </div>
                   <span className="text-white/30 text-[8px] font-black uppercase tracking-[4px]">Finalize Record to Master Hub</span>
                </div>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
