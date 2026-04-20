import React from 'react';
import { ScrollView, View } from 'react-native';
import { QuestionCard } from '../../components/QuestionCard';
import { auditQuestions } from '../../data/auditQuestions';

export default function MerchandisingScreen() {
  const questions = auditQuestions.filter(q => q.category === 'merchandising');

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
