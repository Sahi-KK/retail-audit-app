import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, AlertTriangle, FileText, Calendar, X, Trash2, Pencil } from 'lucide-react-native';
import { useAuditStore, PhotoEvidence } from '../../../store/auditStore';
import { useScoreCalc } from '../../../hooks/useScoreCalc';
import { locationData, StoreBrand } from '../../../data/locationData';
import { Badge } from '../../../components/Badge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StoreDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storeCode: rawStoreCode } = useLocalSearchParams();
  const storeCode = decodeURIComponent(rawStoreCode as string);
  
  const { getStoreStats } = useScoreCalc();
  const { startNewAudit, deleteAudit, customStores } = useAuditStore();
  const stats = getStoreStats(storeCode);
  const [selectedPhoto, setSelectedPhoto] = React.useState<PhotoEvidence | null>(null);

  const storeInfo = React.useMemo(() => {
    const defaults = locationData["Karnataka"]["Bengaluru"];
    const all = [...(customStores || []), ...defaults];
    return all.find(s => s.code === storeCode);
  }, [storeCode, customStores]);

  const handleStartAudit = () => {
    if (!storeInfo) return;
    startNewAudit();
    router.push(`/(audit)/cleanliness?prefillStoreCode=${encodeURIComponent(storeCode)}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this audit? This action cannot be reversed.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteAudit(id) 
        }
      ]
    );
  };

  if (!storeInfo) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-offwhite">
        <Text className="text-navy font-bold text-lg">Store not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-navy px-6 py-2 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-300';
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-6 flex-row justify-between items-center bg-white shadow-sm">
        <Pressable onPress={() => router.back()} className="bg-slate-50 p-3 rounded-2xl">
          <ArrowLeft size={18} color="#0F172A" />
        </Pressable>
        <View className="items-center">
          <Text className="text-slate-400 text-[9px] font-medium uppercase tracking-[3px] mb-1">{storeInfo.code}</Text>
          <Text className="text-slate-800 font-semibold text-lg tracking-tight mb-2" numberOfLines={1}>{storeInfo.name.split(',')[0]}</Text>
          <Badge brand={storeInfo.brand} />
        </View>
        <View className="w-12" />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="bg-white px-6 pt-10 pb-12 mb-12 rounded-b-[48px] shadow-sm">
          <View className="flex-row items-center justify-between mb-10">
            <View>
              <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-[2px] mb-2">Location Rating</Text>
              <Text className={`text-6xl font-semibold tracking-tighter ${getScoreColor(stats.avgScore)}`}>
                {stats.avgScore !== null ? `${stats.avgScore}%` : 'N/A'}
              </Text>
            </View>
            <View className="bg-slate-900 px-8 py-6 rounded-[40px] items-end shadow-xl">
              <Text className="text-white font-semibold text-4xl tracking-tighter leading-none">{stats.auditCount}</Text>
              <Text className="text-slate-400 text-[9px] font-medium uppercase tracking-widest mt-2">Historic Logs</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-slate-50 p-6 rounded-[32px]">
            <Calendar size={18} color="#94A3B8" />
            <Text className="ml-4 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
              {stats.lastAuditDate ? `Latest Entry: ${new Date(stats.lastAuditDate).toLocaleDateString()}` : 'Audit Required'}
            </Text>
          </View>
        </View>

        {/* Store Category Heatmap */}
        {stats.auditCount > 0 && (
          <View className="px-6 mb-12">
            <View className="bg-white rounded-[40px] p-8 shadow-sm">
              <View className="flex-row items-center mb-8 px-2">
                <View className="w-1.5 h-1.5 rounded-full bg-gold mr-3 shadow-sm" />
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px]">Store Category Performance</Text>
              </View>

              <View className="gap-y-5">
                {( (stats.categoryStats as any) || []).map((cat: any) => {
                  const getBarColor = (p: number) => {
                    if (p >= 85) return 'bg-emerald-500';
                    if (p >= 70) return 'bg-amber-500';
                    return 'bg-red-500';
                  };

                  return (
                    <View key={cat.category} className="mb-1">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{cat.label}</Text>
                        <Text className="text-slate-900 font-bold text-[10px]">{cat.percentage}%</Text>
                      </View>
                      <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <View 
                          className={`h-full rounded-full ${getBarColor(cat.percentage)}`} 
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Red Flag Gallery */}
        <View className="px-6 mb-12">
          <View className="flex-row items-center mb-8 px-2">
            <View>
              <Text className="text-slate-800 font-semibold text-xl tracking-tight">Priority Flags</Text>
              <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-[2px] mt-1.5">Unresolved Critical Evidence</Text>
            </View>
            <View className="ml-auto bg-rose-50 px-3 py-1.5 rounded-full">
              <Text className="text-rose-500 text-[10px] font-bold">{stats.negativeEvidence.length}</Text>
            </View>
          </View>

          {stats.negativeEvidence.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {stats.negativeEvidence.map((photo) => (
                <Pressable 
                  key={photo.id} 
                  onPress={() => setSelectedPhoto(photo)}
                  className="mr-5 w-64 bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm active:scale-[0.98]"
                >
                  <Image source={{ uri: photo.uri }} className="w-full h-44 bg-slate-100" />
                  <View className="p-5">
                    <Text className="text-slate-900 font-black text-base mb-1" numberOfLines={1}>{photo.title}</Text>
                    <Text className="text-slate-500 text-xs italic mb-4 leading-relaxed" numberOfLines={2}>"{photo.remark}"</Text>
                    <View className="pt-3 border-t border-slate-50">
                      <Text className="text-slate-300 text-[10px] font-black uppercase tracking-widest">
                        Ref: {new Date(photo.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] items-center">
              <Text className="text-emerald-700 font-bold">No Violations Found</Text>
              <Text className="text-emerald-600/60 text-xs mt-1 text-center">Location is currently operating at gold standards.</Text>
            </View>
          )}
        </View>

        {/* History */}
        <View className="px-6 mt-6 mb-32">
          <Text className="text-slate-800 font-semibold text-xl tracking-tight mb-8 px-2">Audit History</Text>
          {stats.history.length > 0 ? (
            stats.history.map((audit) => (
              <View key={audit.id} className="bg-white rounded-[32px] p-6 mb-6 shadow-sm">
                <Pressable
                  onPress={() => router.push(`/(audit)/cleanliness?auditId=${audit.id}`)}
                  className="active:opacity-80"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-4">
                      <Text className="text-slate-800 font-semibold text-base tracking-tight leading-tight mb-1">
                        {new Date(audit.completedAt).toLocaleDateString()}
                      </Text>
                      <Text className="text-slate-400 text-[9px] font-medium uppercase tracking-widest">{audit.headerInfo.auditorName || 'Field Representative'}</Text>
                    </View>
                    <Text className={`text-xl font-semibold tracking-tighter ${getScoreColor(audit.finalPercentage)}`}>
                      {audit.finalPercentage}%
                    </Text>
                  </View>
                </Pressable>
                
                <View className="flex-row items-center justify-end pt-4 border-t border-slate-50 mt-2 gap-x-5">
                   <Pressable 
                     onPress={() => router.push(`/(audit)/cleanliness?auditId=${audit.id}&isEditMode=true`)}
                     className="active:scale-95 bg-slate-50 p-2 rounded-xl"
                   >
                     <Pencil size={15} color="#94A3B8" />
                   </Pressable>
                   <Pressable 
                     onPress={() => handleDelete(audit.id)}
                     className="active:scale-95 bg-slate-50 p-2 rounded-xl"
                   >
                     <Trash2 size={15} color="#FDA4AF" />
                   </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white/50 border border-dashed border-slate-200 p-8 rounded-[32px] items-center">
               <Text className="text-slate-400 font-bold italic text-xs">No historical records in this cluster.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View className="absolute bottom-10 left-0 right-0 px-8">
        <Pressable 
          onPress={handleStartAudit}
          className="bg-slate-900 py-6 rounded-[40px] flex-row items-center justify-center shadow-2xl active:opacity-90 active:scale-[0.98]"
        >
          <Plus size={24} color="#C9A84C" />
          <Text className="text-white font-semibold text-lg ml-4 tracking-tight">Initiate Field Audit</Text>
        </Pressable>
      </View>

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View className="flex-1 bg-black/95 justify-center items-center">
          <Pressable 
            onPress={() => setSelectedPhoto(null)} 
            className="absolute top-12 right-6 z-10 bg-white/10 p-3 rounded-full"
          >
            <X size={24} color="white" />
          </Pressable>

          {selectedPhoto && (
            <View className="w-full px-6 items-center">
              <Image 
                source={{ uri: selectedPhoto.uri }} 
                className="w-full aspect-[4/3] rounded-2xl bg-gray-800"
                resizeMode="contain"
              />
              <View className="mt-8 bg-white/5 p-6 rounded-3xl border border-white/10 w-full">
                <Text className="text-gold font-bold text-xl mb-3 tracking-tight">
                  {selectedPhoto.title}
                </Text>
                <Text className="text-white text-base leading-relaxed italic">
                  "{selectedPhoto.remark}"
                </Text>
                <View className="mt-6 pt-4 border-t border-white/10 flex-row justify-between items-center">
                  <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Recorded: {new Date(selectedPhoto.timestamp).toLocaleString()}
                  </Text>
                  <View className="bg-red-500/20 px-2 py-1 rounded-md">
                    <Text className="text-red-400 text-[10px] font-bold uppercase">Negative Evidence</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
