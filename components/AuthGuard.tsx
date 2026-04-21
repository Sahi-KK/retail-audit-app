import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuditStore } from '../store/auditStore';
import { User, ShieldCheck, ArrowRight, ClipboardCheck } from 'lucide-react-native';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, updateAuth } = useAuditStore();
  const [name, setName] = useState(auth.auditorName || '');
  const [id, setId] = useState(auth.auditorId || '');

  // AUTHORIZED LIST
  const validateAccess = (n: string, i: string) => {
    const trimmedName = (n || "").trim();
    const trimmedId = (i || "").trim().toUpperCase();
    
    const isKK = trimmedName === "Krishnakant Singh" && trimmedId === "KK13";
    const isRidhima = trimmedName === "Ridhima" && trimmedId === "RR11";
    
    return isKK || isRidhima;
  };

  // If already logged in, double-check the authorization
  if (auth.auditorId && auth.auditorName) {
    if (validateAccess(auth.auditorName, auth.auditorId)) {
      return <>{children}</>;
    } else {
      // CLEAR UNAUTHORIZED SESSION
      updateAuth('', '');
    }
  }

  const notify = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  };

  const handleSignIn = () => {
    console.log(`[AUTH] Attempting access: Name="${name}", ID="${id}"`);
    if (validateAccess(name, id)) {
      console.log("[AUTH] Identity Verified. Opening Hub...");
      updateAuth(name.trim(), id.trim().toUpperCase());
    } else {
      notify(
        "Access Denied", 
        "This identity is not recognized in the Strategic Hub registry. Please contact the administrator."
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0A0F1E]"
    >
      <View className="flex-1 px-8 justify-center">
        {/* Logo Section */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-[#C9A84C]/20 rounded-3xl items-center justify-center border border-[#C9A84C]/30 mb-6">
            <ClipboardCheck size={40} color="#C9A84C" />
          </View>
          <Text className="text-white text-3xl font-black tracking-tight text-center">Retail Audit</Text>
          <Text className="text-[#C9A84C] text-xs font-black uppercase tracking-[4px] mt-2 text-center">Enterprise Hub</Text>
        </View>

        {/* Form Section */}
        <View className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6 text-center">Employee Identity Required</Text>
          
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
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider ml-2">Employee ID</Text>
            </View>
            <TextInput
              value={id}
              onChangeText={setId}
              placeholder="e.g. EMP-9921"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              className="bg-white/10 h-14 rounded-2xl px-5 text-white font-bold border border-white/5"
            />
          </View>

          <Pressable 
            onPress={handleSignIn}
            className="bg-[#C9A84C] h-16 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-95"
          >
            <Text className="text-[#0A0F1E] font-black text-lg mr-3">ACCESS HUB</Text>
            <ArrowRight size={20} color="#0A0F1E" strokeWidth={3} />
          </Pressable>
        </View>

        <Text className="text-[#C9A84C]/20 text-center text-[8px] font-black uppercase tracking-[2px] mt-24">
          Enterprise v2.3.0 • GHOST STABLE • Sync Active
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
