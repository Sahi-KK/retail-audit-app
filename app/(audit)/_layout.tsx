import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useScoreCalc } from '../../hooks/useScoreCalc';
import { AuditCategory } from '../../data/auditQuestions';
import { useAuditStore } from '../../store/auditStore';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { categoryScores } = useScoreCalc();

  return (
    <View className="bg-white border-b border-slate-100">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="px-4"
        contentContainerStyle={{ paddingVertical: 12 }}
      >
        <View className="flex-row gap-x-3">
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.title !== undefined ? options.title : route.name;
            const isFocused = state.index === index;
            
            let category: AuditCategory = 'cleanliness';
            if (route.name === 'merchandising') category = 'merchandising';
            if (route.name === 'operations') category = 'operations';
            if (route.name === 'staff') category = 'staff';
            if (route.name === 'clinical') category = 'clinical';

            const catScore = categoryScores[category];
            const isDone = catScore.earned > 0;

            return (
              <Pressable
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                className={`px-6 py-3.5 rounded-2xl flex-row items-center border ${
                  isFocused 
                    ? 'bg-slate-900 border-slate-900 shadow-md' 
                    : 'bg-white border-slate-100'
                }`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${
                  isFocused ? 'text-white' : 'text-slate-400'
                }`}>
                  {label}
                </Text>
                {isDone && (
                   <View className={`ml-2 w-1.5 h-1.5 rounded-full ${isFocused ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default function AuditLayout() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { completedAudits, loadAudit, setReadOnly } = (useAuditStore() as any); // Type cast for convenience

  React.useEffect(() => {
    if (params.auditId) {
      const historicalAudit = completedAudits.find((a: any) => a.id === params.auditId);
      if (historicalAudit) {
        loadAudit(historicalAudit);
        // If isEditMode is true, we want to allow editing, so setReadOnly(false)
        const isEditing = params.isEditMode === 'true';
        setReadOnly(!isEditing);
      }
    } else {
      setReadOnly(false);
    }
  }, [params.auditId, params.isEditMode]);

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <Header />
      
      <View className="flex-1">
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen name="cleanliness" options={{ title: 'Cleanup' }} />
          <Tabs.Screen name="merchandising" options={{ title: 'Merch' }} />
          <Tabs.Screen name="operations" options={{ title: 'Ops' }} />
          <Tabs.Screen name="staff" options={{ title: 'Staff' }} />
          <Tabs.Screen name="clinical" options={{ title: 'Clinic' }} />
        </Tabs>
      </View>
      
      <Footer />
    </View>
  );
}
