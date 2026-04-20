import React from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuditStore, HeaderInfo } from '../store/auditStore';
import { useScoreCalc } from '../hooks/useScoreCalc';
import { ScoreBadge } from './ScoreBadge';
import { CustomPicker } from './CustomPicker';
import { locationData } from '../data/locationData';

export function Header() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { headerInfo, setHeaderField, isReadOnly, customStores } = (useAuditStore() as any);
  const { percentage } = useScoreCalc();
  const params = useLocalSearchParams();
  
  const isPreLocked = !!params.prefillStoreCode;

  React.useEffect(() => {
    if (params.prefillStoreCode && !headerInfo.store) {
      const storeCode = decodeURIComponent(params.prefillStoreCode as string);
      // Search in hardcoded defaults
      let store = locationData["Karnataka"]["Bengaluru"].find((s: any) => s.code === storeCode);
      // Search in custom stores if not found
      if (!store) {
        store = (customStores || []).find((s: any) => s.code === storeCode);
      }

      if (store) {
        setHeaderField('state', 'Karnataka');
        setHeaderField('city', 'Bengaluru');
        setHeaderField('store', store.name);
        setHeaderField('storeCode', store.code);
        setHeaderField('storeBrand', store.brand);
        setHeaderField('isCustomStore', false);
      }
    }
  }, [params.prefillStoreCode, customStores]);
  
  const formattedDate = new Date(headerInfo.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  });

  const states = Object.keys(locationData).map(s => ({ label: s, value: s }));
  const cities = headerInfo.state ? Object.keys(locationData[headerInfo.state] || {}).map(c => ({ label: c, value: c })) : [];
  
  const stores = React.useMemo(() => {
    if (!headerInfo.state || !headerInfo.city) return [];
    
    const defaults = (locationData[headerInfo.state]?.[headerInfo.city] || []).map(st => ({ 
      label: `${st.name} (${st.brand})`, 
      value: st.code,
      sublabel: st.code,
      brand: st.brand,
      originalName: st.name
    }));

    const custom = (customStores || []).map((st: any) => ({
      label: `${st.name} (${st.brand})`,
      value: st.code,
      sublabel: st.code,
      brand: st.brand,
      originalName: st.name
    }));

    return [...custom, ...defaults];
  }, [headerInfo.state, headerInfo.city, customStores]);

  const handleStateSelect = (val: string) => {
    setHeaderField('state', val);
    setHeaderField('city', '');
    setHeaderField('store', '');
    setHeaderField('storeCode', '');
    setHeaderField('isCustomStore', false);
  };

  const handleCitySelect = (val: string) => {
    setHeaderField('city', val);
    setHeaderField('store', '');
    setHeaderField('storeCode', '');
    setHeaderField('isCustomStore', false);
  };

  const handleStoreSelect = (code: string) => {
    const selected = stores.find(st => st.value === code);
    if (selected) {
      setHeaderField('store', selected.originalName);
      setHeaderField('storeCode', selected.value);
      setHeaderField('storeBrand', selected.brand);
      setHeaderField('isCustomStore', false);
    }
  };

  return (
    <View className="bg-slate-900 px-6 pb-6 rounded-b-[40px] shadow-xl z-20" style={{ paddingTop: insets.top }}>
      {/* Mini Title bar */}
      <View className="flex-row justify-between items-center mt-2 mb-4">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.replace('/')}
            className="mr-4 bg-white/5 p-2 rounded-xl"
          >
            <ArrowLeft size={16} color="#94A3B8" />
          </Pressable>
          <View>
            <Text className="text-white text-lg font-bold tracking-tight">
              {headerInfo.store ? headerInfo.store.split(',')[0] : 'New Audit'}
            </Text>
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              {formattedDate} • {headerInfo.auditorName || 'Guest'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <ScoreBadge percentage={percentage} />
        </View>
      </View>

      <View className="bg-white/5 rounded-[24px] p-4 border border-white/5 overflow-hidden">
        {!isExpanded ? (
          <Pressable 
            onPress={() => setIsExpanded(true)}
            className="flex-row justify-between items-center"
          >
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-gold mr-3 shadow-sm" />
              <Text className="text-slate-300 text-xs font-semibold">Location Intelligence</Text>
            </View>
            <View className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Text className="text-gold text-[10px] font-black uppercase">Edit Details</Text>
            </View>
          </Pressable>
        ) : (
          <View className="gap-y-3">
            {/* Horizontal State/City Row */}
            <View className="flex-row gap-x-4">
              <View className="flex-1">
                <CustomPicker 
                  label="State" 
                  value={headerInfo.state} 
                  options={states} 
                  onSelect={handleStateSelect}
                  disabled={isReadOnly || isPreLocked}
                />
              </View>
              <View className="flex-1">
                <CustomPicker 
                  label="City" 
                  value={headerInfo.city} 
                  options={cities} 
                  onSelect={handleCitySelect}
                  disabled={isReadOnly || !headerInfo.state || isPreLocked}
                  placeholder="City"
                />
              </View>
            </View>

            <CustomPicker 
              label="Store" 
              value={headerInfo.storeCode} 
              options={stores} 
              onSelect={handleStoreSelect}
              disabled={isReadOnly || !headerInfo.city || isPreLocked}
              placeholder="Select Store"
            />

            <View className="flex-row items-center border-b border-white/10 pb-1 mt-1">
              <Text className="text-gray-500 text-[10px] font-bold uppercase w-16">Auditor</Text>
              <TextInput
                className="flex-1 text-white text-sm font-medium py-0 h-6"
                editable={!isReadOnly}
                placeholder="Name"
                placeholderTextColor="#6B7280"
                value={headerInfo.auditorName}
                onChangeText={(t) => setHeaderField('auditorName', t)}
              />
            </View>

            <Pressable 
              onPress={() => setIsExpanded(false)}
              className="bg-white/10 py-2 rounded-xl items-center mt-1 border border-white/5"
            >
              <Text className="text-slate-100 text-[10px] font-bold uppercase">Save & Collapse</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
