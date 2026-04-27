import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Search, FileText, ChevronRight, Calendar, Trash2, Pencil, Cloud, Smartphone, ExternalLink, RefreshCw } from 'lucide-react-native';
import { useAuditStore } from '../../store/auditStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../../components/Badge';
import { googleSheetsService } from '../../services/googleSheets';

export default function GlobalHistoryScreen() {

  const insets = useSafeAreaInsets();
  const { completedAudits, deleteAudit, auth } = useAuditStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'local' | 'cloud'>('local');
  const [cloudAudits, setCloudAudits] = useState<any[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  const filteredAudits = useMemo(() => {
    if (!completedAudits) return [];
    return completedAudits.filter(a => {
      if (!a) return false;
      const headerInfo = a.headerInfo || {};
      const matchesSearch = 
        (headerInfo.store || '').toLowerCase().includes((search || '').toLowerCase()) ||
        (headerInfo.auditorName || '').toLowerCase().includes((search || '').toLowerCase()) ||
        (headerInfo.storeCode || '').toLowerCase().includes((search || '').toLowerCase());
      
      return matchesSearch;
    }).sort((a, b) => {
      const timeA = new Date(a?.completedAt || Date.now()).getTime();
      const timeB = new Date(b?.completedAt || Date.now()).getTime();
      return timeB - timeA;
    });
  }, [completedAudits, search]);

  const loadCloudHistory = async () => {
    if (!auth.auditorId) {
      Alert.alert("🚨 Debug: No Auditor ID", "Your profile is missing an ID. Please set it in the Profile tab.");
      return;
    }
    
    setIsLoadingCloud(true);
    try {
      console.log("Fetching history for:", auth.auditorId);
      const data = await googleSheetsService.fetchHistory(auth.auditorId);
      
      // DIAGNOSTIC POP-UP: Reveal the handshake
      Alert.alert(
        "🛰️ Ghost Hub Diagnostic",
        `Searching for: [${auth.auditorId}]\n\nCloud Response: ${data.length} records found.\n\n${data.length === 0 ? "Potential ID mismatch in the Master Spreadsheet." : "Success! Signal clear."}`
      );
      
      setCloudAudits(data);
    } catch (e) {
      Alert.alert("🚨 Debug: Hub Error", e instanceof Error ? e.message : "Unknown connectivity issue");
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'cloud') {
      loadCloudHistory();
    }
  }, [viewMode, auth.auditorId]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this audit? This action cannot be reversed and will update all analytics.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Audit", 
          style: "destructive", 
          onPress: () => deleteAudit(id) 
        }
      ]
    );
  };

  const getScoreColor = (score: string | number) => {
    const val = typeof score === 'string' ? parseInt(score) : score;
    if (val >= 85) return 'text-emerald-500';
    if (val >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const handleSyncItem = async (item: any) => {
    setIsLoadingCloud(true);
    try {
      const syncPayload = {
        id: item.id,
        header: item.headerInfo,
        percentage: item.finalPercentage,
        earned: item.finalScore,
        total: item.totalMax,
        categoryBreakdown: {}, // History items might not have this cached easily, but we can try to reconstruct or just send main stats
        scores: item.scores,
        timestamp: item.completedAt
      };

      const syncResult = await googleSheetsService.syncAudit(syncPayload, null); // Manual sync usually skip PDF for speed if not already generated
      if (syncResult.status === 'success') {
        const { markAsSynced } = useAuditStore.getState();
        markAsSynced(item.id);
        Alert.alert("Success", "Audit synced to cloud successfully.");
      } else {
        Alert.alert("Sync Failed", syncResult.message || "Check connection");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to sync audit.");
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const renderLocalItem = ({ item }: { item: any }) => {
    const headerInfo = item.headerInfo || {};
    return (
      <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
        <Pressable
          onPress={() => router.push(`/(audit)/cleanliness?auditId=${item.id}`)}
          className="active:opacity-80"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-1">
                <Text className="text-slate-800 font-bold text-lg tracking-tight" numberOfLines={1}>
                  {headerInfo.store || 'Standard Store'}
                </Text>
                {item.isSynced ? (
                  <View className="ml-2 bg-emerald-50 px-2 py-0.5 rounded-full flex-row items-center">
                    <Cloud size={10} color="#10B981" />
                    <Text className="text-[8px] font-bold text-emerald-600 ml-1">SYNCED</Text>
                  </View>
                ) : (
                  <View className="ml-2 bg-slate-50 px-2 py-0.5 rounded-full flex-row items-center">
                    <Smartphone size={10} color="#94A3B8" />
                    <Text className="text-[8px] font-bold text-slate-400 ml-1">LOCAL</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mr-3">
                  {new Date(item.completedAt || Date.now()).toLocaleDateString()}
                </Text>
                <Badge brand={headerInfo.storeBrand} />
              </View>
            </View>
            <Text className={`text-2xl font-black ${getScoreColor(item.finalPercentage || 0)}`}>
              {item.finalPercentage || 0}%
            </Text>
          </View>
        </Pressable>
        
        <View className="flex-row items-center justify-between pt-4 border-t border-slate-50 mt-2">
           <View className="flex-row gap-x-5">
             <Pressable 
               onPress={() => router.push(`/(audit)/cleanliness?auditId=${item.id}&isEditMode=true`)}
               className="bg-slate-50 p-2.5 rounded-xl"
             >
               <Pencil size={18} color="#94A3B8" />
             </Pressable>
             <Pressable 
               onPress={() => handleDelete(item.id)}
               className="bg-slate-50 p-2.5 rounded-xl"
             >
               <Trash2 size={18} color="#FDA4AF" />
             </Pressable>
           </View>

           {!item.isSynced && (
              <Pressable 
                onPress={() => handleSyncItem(item)}
                className="flex-row items-center bg-gold px-5 py-2.5 rounded-2xl shadow-sm active:scale-95"
              >
                <Cloud size={14} color="#0A0F1E" />
                <Text className="ml-2 text-[10px] font-black uppercase tracking-widest text-navy">Sync to Cloud</Text>
              </Pressable>
           )}
        </View>
      </View>
    );
  };

  const renderCloudItem = ({ item }: { item: any }) => (
    <Pressable 
      onPress={() => WebBrowser.openBrowserAsync(item.link)}
      className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100 flex-row items-center active:opacity-80"
    >
      <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
        <Cloud size={24} color="#10B981" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>{item.store}</Text>
        <Text className="text-slate-400 text-xs mt-1">{new Date(item.date).toLocaleDateString()} • Synced Hub</Text>
      </View>
      <View className="items-end">
        <Text className={`text-lg font-black ${getScoreColor(item.score)}`}>{item.score}</Text>
        <ExternalLink size={14} color="#94A3B8" />
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Section */}
      <View className="bg-slate-900 rounded-b-[48px] shadow-xl overflow-hidden pb-8">
        <View className="px-6 pt-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-black">Audit History</Text>
            <View className="flex-row bg-white/10 p-1 rounded-2xl">
              <Pressable 
                onPress={() => setViewMode('local')}
                className={`flex-row items-center px-4 py-2 rounded-xl ${viewMode === 'local' ? 'bg-[#C9A84C]' : ''}`}
              >
                <Smartphone size={16} color={viewMode === 'local' ? '#0A0F1E' : 'white'} />
                <Text className={`ml-2 text-xs font-black uppercase ${viewMode === 'local' ? 'text-[#0A0F1E]' : 'text-white'}`}>Device</Text>
              </Pressable>
              <Pressable 
                onPress={() => setViewMode('cloud')}
                className={`flex-row items-center px-4 py-2 rounded-xl ${viewMode === 'cloud' ? 'bg-[#C9A84C]' : ''}`}
              >
                <Cloud size={16} color={viewMode === 'cloud' ? '#0A0F1E' : 'white'} />
                <Text className={`ml-2 text-xs font-black uppercase ${viewMode === 'cloud' ? 'text-[#0A0F1E]' : 'text-white'}`}>Cloud</Text>
              </Pressable>
            </View>
          </View>

          <View className="bg-white/10 rounded-2xl h-14 flex-row items-center px-5 border border-white/5">
            <Search size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-4 text-white font-bold"
              placeholder={viewMode === 'local' ? "Search drafts..." : "Search cloud reports..."}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#64748B"
            />
            {viewMode === 'cloud' && (
              <Pressable onPress={loadCloudHistory}>
                <RefreshCw size={18} color="#C9A84C" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {viewMode === 'cloud' && !auth.auditorId && (
        <View className="items-center justify-center p-12 mt-10">
          <Text className="text-slate-400 text-center font-bold">Please set your Auditor ID in the Profile tab to browse your cloud reports.</Text>
        </View>
      )}

      {isLoadingCloud ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C9A84C" />
          <Text className="text-slate-400 font-bold mt-4">Connecting to Master Hub...</Text>
        </View>
      ) : (
        <FlatList
          data={viewMode === 'local' ? filteredAudits : cloudAudits}
          keyExtractor={(item) => item.id || item.link + item.date}
          contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
          refreshControl={
            viewMode === 'cloud' ? <RefreshControl refreshing={isLoadingCloud} onRefresh={loadCloudHistory} /> : undefined
          }
          renderItem={viewMode === 'local' ? renderLocalItem : renderCloudItem}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-10">
              <View className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 items-center w-full">
                <View className="bg-slate-50 p-6 rounded-full mb-6">
                  {viewMode === 'local' ? <Calendar size={40} color="#94A3B8" /> : <Cloud size={40} color="#94A3B8" />}
                </View>
                <Text className="text-slate-900 font-black text-xl text-center mb-2">
                  {viewMode === 'local' ? "No drafts found" : "Cloud Hub is empty"}
                </Text>
                <Text className="text-slate-400 text-sm text-center leading-relaxed">
                  {viewMode === 'local' 
                    ? "Your historical audit logs will appear here once they are finalized."
                    : "Records will appear here once they are synced and attributed to your Auditor ID."}
                </Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}
