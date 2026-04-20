import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronRight, Store, Plus, ClipboardList } from 'lucide-react-native';
import { useScoreCalc } from '../../../hooks/useScoreCalc';
import { useAuditStore } from '../../../store/auditStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../../../components/Badge';

export default function StoreDirectory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getRankedStores } = useScoreCalc();
  const { startNewAudit } = useAuditStore();
  const [search, setSearch] = useState('');
  const { allStores } = getRankedStores();

  const handleAuditNewLocation = () => {
    startNewAudit();
    router.push('/(audit)/cleanliness');
  };

  const filteredStores = useMemo(() => {
    return allStores.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [allStores, search]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-300';
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pt-6 pb-10 bg-slate-900 rounded-b-[40px] shadow-lg mb-6">
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-2">Corporate Directory</Text>
        <Text className="text-white text-3xl font-black tracking-tight">Store Locations</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Action Button */}
        <Pressable 
          onPress={handleAuditNewLocation}
          className="bg-navy rounded-2xl p-4 flex-row items-center justify-center shadow-md mb-6"
        >
          <View className="bg-white/20 p-2 rounded-full mr-3">
            <ClipboardList size={16} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text className="text-white font-bold text-[15px] tracking-wide">Audit Store</Text>
        </Pressable>

        {/* Search */}
        <View className="bg-white rounded-2xl h-14 flex-row items-center px-5 shadow-sm border border-slate-100 mb-8">
          <Search size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-4 text-slate-900 font-bold"
            placeholder="Search by store name or code..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {filteredStores.map(store => (
          <Pressable
            key={store.code}
            onPress={() => router.push(`/(tabs)/stores/${encodeURIComponent(store.code)}`)}
            className="bg-white rounded-[28px] p-6 mb-5 border border-slate-50 shadow-sm active:scale-[0.98]"
          >
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-1">
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mr-3">{store.code}</Text>
                  <Badge brand={store.brand} />
                </View>
                <Text className="text-slate-900 font-black text-xl leading-tight" numberOfLines={2}>{store.name.split(',')[0]}</Text>
              </View>
              <View className="items-end">
                <Text className={`text-3xl font-black tracking-tighter ${getScoreColor(store.avgScore)}`}>
                  {store.avgScore !== null ? `${store.avgScore}%` : 'N/A'}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-5 border-t border-slate-50">
              <View className="flex-row items-center">
                <View className="bg-slate-50 p-2 rounded-lg">
                  <Store size={12} color="#64748B" />
                </View>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider ml-3">
                  {store.lastAuditDate ? `Last Audit: ${new Date(store.lastAuditDate).toLocaleDateString()}` : 'Audit Required'}
                </Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </Pressable>
        ))}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
