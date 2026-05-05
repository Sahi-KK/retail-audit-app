import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, Image, Alert } from 'react-native';
import { useAuditStore, Terminology } from '../../store/auditStore';
import { Book, Plus, X, Trash2, Camera, Search, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TerminologyScreen() {
  const insets = useSafeAreaInsets();
  const { terminology, addTerm, deleteTerm } = useAuditStore();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTerm, setNewTerm] = useState({ word: '', definition: '', imageUri: '' });

  const filteredTerms = terminology.filter(t => 
    t.word.toLowerCase().includes(search.toLowerCase()) || 
    t.definition.toLowerCase().includes(search.toLowerCase())
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewTerm({ ...newTerm, imageUri: result.assets[0].uri });
    }
  };

  const handleAdd = () => {
    if (!newTerm.word || !newTerm.definition) {
      Alert.alert("Missing Info", "Please provide at least a word and its definition.");
      return;
    }
    const term: Terminology = {
      id: Date.now().toString(),
      word: newTerm.word,
      definition: newTerm.definition,
      imageUri: newTerm.imageUri
    };
    addTerm(term);
    setNewTerm({ word: '', definition: '', imageUri: '' });
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mt-8 mb-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-900 font-black text-2xl tracking-tighter">Business Glossary</Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-[3px] mt-1">Strategic Terminology</Text>
            </View>
            <Pressable 
              onPress={() => setModalVisible(true)}
              className="bg-slate-900 p-4 rounded-2xl shadow-lg active:scale-95"
            >
              <Plus size={20} color="#C9A84C" />
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl h-14 flex-row items-center px-5 shadow-sm border border-slate-100 mb-8">
            <Search size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-4 text-slate-800 font-bold"
              placeholder="Search glossary..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {filteredTerms.map((term) => (
          <View key={term.id} className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100 overflow-hidden">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-slate-900 font-black text-lg tracking-tight mb-2">{term.word}</Text>
                <Text className="text-slate-500 text-sm leading-relaxed">{term.definition}</Text>
              </View>
              <Pressable 
                onPress={() => {
                  Alert.alert("Delete Term", `Are you sure you want to remove "${term.word}"?`, [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteTerm(term.id) }
                  ]);
                }}
                className="bg-rose-50 p-3 rounded-xl active:scale-95"
              >
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            </View>

            {term.imageUri && (
              <View className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                <Image 
                  source={{ uri: term.imageUri }} 
                  style={{ width: '100%', height: 160, borderRadius: 16 }} 
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <Pressable className="absolute inset-0" onPress={() => setModalVisible(false)} />
          <View className="bg-white rounded-t-[48px] p-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-slate-900 font-black text-xl">Add New Term</Text>
              <Pressable onPress={() => setModalVisible(false)} className="bg-slate-50 p-2 rounded-full">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View className="gap-y-6">
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Word / Phrase</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold"
                  placeholder="e.g. Planogram"
                  value={newTerm.word}
                  onChangeText={(text) => setNewTerm({ ...newTerm, word: text })}
                />
              </View>

              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Definition</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold"
                  placeholder="What does this mean for the business?"
                  multiline
                  numberOfLines={3}
                  value={newTerm.definition}
                  onChangeText={(text) => setNewTerm({ ...newTerm, definition: text })}
                />
              </View>

              <Pressable 
                onPress={handlePickImage}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 items-center justify-center"
              >
                {newTerm.imageUri ? (
                  <Image source={{ uri: newTerm.imageUri }} className="w-full h-32 rounded-xl" resizeMode="cover" />
                ) : (
                  <>
                    <Camera size={24} color="#94A3B8" />
                    <Text className="text-slate-400 font-bold text-xs mt-2">Attach Visual Guide (Optional)</Text>
                  </>
                )}
              </Pressable>

              <Pressable 
                onPress={handleAdd}
                className="bg-slate-900 py-5 rounded-3xl items-center shadow-lg active:scale-95 mt-4"
              >
                <Text className="text-white font-black text-lg">Save Term</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
