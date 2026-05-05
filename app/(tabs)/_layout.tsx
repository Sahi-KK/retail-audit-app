import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Home, Store, Settings, ClipboardList, User } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0A0F1E',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontWeight: '900',
          fontSize: 18,
        },
        headerRight: () => (
          <Pressable 
            onPress={() => router.push('/settings')}
            className="mr-5 p-2 rounded-xl bg-white/10"
          >
            <Settings size={20} color="#C9A84C" />
          </Pressable>
        ),
        tabBarActiveTintColor: '#C9A84C', // Gold
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#0A0F1E', // Navy
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: 'Stores',
          tabBarIcon: ({ color }) => <Store size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="terminology"
        options={{
          title: 'Terminology',
          href: null, // Hide from bottom bar
        }}
      />
    </Tabs>
  );
}
