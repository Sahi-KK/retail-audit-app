import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { MessageSquare, X } from 'lucide-react-native';
import { ScoreSelector } from './ScoreSelector';
import { AuditQuestion } from '../data/auditQuestions';
import { useAuditStore } from '../store/auditStore';
import { useScoreCalc } from '../hooks/useScoreCalc';

interface QuestionCardProps {
  question: AuditQuestion;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const score = useAuditStore((state) => state.scores[question.id]);
  const remark = useAuditStore((state) => state.remarks?.[question.id] || '');
  const setScore = useAuditStore((state) => state.setScore);
  const setRemark = useAuditStore((state) => state.setRemark);
  const { isReadOnly } = useScoreCalc();
  
  const [isRemarkVisible, setIsRemarkVisible] = useState(remark.length > 0);

  return (
    <View className="mb-8 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden transition-colors duration-300 web:hover:border-slate-200">
      <View className="p-8">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <View className="bg-slate-900 px-4 py-1.5 rounded-full">
              <Text className="text-white text-[9px] font-black uppercase tracking-widest">
                {question.category}
              </Text>
            </View>
            {remark.length > 0 && (
              <View className="ml-2 bg-amber-100 px-2 py-1.5 rounded-full">
                <MessageSquare size={10} color="#D97706" fill="#FEF3C7" />
              </View>
            )}
          </View>
          <View className="bg-slate-50 w-8 h-8 rounded-xl items-center justify-center">
            <Text className="text-slate-400 font-black text-[10px]">{String(index + 1).padStart(2, '0')}</Text>
          </View>
        </View>

        <Text className="text-lg text-slate-800 leading-tight font-bold tracking-tight mb-8">
          {question.text}
        </Text>
        
        <View className="pt-8 border-t border-slate-50">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-2" />
              <Text className="text-[9px] text-slate-400 font-black tracking-widest uppercase">
                Compliance Score
              </Text>
            </View>
            
            {!isReadOnly && (
              <Pressable 
                onPress={() => setIsRemarkVisible(!isRemarkVisible)}
                className={`flex-row items-center px-3 py-1.5 rounded-full ${isRemarkVisible ? 'bg-slate-100' : 'bg-slate-50'}`}
              >
                <MessageSquare size={12} color={isRemarkVisible ? '#0F172A' : '#94A3B8'} />
                <Text className={`ml-2 text-[8px] font-black uppercase tracking-widest ${isRemarkVisible ? 'text-slate-900' : 'text-slate-400'}`}>
                  {isRemarkVisible ? 'Hide Remark' : 'Add Remark'}
                </Text>
              </Pressable>
            )}
          </View>

          {isRemarkVisible && (
            <View className="mb-6">
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-800 font-bold text-xs"
                placeholder="Type question-specific observation..."
                placeholderTextColor="#94A3B8"
                value={remark}
                onChangeText={(text) => setRemark(question.id, text)}
                multiline
                editable={!isReadOnly}
              />
            </View>
          )}

          <ScoreSelector 
            score={score} 
            onChange={(newScore) => setScore(question.id, newScore)} 
            disabled={isReadOnly}
            isBinary={question.text.includes('Scoring: 0 for No, 5 for Yes')}
          />
        </View>
      </View>
    </View>
  );
}
