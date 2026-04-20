import { useMemo } from 'react';
import { useAuditStore, SavedAudit, PhotoEvidence } from '../store/auditStore';
import { auditQuestions } from '../data/auditQuestions';

export interface AggregatedIssue {
  id: string;
  storeName: string;
  storeCode: string;
  category: string;
  count: number;
  timestamp: string;
}

export function useCriticalIssues(selectedStoreCode: string = 'ALL') {
  const { completedAudits } = useAuditStore();

  const criticalIssues = useMemo(() => {
    if (!completedAudits || completedAudits.length === 0) return [];

    // 1. Group by Store and find the LATEST audit for each store
    const latestAuditsByStore: Record<string, SavedAudit> = {};
    
    completedAudits.forEach(audit => {
      const code = audit.headerInfo.storeCode;
      if (!latestAuditsByStore[code] || new Date(audit.completedAt) > new Date(latestAuditsByStore[code].completedAt)) {
        latestAuditsByStore[code] = audit;
      }
    });

    // 2. Filter by selected store if not 'ALL'
    let auditsToAnalyze = Object.values(latestAuditsByStore);
    if (selectedStoreCode !== 'ALL') {
      auditsToAnalyze = auditsToAnalyze.filter(a => a.headerInfo.storeCode === selectedStoreCode);
    }

    // 3. Aggregate issues by category
    const aggregation: Record<string, AggregatedIssue> = {};

    auditsToAnalyze.forEach(audit => {
      // Check Scores
      Object.entries(audit.scores).forEach(([qId, score]) => {
        if (score <= 2) {
          const question = auditQuestions.find(q => q.id === qId);
          const category = (question?.category || 'General').toLowerCase();
          const aggId = `${audit.headerInfo.storeCode}-${category}`;

          if (!aggregation[aggId]) {
            aggregation[aggId] = {
              id: aggId,
              storeName: audit.headerInfo.store,
              storeCode: audit.headerInfo.storeCode,
              category: category,
              count: 0,
              timestamp: audit.completedAt
            };
          }
          aggregation[aggId].count += 1;
        }
      });

      // Check Negative Photos
      audit.photos.forEach(photo => {
        if (photo.tag === 'negative') {
          const category = 'photo evidence';
          const aggId = `${audit.headerInfo.storeCode}-${category}`;

          if (!aggregation[aggId]) {
            aggregation[aggId] = {
              id: aggId,
              storeName: audit.headerInfo.store,
              storeCode: audit.headerInfo.storeCode,
              category: category,
              count: 0,
              timestamp: photo.timestamp
            };
          }
          aggregation[aggId].count += 1;
          
          // Update timestamp if photo is more recent than existing agg record
          if (new Date(photo.timestamp) > new Date(aggregation[aggId].timestamp)) {
            aggregation[aggId].timestamp = photo.timestamp;
          }
        }
      });
    });

    // Convert back to array and sort by timestamp (newest first)
    return Object.values(aggregation).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [completedAudits, selectedStoreCode]);

  return { criticalIssues };
}
