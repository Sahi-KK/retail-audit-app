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
    <View className="mb-12 bg-white rounded-[48px] shadow-sm overflow-hidden">
      <View className="p-10">
        <View className="flex-row items-start mb-8">
          <View className="bg-slate-50 w-10 h-10 rounded-2xl items-center justify-center mr-5">
            <Text className="text-slate-400 font-bold text-xs">{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <Text className="flex-1 text-xl text-slate-800 leading-snug font-semibold tracking-tight">
            {question.text}
          </Text>
        </View>
        
        <View className="mt-6 pt-10 border-t border-slate-50">
          <Text className="text-[10px] text-slate-400 font-medium tracking-[3px] uppercase ml-1 mb-4">
            Clinical Compliance Assessment
          </Text>
          <ScoreSelector 
            score={score} 
            onChange={(newScore) => setScore(question.id, newScore)} 
            disabled={isReadOnly}
          />
        </View>
      </View>
    </View>
  );
}
