import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

interface ScoreSelectorProps {
  score: number | undefined;
  onChange: (score: number) => void;
  disabled?: boolean;
  isBinary?: boolean;
}

const SCORES = [0, 1, 2, 3, 4, 5];

export function ScoreSelector({ score, onChange, disabled, isBinary }: ScoreSelectorProps) {
  const visibleScores = isBinary ? [0, 5] : SCORES;

  return (
    <View className="flex-row justify-between items-center w-full mt-6 bg-slate-100/50 p-1.5 rounded-3xl border border-slate-200/50">
      {visibleScores.map((s) => (
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
  const animatedStyle = useAnimatedStyle(() => {
    const getBgColor = () => {
      if (!isSelected) return 'transparent';
      if (value >= 4) return '#10B981'; // Emerald (Excellent)
      if (value >= 2) return '#F59E0B'; // Amber (Needs Work)
      return '#EF4444'; // Red (Critical)
    };

    return {
      backgroundColor: withSpring(getBgColor()),
      transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
    };
  });

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        onPress();
      }}
      className={`flex-1 items-center justify-center py-2.5 rounded-2xl mx-1 ${
        disabled && !isSelected ? 'opacity-30' : ''
      }`}
    >
      <Animated.View 
        style={[animatedStyle, { 
          width: '100%', 
          alignItems: 'center', 
          paddingVertical: 14, 
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isSelected ? 0.2 : 0,
          shadowRadius: 10,
          elevation: isSelected ? 4 : 0
        }]}
      >
        <Text
          className={`text-base font-black ${
            isSelected ? 'text-white' : 'text-slate-400'
          }`}
        >
          {value}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
