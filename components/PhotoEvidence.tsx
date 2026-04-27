import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, PlusCircle, MinusCircle, X } from 'lucide-react-native';
import { useAuditStore } from '../store/auditStore';
import { useScoreCalc } from '../hooks/useScoreCalc';

export function PhotoEvidence() {
  const { photos, addPhoto, updatePhoto, removePhoto } = useAuditStore();
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const { isReadOnly } = useScoreCalc();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftUri, setDraftUri] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftRemark, setDraftRemark] = useState('');
  const [draftTag, setDraftTag] = useState<'positive' | 'negative' | null>(null);

  const takePhoto = async () => {
    if (!status?.granted) {
      const p = await requestPermission();
      if (!p.granted) return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setEditingId(null);
      setDraftUri(result.assets[0].uri);
      setDraftTitle('');
      setDraftRemark('');
      setDraftTag(null);
      setModalVisible(true);
    }
  };

  const openEditModal = (photo: any) => {
    if (isReadOnly) return;
    setEditingId(photo.id);
    setDraftUri(photo.uri);
    setDraftTitle(photo.title);
    setDraftRemark(photo.remark);
    setDraftTag(photo.tag);
    setModalVisible(true);
  };

  const handleSaveDraft = () => {
    if (!draftTitle.trim() || !draftRemark.trim() || !draftTag || !draftUri) {
      Alert.alert('Missing Fields', 'Please complete the title, remark, and select a tag before saving.');
      return;
    }

    if (editingId) {
      updatePhoto(editingId, {
        title: draftTitle,
        remark: draftRemark,
        tag: draftTag
      });
    } else {
      addPhoto({
        id: Date.now().toString(),
        uri: draftUri,
        title: draftTitle,
        remark: draftRemark,
        tag: draftTag,
        timestamp: new Date().toISOString()
      });
    }

    setModalVisible(false);
    setEditingId(null);
    setDraftUri(null);
  };

  return (
    <View className="mb-4">
      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {photos.map((p) => (
            <Pressable 
              key={p.id} 
              onPress={() => openEditModal(p)}
              onLongPress={() => {
                if (isReadOnly) return;
                Alert.alert('Remove Evidence?', p.title, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => removePhoto(p.id) }
                ]);
              }}
              className="mr-4 relative active:scale-95"
            >
              <Image source={{ uri: p.uri }} className="w-20 h-20 rounded-[20px] bg-slate-100 border border-slate-50" />
              <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                {p.tag === 'positive' ? (
                  <PlusCircle size={14} color="#10B981" />
                ) : (
                  <MinusCircle size={14} color="#EF4444" />
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {!isReadOnly && (
        <Pressable
          onPress={takePhoto}
          className="flex-row items-center justify-center bg-slate-50 py-4 rounded-[24px] border border-slate-100 active:scale-[0.98]"
        >
          <Camera size={18} color="#64748B" />
          <Text className="text-slate-500 font-black text-xs uppercase tracking-[2px] ml-3">Add Evidence Material</Text>
        </Pressable>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white rounded-t-[48px] pt-10 pb-12 px-8 relative h-[92%] shadow-2xl">
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <Text className="text-3xl font-black text-slate-900 tracking-tighter">
                  {editingId ? 'Edit Evidence' : 'Evidence Entry'}
                </Text>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mt-2">Visual Documentation</Text>
              </View>
              <Pressable onPress={() => setModalVisible(false)} className="bg-slate-50 p-3 rounded-2xl active:scale-95">
                <X size={20} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {draftUri && (
                <Image 
                  source={{ uri: draftUri }} 
                  className="w-full h-64 rounded-[32px] mb-8 bg-slate-50 border border-slate-100" 
                  resizeMode="cover"
                />
              )}

              <Text className="text-slate-400 font-black mb-3 uppercase text-[10px] tracking-[2px] ml-2">Subject Title</Text>
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 text-slate-900 font-black text-base mb-6"
                placeholder="e.g., Merchandising Compliance"
                placeholderTextColor="#94A3B8"
                value={draftTitle}
                onChangeText={setDraftTitle}
              />
 
              <Text className="text-slate-400 font-black mb-3 uppercase text-[10px] tracking-[2px] ml-2">Contextual Remark</Text>
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-5 text-slate-900 font-bold text-base mb-8 leading-tight"
                placeholder="Observed compliance or violation details..."
                placeholderTextColor="#94A3B8"
                value={draftRemark}
                onChangeText={setDraftRemark}
                multiline
                numberOfLines={4}
                style={{ textAlignVertical: 'top', minHeight: 120 }}
              />

              <Text className="text-slate-400 font-black mb-4 uppercase text-[10px] tracking-[2px] ml-2">Compliance Tag</Text>
              <View className="flex-row gap-x-4 mb-10">
                <Pressable
                  onPress={() => setDraftTag('positive')}
                  className={`flex-1 flex-row items-center justify-center py-5 rounded-[24px] border-2 ${
                    draftTag === 'positive' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 bg-white'
                  }`}
                >
                  <PlusCircle size={20} color={draftTag === 'positive' ? '#10B981' : '#CBD5E1'} />
                  <Text className={`ml-3 font-black tracking-tight ${draftTag === 'positive' ? 'text-emerald-700' : 'text-slate-400'}`}>Positive (+)</Text>
                </Pressable>
 
                <Pressable
                  onPress={() => setDraftTag('negative')}
                  className={`flex-1 flex-row items-center justify-center py-5 rounded-[24px] border-2 ${
                    draftTag === 'negative' ? 'border-red-500 bg-red-50' : 'border-slate-50 bg-white'
                  }`}
                >
                  <MinusCircle size={20} color={draftTag === 'negative' ? '#EF4444' : '#CBD5E1'} />
                  <Text className={`ml-3 font-black tracking-tight ${draftTag === 'negative' ? 'text-red-700' : 'text-slate-400'}`}>Negative (-)</Text>
                </Pressable>
              </View>
 
              <Pressable
                onPress={handleSaveDraft}
                className="bg-slate-900 py-6 rounded-[32px] items-center shadow-xl active:opacity-90 active:scale-[0.98]"
              >
                <Text className="text-white font-black text-lg tracking-tight">Finalize Evidence</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
