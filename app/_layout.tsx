import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import { AuthGuard } from '../components/AuthGuard';
import { Cloud, CheckCircle } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuditStore } from '../store/auditStore';
import 'react-native-reanimated';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function UpdateGuard({ children }: { children: React.ReactNode }) {
  const [isCloudSyncing, setIsCloudSyncing] = useState(Platform.OS !== 'web');
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
  const [isProtocolReady, setIsProtocolReady] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // ZUSTAND HYDRATION & SPLASH HIDING
  useEffect(() => {
    async function init() {
      try {
        console.log(`[SYSTEM] Initializing Hub Protocol... (Platform: ${Platform.OS})`);
        
        // Check if already hydrated
        if (useAuditStore.persist.hasHydrated()) {
          setHasHydrated(true);
        } else {
          // Wait for hydration
          const unsubFinish = useAuditStore.persist.onFinishHydration(() => {
            setHasHydrated(true);
          });
          // Timeout for hydration fail-safe
          setTimeout(() => setHasHydrated(true), 2000);
          return () => unsubFinish();
        }
      } catch (e) {
        console.error("[SYSTEM] Initialization Error:", e);
        setHasHydrated(true); // Fail forward
      } finally {
        if (Platform.OS === 'web') {
          SplashScreen.hideAsync();
        }
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsCloudSyncing(false);
      return;
    }

    // NATIVE SPECIFIC: Actual Over-The-Air Updates Check
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setIsDownloadingUpdate(true);
          await Updates.fetchUpdateAsync();
          setIsProtocolReady(true);
          setTimeout(async () => {
             await Updates.reloadAsync();
          }, 1500);
        } else {
          setIsCloudSyncing(false);
          SplashScreen.hideAsync();
        }
      } catch (error) {
        setIsCloudSyncing(false);
        SplashScreen.hideAsync();
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
    } else {
      setIsCloudSyncing(false);
      SplashScreen.hideAsync();
    }
    
    const forceStart = setTimeout(() => {
      setIsCloudSyncing(false);
      SplashScreen.hideAsync();
    }, 5000);

    return () => clearTimeout(forceStart);
  }, []);

  // On Web, we prioritize getting the app interactive as quickly as possible
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      
      {(isCloudSyncing || isDownloadingUpdate) && (
        <View 
          className="absolute inset-0 bg-[#0A0F1E] items-center justify-center px-10"
          style={{ zIndex: 99999, elevation: 99999 }}
        >
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
            Establishing secure link with the Master Hub...
          </Text>
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  if (Platform.OS === 'web') {
    return (
      <UpdateGuard>
        <AuthGuard>
          <View style={{ flex: 1, backgroundColor: '#0A0F1E', alignItems: 'center' }}>
            <View 
              testID="root-container"
              style={{ 
                flex: 1, 
                width: '100%', 
                maxWidth: 480, 
                backgroundColor: '#F8FAFC', // slate-50
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(audit)" />
                <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
                <Stack.Screen name="login" options={{ presentation: 'modal' }} />
              </Stack>
            </View>
          </View>
          <StatusBar style="light" />
        </AuthGuard>
      </UpdateGuard>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UpdateGuard>
        <AuthGuard>
          <View className="flex-1 bg-[#0A0F1E] items-center w-full">
            <View className="flex-1 w-full max-w-[480px] bg-slate-50 overflow-hidden web:border-x web:border-white/10 web:shadow-2xl">
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(audit)" />
                <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
                <Stack.Screen name="login" options={{ presentation: 'modal' }} />
              </Stack>
            </View>
          </View>
          <StatusBar style="light" />
        </AuthGuard>
      </UpdateGuard>
    </GestureHandlerRootView>
  );
}
