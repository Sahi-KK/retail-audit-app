import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

interface ScoreBadgeProps {
  percentage: number;
}

export function ScoreBadge({ percentage }: ScoreBadgeProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1);
    });
  }, [percentage, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getBadgeColorClass = () => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-amber-400';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Animated.View style={animatedStyle}>
      <View className={`px-3 py-1.5 rounded-full shadow-sm ${getBadgeColorClass()}`}>
        <Text className="text-white font-bold text-sm tracking-wide">
          {percentage}%
        </Text>
      </View>
    </Animated.View>
  );
}
