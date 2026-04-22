import React from 'react';
import { View, Text } from 'react-native';
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
  const setScore = useAuditStore((state) => state.setScore);
  const { isReadOnly } = useScoreCalc();

  return (
    <View className="mb-8 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <View className="p-8">
        <View className="flex-row justify-between items-center mb-6">
          <View className="bg-slate-900 px-4 py-1.5 rounded-full">
            <Text className="text-white text-[9px] font-black uppercase tracking-widest">
              {question.category}
            </Text>
          </View>
          <View className="bg-slate-50 w-8 h-8 rounded-xl items-center justify-center">
            <Text className="text-slate-400 font-black text-[10px]">{String(index + 1).padStart(2, '0')}</Text>
          </View>
        </View>

        <Text className="text-lg text-slate-800 leading-tight font-bold tracking-tight mb-8">
          {question.text}
        </Text>
        
        <View className="pt-8 border-t border-slate-50">
          <View className="flex-row items-center mb-4">
            <View className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-2" />
            <Text className="text-[9px] text-slate-400 font-black tracking-widest uppercase">
              Compliance Score
            </Text>
          </View>
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
