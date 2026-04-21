import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAuditStore } from '../store/auditStore';
import { User, ShieldCheck, ArrowRight, ClipboardCheck } from 'lucide-react-native';
import { useGoogleAuth } from '../services/authService';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, updateAuth } = useAuditStore();
  const { signIn, isLoading: isAuthLoading } = useGoogleAuth();
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  // If already logged in, just show the app
  if (auth.auditorId && auth.auditorName) {
    return <>{children}</>;
  }

  const handleSignIn = () => {
    if (!name.trim() || !id.trim()) {
      Alert.alert("Required Info", "Please provide your Name and unique Auditor ID to continue.");
      return;
    }
    updateAuth(name.trim(), id.trim());
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0A0F1E]"
    >
      <View className="flex-1 px-8 justify-center">
        {/* Logo Section */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-[#C9A84C]/20 rounded-3xl items-center justify-center border border-[#C9A84C]/30 mb-6">
            <ClipboardCheck size={40} color="#C9A84C" />
          </View>
          <Text className="text-white text-3xl font-black tracking-tight text-center">Retail Audit</Text>
          <Text className="text-[#C9A84C] text-xs font-black uppercase tracking-[4px] mt-2 text-center">Enterprise Hub</Text>
        </View>

        {/* Form Section */}
        <View className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6 text-center">Identity Access Protocol</Text>
          
          <View className="mb-6">
            <View className="flex-row items-center mb-2 ml-1">
              <User size={14} color="#C9A84C" />
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider ml-2">Full Name</Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
              placeholderTextColor="#64748B"
              className="bg-white/10 h-14 rounded-2xl px-5 text-white font-bold border border-white/5"
            />
          </View>

          <View className="mb-8">
            <View className="flex-row items-center mb-2 ml-1">
              <ShieldCheck size={14} color="#C9A84C" />
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider ml-2">Login ID / Auditor ID</Text>
            </View>
            <TextInput
              value={id}
              onChangeText={setId}
              placeholder="e.g. LUX-8836"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              className="bg-white/10 h-14 rounded-2xl px-5 text-white font-bold border border-white/5"
            />
          </View>

          <View className="gap-y-4">
            <Pressable 
              onPress={handleSignIn}
              disabled={isAuthLoading}
              className="bg-[#C9A84C] h-16 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-95"
            >
              <Text className="text-[#0A0F1E] font-black text-lg mr-3">INITIALIZE IDENTITY</Text>
              <ArrowRight size={20} color="#0A0F1E" strokeWidth={3} />
            </Pressable>

            <View className="flex-row items-center my-1">
              <View className="flex-1 h-[1px] bg-white/10" />
              <Text className="mx-4 text-slate-500 text-[8px] font-black uppercase">OR VERIFIED LOGIN</Text>
              <View className="flex-1 h-[1px] bg-white/10" />
            </View>

            <Pressable 
              onPress={() => signIn()}
              disabled={isAuthLoading}
              className="bg-white h-16 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-95"
            >
              {isAuthLoading ? (
                <ActivityIndicator color="#0A0F1E" size="small" />
              ) : (
                <>
                  <View className="bg-red-500 w-5 h-5 rounded-sm items-center justify-center mr-2">
                    <Text className="text-white font-black text-[10px]">G</Text>
                  </View>
                  <Text className="text-[#0A0F1E] font-black text-lg">SIGN IN WITH GOOGLE</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        <Text className="text-slate-500 text-center text-[10px] font-medium leading-relaxed mt-10 px-6">
          Verified Login locks your Auditor ID to your Google account for maximum audit integrity and cloud syncing accuracy.
        </Text>

        <Text className="text-[#C9A84C]/20 text-center text-[8px] font-black uppercase tracking-[2px] mt-8">
          Enterprise v1.1.0 • GHOST IDENTITY ACTIVE
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
