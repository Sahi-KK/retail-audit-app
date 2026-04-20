import React from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { Trash2, ShieldAlert, BadgeInfo, LogOut, ChevronRight, ArrowLeft, Store, Plus, MapPin, Pencil, RefreshCw, X } from 'lucide-react-native';
import { useAuditStore } from '../store/auditStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TextInput, Modal } from 'react-native';
import { locationData } from '../data/locationData';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetAudit } = useAuditStore();

  const handleClearData = () => {
    Alert.alert(
      "Danger Zone",
      "This will permanently delete ALL historical audits and reset the app. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Wipe Everything", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.clear();
            resetAudit();
            Alert.alert("Success", "Local database cleared. Please restart the app for a full reset.");
            router.replace('/');
          } 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-6 bg-slate-900 rounded-b-[40px] mb-8 shadow-xl flex-row items-center border-b border-white/5">
        <Pressable onPress={() => router.back()} className="mr-5 bg-white/10 p-2.5 rounded-2xl active:scale-95">
          <ArrowLeft size={20} color="#C9A84C" />
        </Pressable>
        <View>
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-1.5">Administrative</Text>
          <Text className="text-white text-3xl font-black tracking-tight leading-none">Security & System</Text>
        </View>
      </View>

      <ScrollView 
        className="px-6"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-8">
          <View className="flex-row items-center mb-8">
            <View className="bg-slate-50 p-2 rounded-xl">
               <BadgeInfo size={20} color="#64748B" />
            </View>
            <Text className="ml-4 text-slate-900 font-black text-xl tracking-tight">Intelligence Config</Text>
          </View>
          
          <View className="gap-y-5">
            <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
              <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider">Deployment Version</Text>
              <Text className="text-slate-900 font-black">1.2.0 (Premium)</Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider">Assigned Region</Text>
              <Text className="text-slate-900 font-black">KA / Bengaluru</Text>
            </View>
          </View>
        </View>
        
        <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-8">
          <View className="flex-row items-center mb-8">
            <View className="bg-gold/10 p-2 rounded-xl">
               <Store size={20} color="#C9A84C" />
            </View>
            <Text className="ml-4 text-slate-900 font-black text-xl tracking-tight">Enterprise Controls</Text>
          </View>
          
          <Pressable 
            onPress={() => router.push('/manage-stores')}
            className="bg-slate-50 p-6 rounded-[28px] flex-row items-center justify-between border border-slate-100 active:bg-slate-100"
          >
            <View className="flex-row items-center">
               <View className="bg-white p-3 rounded-2xl shadow-sm mr-4">
                  <MapPin size={18} color="#64748B" />
               </View>
               <View>
                 <Text className="text-slate-900 font-black text-sm tracking-tight">Store Directory</Text>
                 <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Manage Portfolio</Text>
               </View>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </Pressable>
        </View>

        <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <View className="flex-row items-center mb-6">
            <View className="bg-red-50 p-2 rounded-xl">
               <ShieldAlert size={20} color="#EF4444" />
            </View>
            <Text className="ml-4 text-red-600 font-black text-xl tracking-tight">System Reset</Text>
          </View>
          
          <Text className="text-slate-400 text-xs mb-8 italic leading-relaxed">
            Performing a master reset will purge all offline audit data. This action is irreversible once initialized.
          </Text>
 
          <Pressable 
            onPress={handleClearData}
            className="bg-red-50 py-5 rounded-[24px] flex-row items-center justify-center border border-red-100 active:bg-red-100"
          >
            <Trash2 size={20} color="#EF4444" />
            <Text className="text-red-600 font-black ml-3 uppercase tracking-[1px] text-xs">Purge Database</Text>
          </Pressable>
        </View>

        <View className="mt-12 mb-20 items-center opacity-20">
          <Text className="text-slate-900 font-black text-[10px] uppercase tracking-[3px]">Global Operations Standard</Text>
          <Text className="text-slate-900 font-bold text-[10px] mt-1">Audit Intelligence v3.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
