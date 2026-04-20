import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { PhotoEvidence } from './PhotoEvidence';
import { SubmitModal } from './SubmitModal';
import { useScoreCalc } from '../hooks/useScoreCalc';
import { useLocalSearchParams } from 'expo-router';

export function Footer() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const { isReadOnly } = useScoreCalc();
  const params = useLocalSearchParams();
  const isEditing = params.isEditMode === 'true';

  const getButtonText = () => {
    if (isReadOnly) return 'Export Strategic Report';
    if (isEditing) return 'Save Audit Changes';
    return 'Certify & Submit Audit';
  };

  return (
    <>
      <View 
        className="bg-white border-t border-slate-100 px-6 pt-6 shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <PhotoEvidence />
        
        <Pressable
          onPress={() => setModalVisible(true)}
          className="bg-slate-900 flex-row items-center justify-center py-5 rounded-[28px] shadow-lg active:opacity-90 active:scale-[0.98]"
        >
          <Text className="text-white font-black text-lg mr-3 tracking-tight">
            {getButtonText()}
          </Text>
          <CheckCircle size={20} color="#C9A84C" />
        </Pressable>
      </View>

      <SubmitModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}
