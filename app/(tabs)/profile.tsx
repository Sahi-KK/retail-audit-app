import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useAuditStore } from '../../store/auditStore';
import { User, ShieldCheck, Save, LogOut, ClipboardCheck } from 'lucide-react-native';

export default function ProfileScreen() {
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
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="items-center mb-10 mt-6">
          <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center border-2 border-[#C9A84C]/30 mb-6 shadow-2xl">
            <User size={48} color="#C9A84C" />
          </View>
          <Text className="text-white text-3xl font-black tracking-tight">{auth.auditorName || 'Auditor Profile'}</Text>
          <Text className="text-[#C9A84C] text-[10px] mt-2 uppercase tracking-[4px] font-black opacity-80">Identity Management</Text>
        </View>

        <View className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <View className="mb-6">
            <Text className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[3px] mb-2 ml-1">Assigned Name</Text>
            {isEditing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#64748B"
                className="bg-white/10 h-14 rounded-2xl px-5 text-white font-bold border border-white/5"
              />
            ) : (
              <View className="bg-white/10 h-14 rounded-2xl px-5 border border-white/5 flex-row items-center">
                <Text className="text-white font-bold text-lg">{auth.auditorName}</Text>
              </View>
            )}
          </View>

          <View className="mb-10">
            <View className="flex-row items-center mb-2 ml-1">
              <ShieldCheck size={14} color="#C9A84C" />
              <Text className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[3px] ml-2">Employee Identifier</Text>
            </View>
            {isEditing ? (
              <TextInput
                value={id}
                onChangeText={setId}
                placeholder="e.g. EMP-9921"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                className="bg-white/10 h-14 rounded-2xl px-5 text-white font-bold border border-white/5"
              />
            ) : (
              <View className="bg-white/10 h-14 rounded-2xl px-5 border border-white/5 flex-row items-center justify-between">
                <Text className="text-white font-bold text-lg">{auth.auditorId}</Text>
                <View className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                   <Text className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Active</Text>
                </View>
              </View>
            )}
          </View>

          {isEditing ? (
            <Pressable 
              onPress={handleSave}
              className="bg-[#C9A84C] h-16 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-95"
            >
              <Save size={20} color="#0A0F1E" strokeWidth={3} />
              <Text className="text-[#0A0F1E] font-black text-lg ml-3">UPDATE IDENTITY</Text>
            </Pressable>
          ) : (
            <Pressable 
              onPress={handleSignOut}
              className="bg-rose-500/10 h-16 rounded-2xl flex-row items-center justify-center border border-rose-500/20 active:bg-rose-500/20"
            >
              <LogOut size={20} color="#F43F5E" />
              <Text className="text-[#F43F5E] font-black text-lg ml-3">REVOKE ACCESS</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-10">
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
            className="bg-white/5 p-6 rounded-[30px] flex-row items-center justify-between border border-white/5 active:bg-white/10"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
                <ClipboardCheck size={24} color="#C9A84C" />
              </View>
              <View>
                <Text className="text-white font-bold">Cloud Presence</Text>
                <Text className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Enterprise Core v2.3.0</Text>
              </View>
            </View>
            <Text className="text-[#C9A84C] font-black text-[10px] tracking-widest">VERIFY</Text>
          </Pressable>
        </View>

        <View className="mt-10 p-8 bg-white/5 rounded-[40px] border border-white/10">
          <Text className="text-[#C9A84C] font-black text-[10px] uppercase tracking-[3px] mb-4 text-center">Operational Notice</Text>
          <Text className="text-slate-500 text-[11px] leading-5 text-center px-4">
            Identity verification is locally persistent. Ensure your Employee ID is correct to attribute all audit metrics to the central registry.
          </Text>
          <Text className="text-white/10 text-center text-[7px] font-black uppercase tracking-[3px] mt-8">
            © 2026 ESSILORLUXOTTICA STRATEGIC HUB
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
