import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Search, FileText, ChevronRight, Calendar, Trash2, Pencil, Cloud, Smartphone, ExternalLink, RefreshCw, DownloadCloud } from 'lucide-react-native';
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
  const [isSyncingAll, setIsSyncingAll] = useState(false);

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

  const loadCloudHistory = async (silent = false) => {
    if (!auth.auditorId) return;
    
    if (!silent) setIsLoadingCloud(true);
    try {
      const data = await googleSheetsService.fetchHistory(auth.auditorId);
      setCloudAudits(data);
      if (!silent) {
        Alert.alert("🛰️ Ghost Hub", `${data.length} records retrieved from your Cloud Vault.`);
      }
    } catch (e) {
      if (!silent) Alert.alert("Sync Error", "Failed to reach the Master Hub.");
    } finally {
      if (!silent) setIsLoadingCloud(false);
    }
  };

  const syncAllFromCloud = async () => {
    if (!auth.auditorId) return;
    
    Alert.alert(
      "Deep Cloud Sync",
      "This will scan the Global Index and refresh your history from the Cloud Vault. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Restore",
          onPress: async () => {
            setIsSyncingAll(true);
            try {
              await loadCloudHistory(true);
              setViewMode('cloud');
            } finally {
              setIsSyncingAll(false);
            }
          }
        }
      ]
    );
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
                  <View className="ml-2 bg-emerald-50 px-3 py-1 rounded-full flex-row items-center border border-emerald-100">
                    <Cloud size={10} color="#10B981" />
                    <Text className="text-[8px] font-black text-emerald-600 ml-1.5 uppercase tracking-widest">Vaulted</Text>
                  </View>
                ) : (
                  <View className="ml-2 bg-slate-50 px-3 py-1 rounded-full flex-row items-center border border-slate-100">
                    <Smartphone size={10} color="#94A3B8" />
                    <Text className="text-[8px] font-black text-slate-400 ml-1.5 uppercase tracking-widest">Local</Text>
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

           {item.isSynced && (item as any).cloudFileUrl && (
              <Pressable 
                onPress={() => WebBrowser.openBrowserAsync((item as any).cloudFileUrl)}
                className="flex-row items-center bg-slate-900 px-5 py-2.5 rounded-2xl shadow-sm active:scale-95"
              >
                <FileText size={14} color="#C9A84C" />
                <Text className="ml-2 text-[10px] font-black uppercase tracking-widest text-gold">View Report</Text>
              </Pressable>
           )}

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

  const handleCloudAction = (item: any) => {
    Alert.alert(
      "Cloud Command",
      `Store: ${item.store}\n\nSelect an operation for this cloud record.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open in App (Edit)", 
          onPress: async () => {
            setIsLoadingCloud(true);
            try {
              const url = `${googleSheetsService.CLOUD_SYNC_URL}?action=getAuditDetail&auditId=${item.id}`;
              console.log("Retrieving full data from:", url);
              const response = await fetch(url);
              const fullAudit = await response.json();
              
              if (fullAudit && fullAudit.id) {
                const { loadAudit } = useAuditStore.getState();
                loadAudit(fullAudit);
                router.push("/(audit)/cleanliness");
              } else {
                throw new Error(fullAudit.error || "Audit not found in cloud vault.");
              }
            } catch (e) {
              Alert.alert(
                "Retrieve Failed", 
                "This audit was likely saved with an older version of the script. Only new audits saved from today onwards can be 'Opened in App'."
              );
            } finally {
              setIsLoadingCloud(false);
            }
          } 
        },
        { 
          text: "Open Cloud Vault (Folder)", 
          onPress: () => {
            if (item.vaultLink && item.vaultLink !== 'N/A') {
              console.log("Opening Vault Folder:", item.vaultLink);
              WebBrowser.openBrowserAsync(item.vaultLink);
            } else {
              Alert.alert("Vault Unavailable", "Could not locate the Google Drive folder for this store.");
            }
          }
        },
        { 
          text: "View PDF Report", 
          onPress: () => {
            const reportUrl = item.link || item.pdfLink;
            if (reportUrl && reportUrl !== 'N/A' && reportUrl.startsWith('http')) {
              console.log("Opening Report:", reportUrl);
              WebBrowser.openBrowserAsync(reportUrl);
            } else {
              Alert.alert("Report Unavailable", "The direct PDF link is missing or corrupted. Try opening the Cloud Vault folder instead.");
            }
          }
        }
      ]
    );
  };

  const renderCloudItem = ({ item }: { item: any }) => (
    <Pressable 
      onPress={() => handleCloudAction(item)}
      className="bg-white rounded-[40px] p-8 mb-6 shadow-sm border border-slate-100 flex-row items-center active:opacity-80 active:scale-[0.98]"
    >
      <View className="w-14 h-14 bg-slate-900 rounded-2xl items-center justify-center mr-5 shadow-lg">
        <Cloud size={24} color="#C9A84C" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-black text-lg tracking-tight" numberOfLines={1}>{item.store}</Text>
        <View className="flex-row items-center mt-1">
          <Calendar size={10} color="#94A3B8" />
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1.5">
            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • SYNCED HUB
          </Text>
        </View>
      </View>
      <View className="items-end">
        <View className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 mb-2">
          <Text className={`text-xl font-black ${getScoreColor(item.score)}`}>{item.score}</Text>
        </View>
        <ChevronRight size={14} color="#CBD5E1" />
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Section */}
      <View className="bg-slate-900 rounded-b-[48px] shadow-xl overflow-hidden pb-8">
        <View className="px-6 pt-6">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Text className="text-white text-2xl font-black">Audit History</Text>
              <Pressable 
                onPress={syncAllFromCloud}
                disabled={isSyncingAll}
                className="ml-4 bg-white/10 p-2 rounded-xl active:scale-95"
              >
                {isSyncingAll ? (
                  <ActivityIndicator size="small" color="#C9A84C" />
                ) : (
                  <DownloadCloud size={18} color="#C9A84C" />
                )}
              </Pressable>
            </View>
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
