import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useRouter } from 'expo-router';
import { useAuditStore } from '../../store/auditStore';
import { User, ShieldCheck, Save, LogOut, ClipboardCheck, Book, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { auth, updateAuth } = useAuditStore();
  
  const [name, setName] = useState(auth.auditorName);
  const [id, setId] = useState(auth.auditorId);
  const [isEditing, setIsEditing] = useState(!auth.auditorId);

  // Keep local state in sync with store
  useEffect(() => {
    setName(auth.auditorName);
    setId(auth.auditorId);
  }, [auth]);

  const handleSave = () => {
    if (!name.trim() || !id.trim()) {
      Alert.alert("Missing Info", "Please provide both your Name and Employee ID.");
      return;
    }
    updateAuth(name.trim(), id.trim());
    setIsEditing(false);
    Alert.alert("Profile Updated", "Your employee identity has been securely saved.");
  };

  const handleSignOut = () => {
    Alert.alert(
      "Revoke Access",
      "Are you sure you want to clear your identity? This will remove your active Employee ID from this session.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: "destructive", 
          onPress: () => {
            updateAuth('', '');
            setIsEditing(true);
          } 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0A0F1E' }}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View className="items-center mb-12 mt-8">
          <View className="w-28 h-28 rounded-full bg-white/5 items-center justify-center border-2 border-[#C9A84C]/40 mb-6 shadow-2xl relative">
            <View className="absolute inset-0 rounded-full border border-white/10 opacity-50" />
            <User size={56} color="#C9A84C" />
            <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#0A0F1E]" />
          </View>
          <Text className="text-white text-3xl font-black tracking-tighter">{auth.auditorName || 'Strategic Auditor'}</Text>
          <View className="bg-[#C9A84C]/10 px-4 py-1.5 rounded-full mt-3 border border-[#C9A84C]/20">
            <Text className="text-[#C9A84C] text-[9px] uppercase tracking-[4px] font-black">Identity Verified</Text>
          </View>
        </View>

        <View className="bg-black/20 p-10 rounded-[56px] border border-white/5 shadow-2xl">
          <View className="mb-8">
            <Text className="text-white/30 text-[10px] font-black uppercase tracking-[4px] mb-3 ml-1">Assigned Name</Text>
            {isEditing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#475569"
                className="bg-white/5 h-16 rounded-3xl px-6 text-white font-bold border border-white/5"
              />
            ) : (
              <View className="bg-white/5 h-16 rounded-3xl px-6 border border-white/5 flex-row items-center">
                <Text className="text-white font-black text-lg tracking-tight">{auth.auditorName}</Text>
              </View>
            )}
          </View>

          <View className="mb-12">
            <View className="flex-row items-center mb-3 ml-1">
              <ShieldCheck size={14} color="#C9A84C" />
              <Text className="text-white/30 text-[10px] font-black uppercase tracking-[4px] ml-2">Employee Identifier</Text>
            </View>
            {isEditing ? (
              <TextInput
                value={id}
                onChangeText={setId}
                placeholder="e.g. EMP-9921"
                placeholderTextColor="#475569"
                autoCapitalize="characters"
                className="bg-white/5 h-16 rounded-3xl px-6 text-white font-bold border border-white/5"
              />
            ) : (
              <View className="bg-white/5 h-16 rounded-3xl px-6 border border-white/5 flex-row items-center justify-between">
                <Text className="text-white font-black text-lg tracking-tight">{auth.auditorId}</Text>
                <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                   <Text className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Active Status</Text>
                </View>
              </View>
            )}
          </View>

          {isEditing ? (
            <Pressable 
              onPress={handleSave}
              className="bg-[#C9A84C] h-20 rounded-[32px] flex-row items-center justify-center shadow-xl active:scale-[0.98]"
            >
              <Save size={22} color="#0A0F1E" strokeWidth={3} />
              <Text className="text-[#0A0F1E] font-black text-xl ml-4 tracking-tight">SAVE IDENTITY</Text>
            </Pressable>
          ) : (
            <Pressable 
              onPress={handleSignOut}
              className="bg-rose-500/10 h-20 rounded-[32px] flex-row items-center justify-center border border-rose-500/10 active:bg-rose-500/20 active:scale-[0.98]"
            >
              <LogOut size={22} color="#F43F5E" />
              <Text className="text-[#F43F5E] font-black text-xl ml-4 tracking-tight">REVOKE ACCESS</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-12 gap-y-6">
          <Pressable 
            onPress={async () => {
              try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                  Alert.alert("Update Found", "A new version of the Enterprise Hub is available. Restarting...");
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } else {
                  Alert.alert("Hub Integrated", "Your environment is currently synchronized with the Master Hub.");
                }
              } catch (e) {
                Alert.alert("Local Mode", "Offline Diagnostic active. Local audits will queue for cloud sync.");
              }
            }}
            className="bg-white/5 p-8 rounded-[40px] flex-row items-center justify-between border border-white/5 active:bg-white/10"
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/5">
                <ClipboardCheck size={28} color="#C9A84C" />
              </View>
              <View>
                <Text className="text-white font-black text-lg tracking-tight">Cloud Presence</Text>
                <Text className="text-white/20 text-[9px] uppercase font-black tracking-[2px] mt-1">Enterprise Core v3.1.0</Text>
              </View>
            </View>
            <View className="bg-[#C9A84C]/10 px-4 py-2 rounded-xl">
               <Text className="text-[#C9A84C] font-black text-[10px] tracking-widest uppercase">Verify</Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => router.push('/terminology')}
            className="bg-white/5 p-8 rounded-[40px] flex-row items-center justify-between border border-white/5 active:bg-white/10"
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-[#C9A84C]/10 rounded-2xl items-center justify-center mr-5 border border-[#C9A84C]/10">
                <Book size={28} color="#C9A84C" />
              </View>
              <View>
                <Text className="text-white font-black text-lg tracking-tight">Strategic Glossary</Text>
                <Text className="text-white/20 text-[9px] uppercase font-black tracking-[2px] mt-1">Domain Terminology</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#C9A84C" opacity={0.5} />
          </Pressable>
        </View>

        <View className="mt-16 p-10 bg-black/20 rounded-[56px] border border-white/5">
          <Text className="text-[#C9A84C] font-black text-[10px] uppercase tracking-[4px] mb-6 text-center opacity-80">Security Protocol</Text>
          <Text className="text-white/30 text-[11px] leading-6 text-center px-4 font-medium italic">
            This terminal is cryptographically linked to your Employee ID. All audit metrics are attributed to the central registry for performance benchmarking.
          </Text>
          <View className="mt-10 items-center">
            <Text className="text-white/10 text-[8px] font-black uppercase tracking-[6px]">
              ESSILORLUXOTTICA SA
            </Text>
            <View className="h-0.5 w-12 bg-white/5 mt-4 rounded-full" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
