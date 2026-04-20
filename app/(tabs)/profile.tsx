import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useAuditStore } from '../../store/auditStore';
import { User, ShieldCheck, Save, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const { auth, updateAuth } = useAuditStore();
  const [name, setName] = useState(auth.auditorName);
  const [id, setId] = useState(auth.auditorId);
  const [isEditing, setIsEditing] = useState(!auth.auditorId);

  const handleSave = () => {
    if (!name.trim() || !id.trim()) {
      Alert.alert("Missing Info", "Please provide both your Name and Auditor ID.");
      return;
    }
    updateAuth(name.trim(), id.trim());
    setIsEditing(false);
    Alert.alert("Profile Updated", "Your auditor identity has been securely saved.");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0A0F1E' }}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-8 mt-4">
          <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center border-2 border-[#C9A84C]/30 mb-4">
            <User size={48} color="#C9A84C" />
          </View>
          <Text className="text-white text-2xl font-black">Auditor Profile</Text>
          <Text className="text-slate-400 text-sm mt-1">Identity & Authentication</Text>
        </View>

        <View className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-2xl">
          <View className="mb-6">
            <Text className="text-[#C9A84C] text-xs font-black uppercase mb-2 ml-1">Full Name</Text>
            {isEditing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#64748B"
                className="bg-white/10 p-4 rounded-xl text-white font-bold border border-white/5"
              />
            ) : (
              <View className="bg-white/10 p-4 rounded-xl border border-white/5 flex-row items-center">
                <Text className="text-white font-bold text-lg">{auth.auditorName}</Text>
              </View>
            )}
          </View>

          <View className="mb-8">
            <View className="flex-row items-center mb-2 ml-1">
              <ShieldCheck size={14} color="#C9A84C" />
              <Text className="text-[#C9A84C] text-xs font-black uppercase ml-1">Login / Auditor ID</Text>
            </View>
            {isEditing ? (
              <TextInput
                value={id}
                onChangeText={setId}
                placeholder="e.g. LUX-8836"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                className="bg-white/10 p-4 rounded-xl text-white font-bold border border-white/5"
              />
            ) : (
              <View className="bg-white/10 p-4 rounded-xl border border-white/5 flex-row items-center">
                <Text className="text-white font-bold text-lg">{auth.auditorId}</Text>
              </View>
            )}
          </View>

          {isEditing ? (
            <Pressable 
              onPress={handleSave}
              className="bg-[#C9A84C] p-5 rounded-2xl flex-row items-center justify-center shadow-lg active:opacity-90"
            >
              <Save size={20} color="#0A0F1E" strokeWidth={3} />
              <Text className="text-[#0A0F1E] font-black text-lg ml-2">SAVE IDENTITY</Text>
            </Pressable>
          ) : (
            <Pressable 
              onPress={() => setIsEditing(true)}
              className="bg-white/10 p-5 rounded-2xl flex-row items-center justify-center border border-white/10"
            >
              <LogOut size={20} color="#EF4444" />
              <Text className="text-white font-black text-lg ml-2">CHANGE LOGIN</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-8">
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
            className="bg-white/5 p-5 rounded-2xl flex-row items-center justify-between border border-white/5"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#C9A84C]/10 rounded-xl items-center justify-center mr-4">
                <ShieldCheck size={20} color="#C9A84C" />
              </View>
              <View>
                <Text className="text-white font-bold">Cloud Hub Status</Text>
                <Text className="text-slate-500 text-xs">Verify version sync</Text>
              </View>
            </View>
            <Text className="text-[#C9A84C] font-black text-xs">CHECK NOW</Text>
          </Pressable>
        </View>

        <View className="mt-8 p-6 bg-[#C9A84C]/10 rounded-2xl border border-[#C9A84C]/20">
          <Text className="text-[#C9A84C] font-bold text-sm mb-2">Multi-User Info</Text>
          <Text className="text-slate-400 text-xs leading-5">
            Your Login ID is used to filter reports in the Cloud Browser and ensure your audits are correctly attributed in the Master Database.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
