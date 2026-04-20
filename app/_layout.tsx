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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setIsUpdating(true);
          await Updates.fetchUpdateAsync();
          setUpdateReady(true);
          // Optional: Give it a sec for the user to see the success state
          setTimeout(async () => {
             await Updates.reloadAsync();
          }, 1500);
        }
      } catch (error) {
        // Fallback silently if update fails/offline
        console.warn('Update check failed:', error);
      }
    }

    // Only run this in production (non-dev)
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  if (isUpdating) {
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
             {updateReady ? 'Update Ready' : 'Cloud Sync Active'}
           </Text>
           <Text className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[3px] mt-2">
             {updateReady ? 'RESTARTING APP...' : 'DOWNLOADING NEW FEATURES'}
           </Text>
        </View>

        {!updateReady && (
          <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <View className="h-full bg-[#C9A84C] w-2/3" />
          </View>
        )}
        
        <Text className="text-slate-500 text-xs text-center mt-6 leading-relaxed">
          The Master Hub is pushing the latest protocol and security patches to your device.
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
