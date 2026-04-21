import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useAuditStore } from '../../store/auditStore';
import { User, ShieldCheck, Save, LogOut } from 'lucide-react-native';

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
      Alert.alert("Missing Info", "Please provide both your Name and Auditor ID.");
      return;
    }
    updateAuth(name.trim(), id.trim());
    setIsEditing(false);
    Alert.alert("Profile Updated", "Your auditor identity has been securely saved.");
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to clear your identity? This will remove your active Auditor ID.",
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
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-10 mt-6">
          <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center border-2 border-[#C9A84C]/30 mb-4">
            <User size={48} color="#C9A84C" />
          </View>
          <Text className="text-white text-2xl font-black">Auditor Profile</Text>
          <Text className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-black">Identity Management</Text>
        </View>

        <View className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <View className="mb-6">
            <Text className="text-[#C9A84C] text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Full Name</Text>
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
              <Text className="text-[#C9A84C] text-[10px] font-black uppercase tracking-widest ml-2">Login ID / Auditor ID</Text>
            </View>
            {isEditing ? (
              <TextInput
                value={id}
                onChangeText={setId}
                placeholder="e.g. LUX-8836"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                className="bg-white/10 h-14 rounded-2xl px-5 text-white font-bold border border-white/5"
              />
            ) : (
              <View className="bg-white/10 h-14 rounded-2xl px-5 border border-white/5 flex-row items-center justify-between">
                <Text className="text-white font-bold text-lg">{auth.auditorId}</Text>
                <View className="bg-[#C9A84C]/20 px-3 py-1 rounded-full"><Text className="text-[#C9A84C] text-[8px] font-black">VERIFIED</Text></View>
              </View>
            )}
          </View>

          {isEditing ? (
            <Pressable 
              onPress={handleSave}
              className="bg-[#C9A84C] h-16 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-95"
            >
              <Save size={20} color="#0A0F1E" strokeWidth={3} />
              <Text className="text-[#0A0F1E] font-black text-lg ml-3">SAVE IDENTITY</Text>
            </Pressable>
          ) : (
            <Pressable 
              onPress={handleSignOut}
              className="bg-white/5 h-16 rounded-2xl flex-row items-center justify-center border border-white/10 active:bg-white/10"
            >
              <LogOut size={20} color="#EF4444" />
              <Text className="text-white font-black text-lg ml-3">CHANGE LOGIN</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-10">
          <Pressable 
            onPress={async () => {
              try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                  Alert.alert("Update Found", "A new version is available. Restart the app to apply it.");
                } else {
                  Alert.alert("Up to Date", "Your app is currently synchronized with the Master Hub.");
                }
              } catch (e) {
                Alert.alert("Offline", "Unable to reach the Master Hub. Please check your connection.");
              }
            }}
            className="bg-white/5 p-6 rounded-[30px] flex-row items-center justify-between border border-white/5 active:bg-white/10"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-[#C9A84C]/10 rounded-2xl items-center justify-center mr-4">
                <ShieldCheck size={24} color="#C9A84C" />
              </View>
              <View>
                <Text className="text-white font-bold">Cloud Hub Status</Text>
                <Text className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Version v1.4.0</Text>
              </View>
            </View>
            <Text className="text-[#C9A84C] font-black text-[10px] tracking-widest">CHECK</Text>
          </Pressable>
        </View>

        <View className="mt-10 p-8 bg-[#C9A84C]/5 rounded-[40px] border border-[#C9A84C]/10">
          <Text className="text-[#C9A84C] font-black text-xs uppercase tracking-widest mb-3 text-center">Protocol Notice</Text>
          <Text className="text-slate-500 text-[11px] leading-5 text-center">
            Your identity is used to secure all audit data. Please ensure your Auditor ID is correct to avoid data loss.
          </Text>
          <Text className="text-slate-700 text-center text-[8px] font-black uppercase tracking-[2px] mt-6">
            © 2026 EssilorLuxottica Hub
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
