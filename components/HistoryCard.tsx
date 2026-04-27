import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Calendar, MapPin, User, Cloud, CloudOff } from 'lucide-react-native';
import { SavedAudit } from '../store/auditStore';

interface HistoryCardProps {
  audit: SavedAudit;
  onPress: () => void;
}

export function HistoryCard({ audit, onPress }: HistoryCardProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (percentage >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const colorStyles = getScoreColor(audit.finalPercentage);

  return (
    <Pressable 
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm active:opacity-70"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-0.5">
             {audit.headerInfo.storeCode ? (
              <Text className="text-gold/60 text-[10px] font-bold uppercase tracking-widest mr-2">
                {audit.headerInfo.storeCode}
              </Text>
            ) : null}
            {audit.isSynced ? (
              <Cloud size={10} color="#10B981" />
            ) : (
              <CloudOff size={10} color="#94A3B8" />
            )}
          </View>
          <Text className="text-navy font-bold text-lg mb-1" numberOfLines={1}>
            {audit.headerInfo.store || 'Untitled Store'}
          </Text>
          <View className="flex-row items-center opacity-60">
            <Calendar size={12} color="#4B5563" />
            <Text className="text-xs text-navy ml-1">
              {new Date(audit.completedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View className={`px-3 py-2 rounded-xl border ${colorStyles.split(' ').slice(1).join(' ')}`}>
          <Text className={`text-xl font-black ${colorStyles.split(' ')[0]}`}>
            {audit.finalPercentage}%
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
        <View className="flex-row items-center">
          <View className="bg-gray-100 p-1.5 rounded-full mr-2">
            <User size={12} color="#6B7280" />
          </View>
          <Text className="text-gray-500 text-sm">{audit.headerInfo.auditorName || 'Unknown'}</Text>
        </View>
        
        <View className="flex-row items-center">
          {audit.isSynced ? (
            <Text className="text-emerald-500/60 font-black text-[8px] uppercase tracking-widest mr-3">Vaulted</Text>
          ) : (
            <Text className="text-rose-500/60 font-black text-[8px] uppercase tracking-widest mr-3">Local Only</Text>
          )}
          <Text className="text-navy font-semibold text-xs mr-1 opacity-40">View Report</Text>
          <ChevronRight size={14} color="#0A0F1E" opacity={0.3} />
        </View>
      </View>
    </Pressable>
  );
}
