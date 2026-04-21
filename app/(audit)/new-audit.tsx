import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, Dimensions } from 'react-native';
import { useAuditStore } from '../../store/auditStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, Info, 
  Camera, Layout, Sparkles, ShieldCheck, 
  ArrowRight, Save, Trash2 
} from 'lucide-react-native';

// --- Audit Configuration ---

interface AuditQuestion {
  id: string;
  label: string;
  category: string;
  weight: number;
}

const AUDIT_QUESTIONS: AuditQuestion[] = [
  // 1. WINDOWS & ENTRANCE (High Impact)
  { id: 'ext_trans', label: 'Window Transparency & Crystal Clear Glass', category: 'Windows', weight: 5 },
  { id: 'ext_signage', label: 'Campaign Signage Correctly Backlit & Positioned', category: 'Windows', weight: 5 },
  { id: 'ext_entrance', label: 'Entrance Path Clear of Obstructions', category: 'Windows', weight: 3 },
  
  // 2. VISUAL MERCHANDISING
  { id: 'vm_lighting', label: 'Product Lighting Optimized (No Dead Bulbs)', category: 'Merchandising', weight: 5 },
  { id: 'vm_shelving', label: 'Shelving Aligned & Dust-Free', category: 'Merchandising', weight: 3 },
  { id: 'vm_plp', label: 'Product Layout Follows Planogram Guidelines', category: 'Merchandising', weight: 5 },
  { id: 'vm_tags', label: 'All Items Have Clear, Professional Price Tags', category: 'Merchandising', weight: 4 },

  // 3. HYGIENE & SAFETY
  { id: 'h_floors', label: 'Floors Polished & Reflective', category: 'Hygiene', weight: 3 },
  { id: 'h_mirrors', label: 'Trial Mirrors Fingerprint-Free', category: 'Hygiene', weight: 4 },
  { id: 'h_staff', label: 'Staff Appearance (Uniform & Grooming) Verified', category: 'Hygiene', weight: 5 },

  // 4. BACK OFFICE & INVENTORY
  { id: 'inv_drawers', label: 'Storage Drawers Organized & Labeled', category: 'Inventory', weight: 4 },
  { id: 'inv_stock', label: 'Out of Stock Items Removed from Display', category: 'Inventory', weight: 5 },
];

const CATEGORIES = [...new Set(AUDIT_QUESTIONS.map(q => q.category))];

export default function NewAuditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { headerInfo, scores, setScore, submitAudit, resetAudit } = useAuditStore();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  // --- Logic ---

  const currentCategoryQuestions = AUDIT_QUESTIONS.filter(q => q.category === activeCategory);
  
  const [isSyncing, setIsSyncing] = useState(false);

  const stats = useMemo(() => {
    let earned = 0;
    let total = 0;
    
    AUDIT_QUESTIONS.forEach(q => {
      const score = scores[q.id] || 0;
      earned += (score / 10) * q.weight;
      total += q.weight;
    });

    const percentage = total > 0 ? (earned / total) * 100 : 0;
    return {
      percentage: Math.round(percentage),
      earned: Number(earned.toFixed(1)),
      total,
      questionsAnswered: Object.keys(scores).length,
      totalQuestions: AUDIT_QUESTIONS.length
    };
  }, [scores]);

  const handleFinish = () => {
    if (stats.questionsAnswered < stats.totalQuestions) {
      Alert.alert(
        "Incomplete Audit", 
        `You have only answered ${stats.questionsAnswered}/${stats.totalQuestions} items. Proceed to finish?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit Anyway", onPress: () => finalizeSubmission() }
        ]
      );
    } else {
      finalizeSubmission();
    }
  };

  const finalizeSubmission = async () => {
    const auditData = {
      id: Date.now().toString(),
      auditor: headerInfo.auditorName,
      auditorId: headerInfo.auditorId,
      store: headerInfo.store,
      storeCode: headerInfo.storeCode,
      brand: headerInfo.storeBrand,
      score: stats.percentage,
      details: scores,
      timestamp: new Date().toISOString()
    };

    setIsSyncing(true);
    try {
      const { googleSheetsService } = require('../../services/googleSheets');
      const result = await googleSheetsService.syncAudit(auditData);
      
      if (result.status === 'success') {
        submitAudit({
          percentage: stats.percentage,
          earned: stats.earned,
          total: stats.total
        });
        Alert.alert("Success", "Audit submitted and synced to Cloud Hub.");
        router.replace('/(tabs)');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      // Fallback: Save locally even if sync fails
      submitAudit({
        percentage: stats.percentage,
        earned: stats.earned,
        total: stats.total
      });
      Alert.alert("Partial Success", "Audit saved locally, but Cloud Sync failed. Please check network.");
      router.replace('/(tabs)');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Discard Audit?",
      "All current progress will be permanently lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => {
          resetAudit();
          router.replace('/(tabs)');
        }}
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      
      {/* Header Overlay */}
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
        <View className="items-center">
          <Text className="text-slate-400 text-[8px] font-black uppercase tracking-[3px]">Active Assessment</Text>
          <Text className="text-slate-900 font-black text-xs">{headerInfo.store || 'Unknown Store'}</Text>
        </View>
        <Pressable onPress={handleReset} className="p-2 -mr-2">
          <Trash2 size={18} color="#FDA4AF" />
        </Pressable>
      </View>

      {/* Progress Bar Layer */}
      <View className="h-1 bg-slate-100">
        <View 
          className="h-full bg-[#C9A84C]" 
          style={{ width: `${(stats.questionsAnswered / stats.totalQuestions) * 100}%` }} 
        />
      </View>

      <View className="flex-1 flex-row">
        
        {/* Left Navigation Rail (Categories) */}
        <View className="w-24 bg-white border-r border-slate-100">
          <ScrollView showsVerticalScrollIndicator={false}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              const catQuestions = AUDIT_QUESTIONS.filter(q => q.category === cat);
              const answeredInCat = catQuestions.filter(q => !!scores[q.id]).length;
              const isComplete = answeredInCat === catQuestions.length;

              return (
                <Pressable 
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  className={`py-8 items-center border-b border-slate-50 ${isActive ? 'bg-slate-50' : ''}`}
                >
                  <View className={`w-10 h-10 rounded-2xl items-center justify-center mb-2 ${
                    isActive ? 'bg-[#C9A84C]' : 'bg-slate-100'
                  }`}>
                    {cat === 'Windows' && <Layout size={20} color={isActive ? '#FFF' : '#64748B'} />}
                    {cat === 'Merchandising' && <Sparkles size={20} color={isActive ? '#FFF' : '#64748B'} />}
                    {cat === 'Hygiene' && <CheckCircle2 size={20} color={isActive ? '#FFF' : '#64748B'} />}
                    {cat === 'Inventory' && <ShieldCheck size={20} color={isActive ? '#FFF' : '#64748B'} />}
                  </View>
                  <Text className={`text-[8px] font-black uppercase tracking-tighter text-center px-2 ${
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {cat}
                  </Text>
                  {isComplete && (
                    <View className="absolute top-2 right-2">
                      <CheckCircle2 size={10} color="#10B981" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Audit Form Section */}
        <View className="flex-1">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            <View className="mb-10">
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[4px] mb-2">{activeCategory}</Text>
              <Text className="text-slate-800 text-2xl font-black tracking-tight leading-tight">Compliance Point Checklist</Text>
            </View>

            <View className="gap-y-10 pb-20">
              {currentCategoryQuestions.map(q => (
                <View key={q.id}>
                  <View className="flex-row items-start mb-6">
                    <View className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 mr-3" />
                    <Text className="flex-1 text-slate-700 font-bold text-base leading-snug">{q.label}</Text>
                  </View>

                  <View className="flex-row gap-x-2">
                    {[0, 2, 4, 6, 8, 10].map(s => {
                      const isSelected = scores[q.id] === s;
                      return (
                        <Pressable
                          key={s}
                          onPress={() => setScore(q.id, s)}
                          className={`flex-1 h-12 rounded-xl items-center justify-center border ${
                            isSelected ? 'bg-slate-900 border-slate-900 shadow-md' : 'bg-white border-slate-200'
                          }`}
                        >
                          <Text className={`font-black text-xs ${isSelected ? 'text-gold' : 'text-slate-400'}`}>
                            {s}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Footer Submission Bar */}
      <View className="bg-white px-8 py-6 border-t border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Live Efficiency</Text>
          <Text className="text-slate-900 text-2xl font-black">{stats.percentage}%</Text>
        </View>

        <Pressable 
          onPress={handleFinish}
          className="bg-[#C9A84C] py-4 px-8 rounded-2xl flex-row items-center shadow-lg active:scale-95"
        >
          <Text className="text-slate-900 font-black text-sm uppercase tracking-tight mr-3">Finalize Audit</Text>
          <ArrowRight size={18} color="#0F172A" strokeWidth={3} />
        </Pressable>
      </View>

    </View>
  );
}
