import React from 'react';
import { View, Text } from 'react-native';
import { StoreBrand } from '../data/locationData';

interface BadgeProps {
  brand: StoreBrand;
  containerStyle?: string;
}

export function Badge({ brand, containerStyle = "" }: BadgeProps) {
  const isSH = brand === 'Sunglass Hut';
  
  return (
    <View className={`${isSH ? 'bg-slate-950' : 'bg-blue-600'} px-2.5 py-1 rounded-md ${containerStyle} shadow-sm`}>
      <Text className="text-white text-[10px] font-black uppercase tracking-wider">
        {brand}
      </Text>
    </View>
  );
}
