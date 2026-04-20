import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

interface ScoreSelectorProps {
  score: number | undefined;
  onChange: (score: number) => void;
  disabled?: boolean;
}

const SCORES = [0, 1, 2, 3, 4, 5];

export function ScoreSelector({ score, onChange, disabled }: ScoreSelectorProps) {
  return (
    <View className="flex-row justify-between items-center w-full mt-5 bg-slate-50 p-2 rounded-full border border-slate-100">
      {SCORES.map((s) => (
        <ScorePill
          key={s}
          value={s}
          isSelected={score === s}
          onPress={() => onChange(s)}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

interface ScorePillProps {
  value: number;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function ScorePill({ value, isSelected, onPress, disabled }: ScorePillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
      backgroundColor: isSelected ? '#0F172A' : 'transparent', // slate-900
      shadowOpacity: isSelected ? 0.15 : 0,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    };
  });

  return (
    <Pressable
      onPressIn={() => {
        scale.value = 0.95;
      }}
      onPressOut={() => {
        if (disabled) return;
        scale.value = 1;
        onPress();
      }}
      className={`flex-1 items-center justify-center py-2 rounded-full mx-0.5 ${disabled && !isSelected ? 'opacity-30' : ''}`}
    >
      <Animated.View style={[animatedStyle, { width: '100%', alignItems: 'center', paddingVertical: 12, borderRadius: 9999 }]}>
        <Text
          className={`text-lg font-black ${
            isSelected ? 'text-white' : 'text-slate-400'
          }`}
        >
          {value}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
