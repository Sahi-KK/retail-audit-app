import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { AuthGuard } from '../components/AuthGuard';
import { Cloud, CheckCircle } from 'lucide-react-native';
import 'react-native-reanimated';
import '../global.css';

function UpdateGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        // Minimum wait so the user can see the "Checking" status
        const startTime = Date.now();
        
        const update = await Updates.checkForUpdateAsync();
        
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1500 - elapsed);
        
        if (update.isAvailable) {
          setIsUpdating(true);
          await Updates.fetchUpdateAsync();
          setUpdateReady(true);
          setTimeout(async () => {
             await Updates.reloadAsync();
          }, 1500);
        } else {
          // Stay on "Checking" screen for at least 1.5s for visual confirmation
          setTimeout(() => {
            setIsChecking(false);
          }, remaining);
        }
      } catch (error) {
        console.warn('Update check failed:', error);
        setIsChecking(false);
      }
    }

    if (!__DEV__ && Platform.OS !== 'web') {
      onFetchUpdateAsync();
    } else {
      setIsChecking(false);
    }
    
    // FAIL-SAFE: Force start after 5 seconds no matter what
    const forceStart = setTimeout(() => {
        setIsChecking(false);
    }, 5000);

    return () => clearTimeout(forceStart);
  }, []);

  if (isChecking || isUpdating) {
    return (
      <View className="flex-1 bg-[#0A0F1E] items-center justify-center px-10">
        <View className="items-center mb-10">
           <View className="w-24 h-24 bg-[#C9A84C]/10 rounded-full items-center justify-center mb-6">
             {updateReady ? (
               <CheckCircle size={48} color="#C9A84C" />
             ) : (
               <Cloud size={48} color="#C9A84C" />
             )}
           </View>
           <Text className="text-white text-2xl font-black text-center">
             {updateReady ? 'Protocol Updated' : 'Ghost Command Sync'}
           </Text>
           <Text className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[3px] mt-2 text-center">
             {updateReady ? 'RESTARTING APP...' : isUpdating ? 'DOWNLOADING NEW FEATURES' : 'VERIFYING CLOUD PROTOCOLS'}
           </Text>
        </View>

        {!updateReady && (
          <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <ActivityIndicator size="small" color="#C9A84C" />
          </View>
        )}
        
        <Text className="text-slate-500 text-xs text-center mt-6 leading-relaxed">
          {isUpdating 
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
