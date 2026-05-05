import { useMemo } from 'react';
import { useAuditStore, SavedAudit } from '../store/auditStore';
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
  const allAudits = useAuditStore(state => state.completedAudits || []);
  const auth = useAuditStore(state => state.auth);
  const currentAuditorId = auth.auditorId;

  const criticalIssues = useMemo(() => {
    const completedAudits = allAudits.filter(a => a && a.headerInfo?.auditorId === currentAuditorId);
    if (!completedAudits || completedAudits.length === 0) return [];

    const latestAuditsByStore: Record<string, SavedAudit> = {};
    
    completedAudits.forEach(audit => {
      const code = audit.headerInfo.storeCode;
      if (!latestAuditsByStore[code] || new Date(audit.completedAt) > new Date(latestAuditsByStore[code].completedAt)) {
        latestAuditsByStore[code] = audit;
      }
    });

    let auditsToAnalyze = Object.values(latestAuditsByStore);
    if (selectedStoreCode !== 'ALL') {
      auditsToAnalyze = auditsToAnalyze.filter(a => a.headerInfo.storeCode === selectedStoreCode);
    }

    const aggregation: Record<string, AggregatedIssue> = {};

    auditsToAnalyze.forEach(audit => {
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
          
          if (new Date(photo.timestamp) > new Date(aggregation[aggId].timestamp)) {
            aggregation[aggId].timestamp = photo.timestamp;
          }
        }
      });
    });

    return Object.values(aggregation).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allAudits, currentAuditorId, selectedStoreCode]);

  return { criticalIssues };
}
