import { useRouter } from 'expo-router';
import { ArrowLeft, Pencil, Plus, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react-native';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../components/Badge';
import { locationData, StoreLocation } from '../data/locationData';
import { useAuditStore } from '../store/auditStore';

export default function ManageStoresScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customStores, addCustomStore, deleteCustomStore, updateStore } = useAuditStore();

  // Add Form State
  const [isAddExpanded, setIsAddExpanded] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newCode, setNewCode] = React.useState('');
  const [newBrand, setNewBrand] = React.useState<'Sunglass Hut' | 'LensCrafters'>('Sunglass Hut');

  // Edit State
  const [editingStore, setEditingStore] = React.useState<StoreLocation | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editCode, setEditCode] = React.useState('');
  const [editBrand, setEditBrand] = React.useState<'Sunglass Hut' | 'LensCrafters'>('Sunglass Hut');

  const allStores = React.useMemo(() => {
    const defaults = locationData["Karnataka"]["Bengaluru"];
    const combined = [...(customStores || []), ...defaults];
    const unique = [];
    const seen = new Set();
    for (const s of combined) {
      if (!seen.has(s.code)) {
        seen.add(s.code);
        unique.push(s);
      }
    }
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [customStores]);

  const handleAddStore = () => {
    if (!newName || !newCode) {
      Alert.alert("Required", "Please provide a store name and identification code.");
      return;
    }
    addCustomStore({ name: newName, code: newCode, brand: newBrand });
    setNewName('');
    setNewCode('');
    setIsAddExpanded(false);
    Alert.alert("Success", "Location registered to directory.");
  };

  const handleEditInit = (store: StoreLocation) => {
    setEditingStore(store);
    setEditName(store.name);
    setEditCode(store.code);
    setEditBrand(store.brand);
  };

  const handleUpdateStore = () => {
    if (!editingStore) return;
    updateStore(editingStore.code, { name: editName, code: editCode, brand: editBrand });
    setEditingStore(null);
    Alert.alert("Updated", "Store profile has been normalized.");
  };

  const handleRestoreDefaults = () => {
    Alert.alert(
      "Restore Factory List?",
      "This will revert all default stores to their original state. Custom entries are safe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore", onPress: () => {
            const defaults = locationData["Karnataka"]["Bengaluru"];
            for (const d of defaults) deleteCustomStore(d.code);
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-8 bg-slate-900 rounded-b-[40px] shadow-2xl z-20">
        <View className="flex-row items-center justify-between mb-6">
          <Pressable onPress={handleBack} className="bg-white/10 p-3 rounded-2xl active:scale-95">
            <ArrowLeft size={20} color="#C9A84C" />
          </Pressable>
          <Pressable onPress={handleRestoreDefaults} className="bg-white/5 px-4 py-2 rounded-xl flex-row items-center border border-white/10 active:bg-white/10">
            <RefreshCw size={12} color="#94A3B8" />
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-3">Revert Defaults</Text>
          </Pressable>
        </View>
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-2">Portfolio Management</Text>
        <Text className="text-white text-3xl font-black tracking-tight">Enterprise Directory</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-8"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Section */}
        <View className="mb-8">
          <Pressable
            onPress={() => setIsAddExpanded(!isAddExpanded)}
            className="bg-gold p-5 rounded-[24px] flex-row items-center justify-between shadow-xl active:scale-[0.98]"
          >
            <View className="flex-row items-center">
              <View className="bg-slate-900/10 p-2 rounded-xl mr-4">
                <Plus size={20} color="#0F172A" strokeWidth={3} />
              </View>
              <Text className="text-slate-900 font-black text-sm uppercase tracking-tight">Register New Location</Text>
            </View>
            <View className={`transform ${isAddExpanded ? 'rotate-45' : 'rotate-0'}`}>
              <Plus size={16} color="#0F172A" />
            </View>
          </Pressable>

          {isAddExpanded && (
            <View className="bg-white mt-4 p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <View className="flex-row gap-x-2 mb-6">
                {(['Sunglass Hut', 'LensCrafters'] as const).map(b => (
                  <Pressable
                    key={b}
                    onPress={() => setNewBrand(b)}
                    className={`flex-1 py-4 px-1 rounded-2xl border items-center ${newBrand === b ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100'
                      }`}
                  >
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${newBrand === b ? 'text-white' : 'text-slate-400'}`}>
                      {b}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-2xl px-6 h-14 text-slate-900 font-bold mb-4"
                placeholder="Store Name"
                value={newName}
                onChangeText={setNewName}
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-2xl px-6 h-14 text-slate-900 font-bold mb-8"
                placeholder="Store Code"
                value={newCode}
                onChangeText={setNewCode}
                placeholderTextColor="#94A3B8"
              />

              <Pressable onPress={handleAddStore} className="bg-slate-900 py-5 rounded-[24px] items-center shadow-lg active:opacity-90">
                <Text className="text-gold font-black uppercase text-xs tracking-[2px]">Authorize Location</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* List Section */}
        <View className="mb-6 px-2 flex-row justify-between items-center">
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px]">Managed Registry</Text>
          <View className="bg-slate-100 px-3 py-1 rounded-full">
            <Text className="text-slate-500 text-[10px] font-black">{allStores.length} ACTIVE</Text>
          </View>
        </View>

        <View className="gap-y-5">
          {allStores.map(store => (
            <View key={store.code} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 mr-4">
                  <Text className="text-slate-900 font-black text-xl mb-3 tracking-tight leading-tight">{store.name}</Text>
                  <View className="flex-row items-center">
                    <View className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mr-3">
                      <Text className="text-slate-400 text-[11px] font-black tracking-widest uppercase">{store.code}</Text>
                    </View>
                    <Badge brand={store.brand} />
                  </View>
                </View>
                <View className="flex-row gap-x-2">
                  <Pressable onPress={() => handleEditInit(store)} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 active:bg-slate-100">
                    <Pencil size={16} color="#94A3B8" />
                  </Pressable>
                  <Pressable onPress={() => deleteCustomStore(store.code)} className="bg-rose-50 p-3 rounded-2xl border border-rose-100 active:bg-rose-100">
                    <Trash2 size={16} color="#FDA4AF" />
                  </Pressable>
                </View>
              </View>

              <View className="flex-row items-center pt-5 border-t border-slate-50">
                <ShieldCheck size={14} color="#10B981" />
                <Text className="ml-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Status Verified</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Modal (Redesigned) */}
      <Modal visible={!!editingStore} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[48px] p-8 pb-16 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <View>
                <Text className="text-slate-400 text-[9px] font-black uppercase tracking-[3px] mb-2">Adjust Registry</Text>
                <Text className="text-slate-900 font-black text-2xl tracking-tight">Store Modification</Text>
              </View>
              <Pressable onPress={() => setEditingStore(null)} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View className="gap-y-6">
              <View className="flex-row gap-x-3 mb-2">
                {(['Sunglass Hut', 'LensCrafters'] as const).map(b => (
                  <Pressable
                    key={b}
                    onPress={() => setEditBrand(b)}
                    className={`flex-1 py-5 rounded-[24px] border items-center ${editBrand === b ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-slate-50 border-slate-100'
                      }`}
                  >
                    <Text className={`text-[11px] font-black uppercase tracking-widest ${editBrand === b ? 'text-white' : 'text-slate-400'}`}>
                      {b}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View>
                <Text className="text-slate-400 text-[9px] font-black uppercase tracking-[2px] mb-3 ml-3">Location Profile</Text>
                <TextInput
                  className="bg-slate-50 rounded-3xl px-6 h-16 text-slate-900 font-bold text-base mb-4 border border-slate-100"
                  placeholder="Store Name"
                  value={editName}
                  onChangeText={setEditName}
                />
                <TextInput
                  className="bg-slate-50 rounded-3xl px-6 h-16 text-slate-900 font-bold text-base border border-slate-100"
                  placeholder="Store Code"
                  value={editCode}
                  onChangeText={setEditCode}
                />
              </View>

              <Pressable onPress={handleUpdateStore} className="bg-gold py-6 rounded-[32px] items-center shadow-2xl mt-4 active:scale-[0.98]">
                <Text className="text-slate-900 font-black uppercase text-sm tracking-[2px]">Normalize Profile</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
