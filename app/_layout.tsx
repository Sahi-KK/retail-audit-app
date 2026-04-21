import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { AuthGuard } from '../components/AuthGuard';
import { Cloud, CheckCircle } from 'lucide-react-native';
import 'react-native-reanimated';
import '../global.css';

function UpdateGuard({ children }: { children: React.ReactNode }) {
  // RADICAL SPEED: Bypass update check instantly on Web
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  const [isCloudSyncing, setIsCloudSyncing] = useState(true);
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
  const [isProtocolReady, setIsProtocolReady] = useState(false);

  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const startTime = Date.now();
        const update = await Updates.checkForUpdateAsync();
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1500 - elapsed);
        
        if (update.isAvailable) {
          setIsDownloadingUpdate(true);
          await Updates.fetchUpdateAsync();
          setIsProtocolReady(true);
          setTimeout(async () => {
             await Updates.reloadAsync();
          }, 1500);
        } else {
          setTimeout(() => {
            setIsCloudSyncing(false);
          }, remaining);
        }
      } catch (error) {
        console.warn('Update check failed:', error);
        setIsCloudSyncing(false);
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
    } else {
      setIsCloudSyncing(false);
    }
    
    // FAIL-SAFE: Force start after 5 seconds no matter what
    const forceStart = setTimeout(() => {
        setIsCloudSyncing(false);
    }, 5000);

    return () => clearTimeout(forceStart);
  }, []);

  if (isCloudSyncing || isDownloadingUpdate) {
    return (
      <View className="flex-1 bg-[#0A0F1E] items-center justify-center px-10">
        <View className="items-center mb-10">
           <View className="w-24 h-24 bg-[#C9A84C]/10 rounded-full items-center justify-center mb-6">
             {isProtocolReady ? (
               <CheckCircle size={48} color="#C9A84C" />
             ) : (
               <Cloud size={48} color="#C9A84C" />
             )}
           </View>
           <Text className="text-white text-2xl font-black text-center">
             {isProtocolReady ? 'Protocol Updated' : 'Ghost Command Sync'}
           </Text>
           <Text className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[3px] mt-2 text-center">
             {isProtocolReady ? 'RESTARTING APP...' : isDownloadingUpdate ? 'DOWNLOADING NEW FEATURES' : 'VERIFYING CLOUD PROTOCOLS'}
           </Text>
        </View>

        {!isProtocolReady && (
          <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <ActivityIndicator size="small" color="#C9A84C" />
          </View>
        )}
        
        <Text className="text-slate-500 text-xs text-center mt-6 leading-relaxed">
          {isDownloadingUpdate 
            ? 'Beaming latest logic and security patches to your device.' 
            : 'Establishing secure link with the Master Hub...'}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <UpdateGuard>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(audit)" />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="dark" />
      </AuthGuard>
    </UpdateGuard>
  );
}
