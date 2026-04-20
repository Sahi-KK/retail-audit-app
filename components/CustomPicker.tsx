import React, { useState } from 'react';
import { View, Text, Modal, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronDown, Search, X, Check } from 'lucide-react-native';

interface Option {
  label: string;
  value: string;
  sublabel?: string;
}

interface CustomPickerProps {
  label: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomPicker({ label, value, options, onSelect, placeholder = 'Select an option', disabled = false }: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find(o => o.value === value);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    o.sublabel?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onSelect(val);
    setModalVisible(false);
    setSearch('');
  };

  return (
    <View className="flex-row items-center border-b border-white/10 pb-2">
      <Text className="text-gray-400 text-xs font-bold uppercase w-24">{label}</Text>
      
      <Pressable 
        onPress={() => !disabled && setModalVisible(true)}
        className={`flex-1 flex-row justify-between items-center ${disabled ? 'opacity-50' : ''}`}
      >
        <Text className={`text-sm font-medium ${selectedOption ? 'text-white' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {!disabled && <ChevronDown size={14} color="#C9A84C" />}
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1 bg-black/60 justify-end"
        >
          <View className="bg-[#0A0F1E] rounded-t-[40px] pt-8 pb-10 px-6 max-h-[85%] border-t border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-gold/60 text-[10px] font-bold uppercase tracking-widest">{label}</Text>
                <Text className="text-white text-2xl font-black">Selection</Text>
              </View>
              <Pressable 
                onPress={() => setModalVisible(false)}
                className="bg-white/10 p-2 rounded-full border border-white/10"
              >
                <X size={20} color="white" />
              </Pressable>
            </View>

            <View className="bg-white/5 rounded-2xl h-12 flex-row items-center px-4 mb-6 border border-white/10">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-white font-medium"
                placeholder="Search..."
                placeholderTextColor="#6B7280"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable 
                    onPress={() => handleSelect(item.value)}
                    className={`flex-row justify-between items-center p-5 rounded-3xl mb-2 border ${
                      isSelected ? 'bg-gold border-gold' : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`text-base font-bold ${isSelected ? 'text-navy' : 'text-white'}`}>
                        {item.label}
                      </Text>
                      {item.sublabel && (
                        <Text className={`text-xs mt-1 ${isSelected ? 'text-navy/60' : 'text-white/40'}`}>
                          {item.sublabel}
                        </Text>
                      )}
                    </View>
                    {isSelected && <Check size={20} color="#0A0F1E" />}
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="items-center py-20 opacity-30">
                  <Search size={48} color="white" />
                  <Text className="text-white font-bold mt-4">No results found</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
