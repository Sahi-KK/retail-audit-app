import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuditStore } from '../store/auditStore';
import { useScoreCalc } from '../hooks/useScoreCalc';
import { auditQuestions, AuditCategory } from '../data/auditQuestions';
import { Share2, CheckCircle, X, Cloud, Eye } from 'lucide-react-native';
import { googleSheetsService } from '../services/googleSheets';

interface SubmitModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubmitModal({ visible, onClose }: SubmitModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [pdfUri, setPdfUri] = React.useState<string | null>(null);
  const [pdfTooLarge, setPdfTooLarge] = React.useState(false);
  const [cloudPdfLink, setCloudPdfLink] = React.useState<string | null>(null);
  
  const { headerInfo, photos, scores, remarks, submitAudit, saveDraft, isReadOnly, activeAuditId } = useAuditStore();
  const { percentage, earnedScore, totalMaxScore, categoryScores } = useScoreCalc();
  const params = useLocalSearchParams();
  const isEditing = params.isEditMode === 'true';

    const generateHtml = async () => {
      // 1. Generate Category Tables
      const isLensCrafters = headerInfo?.storeBrand === 'LensCrafters';
      const { customStores } = useAuditStore.getState();
      const currentStore = (customStores || []).find((s: any) => s.code.toLowerCase() === headerInfo.storeCode.toLowerCase());
      const resolvedCity = headerInfo.city || currentStore?.city || 'Bengaluru';
    
    const categories: { key: AuditCategory; label: string }[] = [
      { key: 'cleanliness', label: 'Cleanliness & Hygiene' },
      { key: 'merchandising', label: 'Visual Merchandising & Brand Integrity' },
      { key: 'operations', label: 'Store Operations & Asset Protection' },
      { key: 'staff', label: 'Staff Behaviour & Customer Experience' },
      { key: 'rayban_meta', label: 'Ray-Ban Meta Excellence' },
      ...(isLensCrafters ? [{ key: 'clinical', label: 'LensCrafters Clinical Operations' } as const] : []),
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
          <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; width: 85%;">
              <div>${q.text}</div>
              ${qRemark ? `<div style="margin-top: 5px; color: #D97706; font-style: italic; font-size: 10px; background: #FFFBEB; padding: 5px; border-radius: 4px;">Remark: ${qRemark}</div>` : ''}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; text-align: center; width: 15%; color: #0A0F1E;">${score} / 5</td>
          </tr>
        `;
      });

      tablesHtml += `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="background: #0A0F1E; color: #C9A84C; padding: 12px; margin: 0; border-radius: 8px 8px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            ${cat.label}
          </h3>
          <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #E5E7EB; border-top: none;">
            ${rows}
            <tr style="background: #F9FAFB; font-weight: bold;">
              <td style="padding: 12px; text-align: right;">Category Subtotal:</td>
              <td style="padding: 12px; text-align: center; color: #0A0F1E;">${catEarned} / ${catQuestions.length * 5}</td>
            </tr>
          </table>
        </div>
      `;
    });

    // 1.5 Generate Remarks Summary Section
    let remarksSummaryHtml = '';
    const questionsWithRemarks = auditQuestions.filter(q => remarks[q.id] && remarks[q.id].trim().length > 0);
    
    if (questionsWithRemarks.length > 0) {
      remarksSummaryHtml = `
        <div style="margin-top: 40px; page-break-inside: avoid;">
          <h2 style="color: #0A0F1E; border-left: 6px solid #D97706; padding-left: 15px; margin-bottom: 20px;">Strategic Observations (Remarks)</h2>
          <table style="width: 100%; border-collapse: collapse; background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; overflow: hidden;">
            <thead>
              <tr style="background: #FEF3C7; color: #92400E; text-align: left; font-size: 10px; text-transform: uppercase;">
                <th style="padding: 12px;">Question Detail</th>
                <th style="padding: 12px; text-align: center;">Score</th>
                <th style="padding: 12px;">Auditor Remark</th>
              </tr>
            </thead>
            <tbody>
              ${questionsWithRemarks.map(q => `
                <tr style="border-bottom: 1px solid #FDE68A;">
                  <td style="padding: 12px; font-size: 11px; font-weight: 600; width: 40%;">${q.text}</td>
                  <td style="padding: 12px; text-align: center; font-weight: 800; width: 10%;">${scores[q.id] || 0}</td>
                  <td style="padding: 12px; font-size: 11px; color: #92400E; width: 50%;">${remarks[q.id]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // 2. Generate Evidence Gallery
    let evidenceHtml = '';
    if (photos.length > 0) {
      evidenceHtml += `
        <div style="page-break-before: always;">
          <h2 style="margin-top: 40px; border-bottom: 3px solid #C9A84C; padding-bottom: 10px; color: #0A0F1E;">Visual Evidence Log</h2>
      `;
      
      for (const photo of photos) {
        try {
          let imgSrc = photo.uri;
          
          if (Platform.OS !== 'web') {
            const info = await FileSystem.getInfoAsync(photo.uri);
            if (!info.exists) {
              console.warn(`Photo not found at URI: ${photo.uri}`);
              continue;
            }
            const base64Str = await FileSystem.readAsStringAsync(photo.uri, { encoding: 'base64' });
            imgSrc = `data:image/jpeg;base64,${base64Str}`;
          }

          const badgeColor = photo.tag === 'positive' ? '#10B981' : '#EF4444';
          const badgeText = photo.tag === 'positive' ? 'POSITIVE (+)' : 'NEGATIVE (-)';

          evidenceHtml += `
            <div style="page-break-inside: avoid; margin-bottom: 40px; border: 1px solid #E5E7EB; padding: 25px; border-radius: 16px; background: #FFF; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h3 style="margin-top:0; margin-bottom:10px; color: #0A0F1E; font-size: 18px;">${photo.title || 'Audit Observation'}</h3>
              <div style="display:inline-block; font-size:11px; font-weight:bold; color: white; background: ${badgeColor}; padding: 6px 14px; border-radius: 99px; margin-bottom:20px; text-transform: uppercase;">
                ${badgeText}
              </div>
              <img src="${imgSrc}" style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 12px; border: 1px solid #eee; margin-bottom: 20px;" />
              <p style="color: #4B5563; font-style: italic; font-size: 14px; line-height: 1.6; background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #C9A84C;">
                "${photo.remark || 'No management remark provided.'}"
              </p>
              <div style="font-size:10px; color:#9CA3AF; margin-top:15px;">Recorded: ${new Date(photo.timestamp).toLocaleString()}</div>
            </div>
          `;
        } catch (e) {
          console.error("Evidence processing error", e);
        }
      }
      evidenceHtml += `</div>`;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; color: #111; line-height: 1.4; background: #fff; }
            .header-container { text-align: left; border-bottom: 4px solid #C9A84C; padding-bottom: 25px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header-left h1 { margin: 0; font-size: 32px; color: #0A0F1E; text-transform: uppercase; letter-spacing: 2px; }
            .header-info p { margin: 4px 0; color: #6B7280; font-weight: 500; }
            .main-score { background: #0A0F1E; color: #fff; padding: 30px; border-radius: 24px; text-align: center; margin-bottom: 50px; }
            .score-val { font-size: 72px; font-weight: 900; color: #C9A84C; margin: 0; line-height: 1; }
            .score-label { text-transform: uppercase; letter-spacing: 4px; font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 10px; display: block; }
            .even { background-color: #ffffff; }
            .odd { background-color: #FDFDFD; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="header-left">
              <h1>Retail Audit Report</h1>
              <div class="header-info" style="margin-top: 15px;">
                <p><strong>Brand:</strong> ${headerInfo.storeBrand}</p>
                <p><strong>Store:</strong> ${headerInfo.storeCode} - ${headerInfo.store}</p>
                <p><strong>City:</strong> ${resolvedCity}</p>
                <p><strong>Auditor:</strong> ${headerInfo.auditorName}</p>
                <p><strong>Date:</strong> ${headerInfo.date}</p>
              </div>
            </div>
            <div style="text-align: right;">
              <img src="https://logodix.com/logo/2012053.png" style="height: 40px; filter: grayscale(1); opacity: 0.5;" />
            </div>
          </div>

          <div class="main-score">
            <span class="score-label">Final Audit Score</span>
            <p class="score-val">${percentage}%</p>
            <p style="margin-top: 15px; color: #fff; font-weight: bold;">${earnedScore} / ${totalMaxScore} TOTAL POINTS EARNED</p>
          </div>

          <h2 style="color: #0A0F1E; border-left: 6px solid #C9A84C; padding-left: 15px; margin-bottom: 25px;">Detailed Category Scoring</h2>
          ${tablesHtml}

          ${remarksSummaryHtml}

          ${evidenceHtml}

          <div style="margin-top: 60px; text-align: center; color: #9CA3AF; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            This report was generated securely via the EssilorLuxottica Audit Intelligence Platform.<br/>
            &copy; ${new Date().getFullYear()} EssilorLuxottica SA. All Rights Reserved.
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = async () => {
    setIsProcessing(true);
    try {
      const html = await generateHtml();
      await Print.printAsync({ html });
    } catch (err) {
      Alert.alert("Error", "Failed to generate preview");
    } finally {
      setIsProcessing(false);
    }
  };

  const getFormattedFileName = () => {
    const store = (headerInfo.store || 'Store').replace(/[|\\/?:*<>"]/g, '_');
    const code = (headerInfo.storeCode || 'NA').replace(/[|\\/?:*<>"]/g, '_');
    const city = (headerInfo.city || 'City').replace(/[|\\/?:*<>"]/g, '_');
    const date = headerInfo.date || new Date().toISOString().split('T')[0];
    return `${store}_${code}_${city}_${date}.pdf`;
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setPdfTooLarge(false);
    setErrorMessage(null);
    
    try {
      if (isEditing && !activeAuditId) {
        Alert.alert("🚨 ID MISMATCH", "Could not verify original Audit ID. To prevent duplicates, please close this and re-open from History.");
        setIsSyncing(false);
        return;
      }

      const finalId = activeAuditId || Date.now().toString();
      
      // ZERO-LOSS PROTOCOL: Save locally as a draft BEFORE attempting cloud sync
      saveDraft({ percentage, earned: earnedScore, total: totalMaxScore });
      
      const html = await generateHtml();
      
      let base64 = null;
      if (Platform.OS !== 'web') {
        const result = await Print.printToFileAsync({ 
          html,
          base64: true 
        });
        setPdfUri(result.uri);
        base64 = result.base64;
      }

      // GHOST SHIELD: Increased limit to 45MB (Google Apps Script limit is 50MB)
      const isTooLarge = base64 && base64.length > 45 * 1024 * 1024;
      
      const safeHeader = {
        ...headerInfo,
        store: headerInfo.store || 'Unknown Store',
        storeCode: headerInfo.storeCode || 'NA',
        storeBrand: headerInfo.storeBrand || 'Unknown Brand'
      };

      const syncPayload = {
        auditData: {
          id: finalId,
          header: safeHeader,
          percentage,
          earned: earnedScore,
          total: totalMaxScore,
          categoryBreakdown: categoryScores,
          scores,
          remarks,
          photos: photos.map(p => ({ title: p.title, tag: p.tag, timestamp: p.timestamp, remark: p.remark })), // Send metadata
          timestamp: new Date().toISOString()
        },
        pdfBase64: isTooLarge ? null : base64
      };

      if (isTooLarge) {
        setPdfTooLarge(true);
        console.warn("PDF Payload too large for cloud sync, stripped images to save data integrity.");
      }
      
      const syncPromise = googleSheetsService.syncAudit(syncPayload.auditData, syncPayload.pdfBase64 as string);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Cloud Response Timeout (12s). Please use 'Save PDF Locally'.")), 12000)
      );

      const syncResult = await Promise.race([syncPromise, timeoutPromise]) as any;
      setIsSyncing(false);
      setIsProcessing(false);
      
      if (syncResult.status === 'success') {
        setSyncStatus('success');
        setErrorMessage(null);
        setCloudPdfLink(syncResult.pdfLink);
      } else {
        setSyncStatus('error');
        setErrorMessage(syncResult.message || 'Check connection');
        Alert.alert(
          "Sync Diagnostic",
          `Record ID: ${finalId}\nResult: ${syncResult.status}\nError: ${syncResult.message || "Failed to reach Google Hub."}`
        );
      }
    } catch (err) {
      setIsSyncing(false);
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      setErrorMessage(msg);
      Alert.alert("Technical Error", msg);
    }
  };

  const handleShare = async () => {
    try {
      const html = await generateHtml();
      
      if (Platform.OS === 'web') {
        // Web: Direct browser print (which allows "Save as PDF")
        await Print.printAsync({ html });
        return;
      }

      let currentUri = pdfUri;
      if (!currentUri) {
        Alert.alert("Processing", "Generating report, please wait...");
        const { uri } = await Print.printToFileAsync({ html });
        currentUri = uri;
        setPdfUri(uri);
      }

      // Rename file for sharing
      const customName = getFormattedFileName();
      const newUri = FileSystem.cacheDirectory + customName;
      
      // Ensure the destination is clean
      const fileInfo = await FileSystem.getInfoAsync(newUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(newUri);
      }

      await FileSystem.copyAsync({
        from: currentUri,
        to: newUri
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Incompatible", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Retail Audit Report',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error("Sharing Error:", error);
      const msg = error instanceof Error ? error.message : "Internal Sharing Failure";
      Alert.alert("Export Error", `Failed to generate or share the report: ${msg}`);
    }
  };

  const handleFinalize = async () => {
    const finalId = activeAuditId || Date.now().toString();
    
    if (syncStatus === 'success') {
      if (!isReadOnly) {
        submitAudit({ percentage, earned: earnedScore, total: totalMaxScore });
        // The submitAudit resets everything, but we need the audit in history to be marked as synced
        // However, submitAudit creates a NEW entry. 
        // We should probably mark the most recent one as synced if it matches finalId
        const { markAsSynced } = useAuditStore.getState();
        markAsSynced(finalId, cloudPdfLink || '');
        onClose();
        router.replace('/');
      }
      return;
    }

    setIsProcessing(true);
    await handleSyncToCloud();
    setIsProcessing(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        
        <View className="bg-white rounded-t-[56px] pt-12 pb-14 px-10 shadow-2xl">
          <View className="flex-row justify-between items-start mb-10 px-2">
            <View>
              <Text className="text-slate-900 font-semibold text-3xl tracking-tighter">
                {isEditing ? 'Sync Changes' : 'Audit Summary'}
              </Text>
              <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-[3px] mt-2.5">
                {isEditing ? 'Market Segment Adjustment' : 'Strategic Validation'}
              </Text>
            </View>
            <Pressable onPress={onClose} className="bg-slate-50 p-3.5 rounded-2xl active:scale-95">
               <X size={20} color="#94A3B8" />
            </Pressable>
          </View>

          <ScrollView className="mb-12" showsVerticalScrollIndicator={false}>
            <View className="bg-slate-50 rounded-[40px] p-10 flex-row justify-between items-center mb-10">
              <View>
                <Text className="text-slate-400 text-[9px] font-medium uppercase tracking-[3px] mb-3">Compliance Index</Text>
                <Text className="text-slate-900 text-6xl font-semibold tracking-tighter leading-none">{percentage}%</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-400 text-[9px] font-medium uppercase tracking-[3px] mb-3">Status</Text>
                <Text className={`font-semibold text-lg uppercase tracking-widest ${percentage >= 85 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {percentage >= 85 ? 'Secure' : 'At Risk'}
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-[40px] p-8 shadow-sm">
               <View className="flex-row items-center mb-6">
                 <View className="bg-slate-50 p-2.5 rounded-xl">
                    <CheckCircle size={14} color="#94A3B8" />
                 </View>
                 <Text className="ml-4 text-slate-500 font-semibold text-xs tracking-tight" numberOfLines={1}>Location: {headerInfo.store.split(',')[0]}</Text>
               </View>
               <View className="flex-row items-center mb-6">
                 <View className="bg-slate-50 p-2.5 rounded-xl">
                    <CheckCircle size={14} color="#94A3B8" />
                 </View>
                 <Text className="ml-4 text-slate-500 font-semibold text-xs tracking-tight">Evidence: {photos.length} Captured</Text>
               </View>
               <View className="flex-row items-center mb-6">
                 <View className="bg-slate-50 p-2.5 rounded-xl">
                    <CheckCircle size={14} color="#94A3B8" />
                 </View>
                 <Text className="ml-4 text-slate-500 font-semibold text-xs tracking-tight">Lead: {headerInfo.auditorName}</Text>
               </View>

               <View className="pt-6 mt-6 border-t border-slate-50">
                 <View className="flex-row items-center justify-between">
                   <View className="flex-row items-center">
                     <View className={`p-2.5 rounded-xl ${syncStatus === 'success' ? 'bg-emerald-50' : (syncStatus === 'error' ? 'bg-rose-50' : 'bg-slate-50')}`}>
                        <Cloud size={14} color={syncStatus === 'success' ? '#10B981' : (syncStatus === 'error' ? '#EF4444' : '#94A3B8')} />
                     </View>
                     <View className="ml-4">
                       <Text className="text-slate-900 font-bold text-[11px] uppercase tracking-wider">Cloud Data Sync</Text>
                       <Text className={`text-[10px] font-medium mt-0.5 ${syncStatus === 'success' ? 'text-emerald-500' : (syncStatus === 'error' ? 'text-rose-500' : 'text-slate-400')}`}>
                         {isSyncing ? 'Synchronizing Live...' : (syncStatus === 'success' ? (pdfTooLarge ? 'Data Vaulted (Archive Disabled)' : 'Vaulted Successfully') : (syncStatus === 'error' ? (errorMessage || 'Sync Failed') : 'Ready to Sync'))}
                       </Text>
                     </View>
                   </View>
                   {isSyncing ? (
                     <ActivityIndicator size="small" color="#0F172A" />
                   ) : (
                     <View className={`w-2 h-2 rounded-full ${syncStatus === 'success' ? 'bg-emerald-500' : (syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-200')}`} />
                   )}
                 </View>
               </View>
            </View>
          </ScrollView>

          {isProcessing && !errorMessage && (
            <View className="mb-6 items-center">
              <ActivityIndicator color="#C9A84C" size="large" />
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4">Cloud Handshake in Progress...</Text>
              <Pressable 
                onPress={() => { setIsProcessing(false); setIsSyncing(false); }} 
                className="mt-4 px-6 py-2 bg-slate-50 rounded-full"
              >
                <Text className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Cancel & Export Locally</Text>
              </Pressable>
            </View>
          )}

          <View className="gap-y-5 px-2">
            <Pressable
              onPress={handleShare}
              className={`py-6 rounded-[32px] flex-row items-center justify-center active:scale-[0.98] border ${
                syncStatus === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <Share2 size={20} color={syncStatus === 'success' ? '#10B981' : '#94A3B8'} />
              <Text className={`font-bold text-lg ml-4 tracking-tight ${
                syncStatus === 'success' ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {syncStatus === 'success' ? 'Export & Share Report' : 'Save PDF Locally (No Cloud)'}
              </Text>
            </Pressable>

            {!isProcessing && (
              <Pressable
                onPress={handleFinalize}
                className={`py-6 rounded-[40px] flex-row items-center justify-center shadow-2xl active:opacity-90 active:scale-[0.98] ${
                  syncStatus === 'success' ? 'bg-slate-900' : 'bg-[#C9A84C]'
                }`}
              >
                {syncStatus === 'success' ? (
                   <CheckCircle size={20} color="#C9A84C" />
                ) : (
                   <Cloud size={20} color="#0A0F1E" />
                )}
                <Text className={`font-bold text-lg ml-4 tracking-tight ${syncStatus === 'success' ? 'text-white' : 'text-slate-900'}`}>
                  {syncStatus === 'success' ? 'Finish & Exit Audit' : (isEditing ? 'Sync Changes' : 'Authenticate & Certify')}
                </Text>
              </Pressable>
            )}

            <Pressable onPress={onClose} className="py-4 items-center justify-center">
              <Text className="text-slate-300 font-medium text-[10px] uppercase tracking-[3px]">Dismiss</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}
