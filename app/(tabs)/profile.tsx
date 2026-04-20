import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { useAuditStore } from '../../store/auditStore';
import { User, ShieldCheck, Save, LogOut, CheckCircle2 } from 'lucide-react-native';
import { useGoogleAuth } from '../../services/authService';

export default function ProfileScreen() {
  const { auth, updateAuth } = useAuditStore();
  const { signIn, isLoading: isAuthLoading } = useGoogleAuth();
  
  const [name, setName] = useState(auth.auditorName);
  const [id, setId] = useState(auth.auditorId);
  const [isEditing, setIsEditing] = useState(!auth.auditorId && !auth.isGoogleAuth);

  // Keep local state in sync with store
  useEffect(() => {
    setName(auth.auditorName);
    setId(auth.auditorId);
    if (auth.isGoogleAuth) {
      setIsEditing(false);
    }
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
      "Are you sure you want to clear your identity? This will remove your verified Auditor ID.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: "destructive", 
          onPress: () => {
            updateAuth('', '', false, null);
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
        <View className="items-center mb-8 mt-4">
          <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center border-2 border-[#C9A84C]/30 mb-4">
            {auth.isGoogleAuth ? (
              <CheckCircle2 size={48} color="#10B981" />
            ) : (
              <User size={48} color="#C9A84C" />
            )}
          </View>
          <Text className="text-white text-2xl font-black">
            {auth.isGoogleAuth ? 'Verified Auditor' : 'Auditor Profile'}
          </Text>
          <Text className="text-slate-400 text-sm mt-1">{auth.googleEmail || 'Identity & Authentication'}</Text>
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
                {auth.isGoogleAuth && <View className="ml-2 bg-emerald-500/20 px-2 py-0.5 rounded-full"><Text className="text-emerald-500 text-[8px] font-black">VERIFIED</Text></View>}
              </View>
            )}
          </View>

          <View className="mb-8">
            <View className="flex-row items-center mb-2 ml-1">
              <ShieldCheck size={14} color="#C9A84C" />
              <Text className="text-[#C9A84C] text-xs font-black uppercase ml-1">Verified Auditor ID</Text>
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
                {auth.isGoogleAuth && <View className="ml-2 bg-emerald-500/20 px-2 py-0.5 rounded-full"><Text className="text-emerald-500 text-[8px] font-black">LOCKED</Text></View>}
              </View>
            )}
          </View>

          {isEditing ? (
            <View className="gap-y-4">
              <Pressable 
                onPress={handleSave}
                className="bg-[#C9A84C] p-5 rounded-2xl flex-row items-center justify-center shadow-lg active:opacity-90"
              >
                <Save size={20} color="#0A0F1E" strokeWidth={3} />
                <Text className="text-[#0A0F1E] font-black text-lg ml-2">SAVE IDENTITY</Text>
              </Pressable>

              <View className="flex-row items-center my-2">
                <View className="flex-1 h-[1px] bg-white/10" />
                <Text className="mx-4 text-slate-500 text-[10px] font-black uppercase">OR</Text>
                <View className="flex-1 h-[1px] bg-white/10" />
              </View>

              <Pressable 
                onPress={() => signIn()}
                disabled={isAuthLoading}
                className="bg-white p-5 rounded-2xl flex-row items-center justify-center shadow-lg active:opacity-90"
              >
                {isAuthLoading ? (
                  <ActivityIndicator color="#0A0F1E" size="small" />
                ) : (
                  <>
                    <View className="bg-red-500 w-5 h-5 rounded-sm items-center justify-center mr-2">
                      <Text className="text-white font-black text-xs">G</Text>
                    </View>
                    <Text className="text-[#0A0F1E] font-black text-lg">SIGN IN WITH GOOGLE</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable 
              onPress={handleSignOut}
              className="bg-white/5 p-5 rounded-2xl flex-row items-center justify-center border border-white/10"
            >
              <LogOut size={20} color="#EF4444" />
              <Text className="text-white font-black text-lg ml-2">
                {auth.isGoogleAuth ? 'SIGN OUT' : 'CHANGE LOGIN'}
              </Text>
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
                <Text className="text-slate-500 text-xs text-wrap max-w-40">Verify version sync</Text>
              </View>
            </View>
            <Text className="text-[#C9A84C] font-black text-xs">CHECK NOW</Text>
          </Pressable>
        </View>

        <View className="mt-8 p-6 bg-[#C9A84C]/10 rounded-2xl border border-[#C9A84C]/20">
          <Text className="text-[#C9A84C] font-bold text-sm mb-2">Identity Policy</Text>
          <Text className="text-slate-400 text-xs leading-5">
            {auth.isGoogleAuth 
              ? "Your identity is verified via Google. Your Auditor ID is locked and cannot be edited to ensure audit integrity."
              : "Manual IDs are allowed but may be subject to verification. Signing in with Google provides the highest level of trust."}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
