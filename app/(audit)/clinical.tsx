import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuditStore } from '../../store/auditStore';
import { QuestionCard } from '../../components/QuestionCard';
import { auditQuestions } from '../../data/auditQuestions';

export default function ClinicalScreen() {
  const router = useRouter();
  const storeBrand = useAuditStore((state) => state.headerInfo?.storeBrand || 'Sunglass Hut');
  const isLensCrafters = storeBrand === 'LensCrafters';

  React.useEffect(() => {
    if (!isLensCrafters) {
      router.replace('/cleanliness' as any);
    }
  }, [isLensCrafters]);

  if (!isLensCrafters) return null;

  const questions = auditQuestions.filter(q => q.category === 'clinical');

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 px-6 pt-8" 
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {questions.map((q, index) => (
        <QuestionCard key={q.id} question={q} index={index} />
      ))}
    </ScrollView>
  );
}
