import React from 'react';
import { View, Text, ScrollView, Dimensions, Modal, Pressable } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { TrendingUp, Crown, AlertTriangle, ChevronDown, CheckCircle2, AlertCircle, X, ClipboardCheck, ArrowRight } from 'lucide-react-native';
import { useScoreCalc } from '../../hooks/useScoreCalc';
import { useCriticalIssues } from '../../hooks/useCriticalIssues';
import { useAuditStore } from '../../store/auditStore';
import { locationData } from '../../data/locationData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


export default function HomeDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { fleetStats, getRankedStores, getChartData, fleetCategoryStats, getStoreStats } = useScoreCalc();
  const { customStores, setHeaderField, startNewAudit } = useAuditStore();
  const { allStores, topPerformers, actionRequired } = getRankedStores();
  const chartData = getChartData();

  const screenWidth = Dimensions.get('window').width;
  
  const [selectedStoreCode, setSelectedStoreCode] = React.useState('ALL');
  const [pickerVisible, setPickerVisible] = React.useState(false);
  
  const { criticalIssues } = useCriticalIssues(selectedStoreCode);
  const bengaluruStores = [
    ...(customStores || []),
    ...locationData["Karnataka"]["Bengaluru"].filter(s => s.code !== 'CUSTOM')
  ];
  
  const selectedStoreStats = React.useMemo(() => {
    if (selectedStoreCode === 'ALL') return null;
    return getStoreStats(selectedStoreCode);
  }, [selectedStoreCode, getStoreStats]);

  const activeCategoryStats = selectedStoreCode === 'ALL' ? fleetCategoryStats : (selectedStoreStats?.categoryStats || []);
  const activeScore = selectedStoreCode === 'ALL' ? fleetStats.avgScore : (selectedStoreStats?.avgScore || 0);

  const selectedStoreName = selectedStoreCode === 'ALL' 
    ? 'All Bengaluru Stores' 
    : bengaluruStores.find(s => s.code === selectedStoreCode)?.name.split(',')[0] || 'Selected Store';

  const handleLaunchAudit = (store?: any) => {
    setPickerVisible(false);
    startNewAudit();
    if (store) {
      setHeaderField('store', store.name);
      setHeaderField('storeCode', store.code);
      setHeaderField('storeBrand', store.brand);
      setHeaderField('isCustomStore', !!customStores.find(s => s.code === store.code));
    }
    router.push('/(audit)/new-audit');
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50" 
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header & Stats */}
      <View className="px-6 pt-6 pb-12 bg-slate-900 rounded-b-[48px] shadow-xl">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-[4px] mb-2">Regional Intelligence</Text>
            <Text className="text-white text-4xl font-semibold tracking-tighter">Strategic Hub</Text>
          </View>
          <Pressable 
            onPress={() => handleLaunchAudit()}
            className="bg-[#C9A84C] p-4 rounded-2xl shadow-lg active:scale-95"
          >
            <ClipboardCheck size={24} color="#0A0F1E" strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Global Filter Pill (Relocated to Header) */}
        <Pressable 
          onPress={() => setPickerVisible(true)}
          className="flex-row items-center justify-between bg-white/10 px-8 py-5 rounded-[28px] border border-white/5 mb-10 active:scale-[0.99]"
        >
          <View className="flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-gold mr-4 shadow-sm" />
            <Text className="text-white font-bold text-[10px] uppercase tracking-widest">{selectedStoreName}</Text>
          </View>
          <ChevronDown size={14} color="#C9A84C" />
        </Pressable>

        <View className="flex-row gap-x-5">
          <View className="flex-1 bg-white/5 rounded-[40px] p-8 border border-white/5 shadow-inner">
            <Text className="text-white/40 text-[10px] font-medium uppercase tracking-[3px] mb-1">
              {selectedStoreCode === 'ALL' ? 'Fleet Average' : 'Store Rating'}
            </Text>
            <Text className="text-white text-5xl font-semibold tracking-tighter">
              {selectedStoreCode === 'ALL' ? `${activeScore}%` : (selectedStoreStats?.avgScore !== null ? `${activeScore}%` : 'N/A')}
            </Text>
          </View>
        </View>

        {/* Dynamic Category Heatmap */}
        {fleetStats.totalAudits > 0 && (
          <View className="mt-10 bg-white/5 rounded-[40px] p-8 border border-white/5">
            <View className="flex-row items-center mb-8">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3 shadow-sm" />
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-[3px]">
                {selectedStoreCode === 'ALL' ? 'Global Category Performance' : `${selectedStoreName} Metrics`}
              </Text>
            </View>
            
            <View className="gap-y-6">
              {( (activeCategoryStats as any) || []).map((cat: any) => {
                const getBarColor = (p: number) => {
                  if (p >= 85) return 'bg-emerald-500';
                  if (p >= 70) return 'bg-amber-500';
                  return 'bg-red-500';
                };
                
                return (
                  <View key={cat.category}>
                    <View className="flex-row justify-between items-center mb-2.5">
                      <Text className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{cat.label}</Text>
                      <Text className="text-white font-bold text-[10px]">{cat.percentage}%</Text>
                    </View>
                    <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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
        )}
      </View>

      {/* Bar Chart Section */}
      <View className="mx-6 -mt-8 bg-white p-8 rounded-[48px] shadow-sm mb-12">
        <View className="flex-row items-center justify-between mb-10 px-2">
          <View>
             <Text className="text-slate-800 font-semibold text-xl tracking-tight">Active Metrics</Text>
             <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-[2px] mt-1.5">Market Segment Performance</Text>
          </View>
          <TrendingUp size={20} color="#CBD5E1" />
        </View>
        
        {fleetStats.totalAudits > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
            <BarChart
              data={chartData}
              width={Math.max(screenWidth - 100, chartData.labels.length * 70)}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                propsForLabels: {
                  fontSize: 9,
                  fontWeight: '500'
                },
                propsForBackgroundLines: {
                  strokeWidth: 0
                },
              }}
              withInnerLines={false}
              verticalLabelRotation={0}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </ScrollView>
        ) : (
          <View className="height-[220px] items-center justify-center bg-gray-50 rounded-[20px]">
            <Text className="text-gray-400 font-bold italic">Pending Data for Visualization</Text>
          </View>
        )}
      </View>

      {/* Critical Problems Action Center */}
      <View className="px-6 mb-16">
        <View className="flex-row items-center justify-between mb-8 px-2">
          <View>
            <Text className="text-slate-800 font-semibold text-xl tracking-tight">Critical Problems</Text>
            <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-[2px] mt-1.5">Directives for Intervention</Text>
          </View>
          <AlertTriangle size={20} color="#FDA4AF" />
        </View>

        <View className="gap-y-4">
          {criticalIssues.length > 0 ? (
            criticalIssues.map((agg) => (
              <View 
                key={agg.id} 
                className="bg-white rounded-[24px] p-6 shadow-sm border-l-4 border-red-500/80 flex-row items-start"
              >
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-slate-400 font-semibold text-[9px] uppercase tracking-widest">
                      {agg.storeName.split(',')[0]}
                    </Text>
                    <View className="bg-slate-50 px-3 py-1.5 rounded-full">
                      <Text className="text-slate-500 font-black text-[8px] uppercase tracking-widest">
                        {agg.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-800 font-semibold text-base tracking-tight mb-2">
                    {agg.count} Critical {agg.count === 1 ? 'Problem' : 'Problems'} Detected
                  </Text>
                  <View className="flex-row items-center opacity-60">
                    <AlertCircle size={10} color="#F43F5E" />
                    <Text className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       Immediate intervention required in {agg.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
              <View className="items-center py-12">
                <View className="bg-emerald-50 p-6 rounded-full mb-6">
                   <CheckCircle2 size={40} color="#10B981" />
                </View>
                <Text className="text-slate-900 font-black text-xl text-center mb-2">All Parameters Clear</Text>
                <Text className="text-slate-400 text-xs text-center leading-relaxed px-10">
                  The latest audits across the fleet are meeting critical compliance thresholds.
                </Text>
              </View>
            )}
        </View>
      </View>

      {/* Watchlist Section */}
      <View className="px-6 mb-24">
        <Text className="text-slate-800 font-semibold text-xl tracking-tight mb-8 px-2">Market Watchlist</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
          <View className="flex-row gap-x-5 pr-10">
            <View className="w-64 bg-white rounded-[32px] p-8 shadow-sm">
              <View className="flex-row items-center mb-10">
                <View className="bg-emerald-50 p-2 rounded-xl">
                   <Crown size={16} color="#059669" />
                </View>
                <Text className="ml-3 text-slate-400 font-semibold text-[9px] uppercase tracking-[2px]">Leaders</Text>
              </View>
              {topPerformers.length > 0 ? topPerformers.map(s => (
                <View key={s.code} className="mb-6">
                  <Text className="text-slate-800 font-semibold text-lg tracking-tight leading-none mb-1">{s.name.split(',')[0]}</Text>
                  <Text className="text-emerald-500 font-bold text-lg">{s.avgScore}%</Text>
                </View>
              )) : <Text className="text-slate-300 text-[10px] italic">Collecting Metrics</Text>}
            </View>

            <View className="w-64 bg-white rounded-[32px] p-8 shadow-sm">
              <View className="flex-row items-center mb-10">
                <View className="bg-rose-50 p-2 rounded-xl">
                   <AlertTriangle size={16} color="#E11D48" />
                </View>
                <Text className="ml-3 text-slate-400 font-semibold text-[9px] uppercase tracking-[2px]">Priority Alerts</Text>
              </View>
              {actionRequired.length > 0 ? actionRequired.map(s => (
                <View key={s.code} className="mb-6">
                  <Text className="text-slate-800 font-semibold text-lg tracking-tight leading-none mb-1">{s.name.split(',')[0]}</Text>
                  <Text className="text-rose-500 font-bold text-lg">{s.avgScore}%</Text>
                </View>
              )) : <Text className="text-slate-300 text-[10px] italic">Collecting Metrics</Text>}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Store Picker Modal */}
      <Modal visible={pickerVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-[40px] max-h-[80%] overflow-hidden">
            <View className="flex-row justify-between items-center px-8 py-6 border-b border-slate-50">
              <Text className="text-slate-900 font-black text-xl tracking-tight">Scope Selection</Text>
              <Pressable onPress={() => setPickerVisible(false)} className="bg-slate-50 p-2.5 rounded-xl">
                <X size={18} color="#475569" />
              </Pressable>
            </View>
            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              <Pressable 
                onPress={() => { setSelectedStoreCode('ALL'); setPickerVisible(false); }}
                className={`p-6 rounded-3xl mb-4 ${selectedStoreCode === 'ALL' ? 'bg-slate-900 shadow-lg' : 'bg-slate-50'}`}
              >
                <Text className={`font-black text-xs uppercase tracking-widest ${selectedStoreCode === 'ALL' ? 'text-white' : 'text-slate-500'}`}>
                   All Bengaluru Stores
                </Text>
              </Pressable>
              
              <View className="mt-2 mb-4 px-2">
                <Text className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Active Store Registry</Text>
              </View>

              {bengaluruStores.map(store => (
                <View key={store.code} className={`p-4 rounded-3xl mb-3 flex-row items-center justify-between ${selectedStoreCode === store.code ? 'bg-slate-100 border border-slate-200' : 'bg-slate-50'}`}>
                  <Pressable 
                    onPress={() => { setSelectedStoreCode(store.code); setPickerVisible(false); }}
                    className="flex-1"
                  >
                    <Text className="font-black text-xs uppercase tracking-widest text-slate-900">
                      {store.name.split(',')[0]}
                    </Text>
                    <Text className="text-[8px] font-bold uppercase tracking-[2px] mt-1 text-slate-400">
                      {store.code}
                    </Text>
                  </Pressable>
                  
                  <Pressable 
                    onPress={() => handleLaunchAudit(store)}
                    className="bg-gold p-3 rounded-2xl shadow-sm active:scale-95"
                  >
                    <ArrowRight size={16} color="#0A0F1E" strokeWidth={3} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
