import { useMemo } from 'react';
import { useAuditStore, SavedAudit } from '../store/auditStore';
import { auditQuestions, AuditCategory } from '../data/auditQuestions';
import { locationData } from '../data/locationData';

export function useScoreCalc() {
  const scores = useAuditStore((state) => state.scores || {});
  const storeBrand = useAuditStore((state) => state.headerInfo?.storeBrand || 'Sunglass Hut');
  const isReadOnly = useAuditStore((state) => state.isReadOnly);
  const completedAudits = useAuditStore((state) => state.completedAudits || []);
  const customStores = useAuditStore((state) => state.customStores || []);

  const currentStats = useMemo(() => {
    // Determine which questions are relevant for the current brand
    const relevantQuestions = auditQuestions.filter(q => 
      q.category !== 'clinical' || storeBrand === 'LensCrafters'
    );

    let totalMaxScore = 0;
    let earnedScore = 0;
    
    const categoryScores: Record<AuditCategory, { earned: number, max: number }> = {
      cleanliness: { earned: 0, max: 0 },
      merchandising: { earned: 0, max: 0 },
      operations: { earned: 0, max: 0 },
      staff: { earned: 0, max: 0 },
      clinical: { earned: 0, max: 0 },
      rayban_meta: { earned: 0, max: 0 },
    };

    relevantQuestions.forEach((q) => {
      const qScore = scores[q.id] || 0;
      earnedScore += qScore;
      categoryScores[q.category].earned += qScore;
      categoryScores[q.category].max += q.maxScore || 5;
      totalMaxScore += q.maxScore || 5;
    });

    const percentage = totalMaxScore === 0 ? 0 : Math.round((earnedScore / totalMaxScore) * 100);

    return { earnedScore, totalMaxScore, percentage, categoryScores };
  }, [scores, storeBrand]);

  const calculateCategoryStats = (audits: SavedAudit[]) => {
    const categories: AuditCategory[] = ['cleanliness', 'merchandising', 'operations', 'staff', 'clinical', 'rayban_meta'];
    const results = categories.map(cat => {
      let earned = 0;
      let max = 0;
      
      (audits || []).forEach(audit => {
        // Only include clinical if the specific audit was for a LensCrafters store
        if (cat === 'clinical' && audit?.headerInfo?.storeBrand !== 'LensCrafters') return;

        auditQuestions.filter(q => q.category === cat).forEach(q => {
          earned += audit.scores?.[q.id] || 0;
          max += q.maxScore || 5;
        });
      });

      return {
        category: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        percentage: max === 0 ? 0 : Math.round((earned / max) * 100)
      };
    });
    return results;
  };

  const fleetCategoryStats = useMemo(() => calculateCategoryStats(completedAudits), [completedAudits]);

  const fleetStats = useMemo(() => {
    if (!completedAudits || completedAudits.length === 0) return { avgScore: 0, totalAudits: 0 };
    const totalPercentage = completedAudits.reduce((acc, curr) => acc + (curr.finalPercentage || 0), 0);
    return {
      avgScore: Math.round(totalPercentage / completedAudits.length),
      totalAudits: completedAudits.length,
    };
  }, [completedAudits]);

  const getStoreStats = (storeCode: string) => {
    const storeAudits = completedAudits.filter(a => a.headerInfo?.storeCode === storeCode);
    const avgScore = storeAudits.length > 0 
      ? Math.round(storeAudits.reduce((acc, curr) => acc + (curr.finalPercentage || 0), 0) / storeAudits.length)
      : null;
    
    const negativeEvidence = storeAudits.flatMap(a => 
      (a.photos || []).filter(p => p.tag === 'negative')
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const categoryStats = calculateCategoryStats(storeAudits);

    return {
      avgScore,
      auditCount: storeAudits.length,
      lastAuditDate: storeAudits.length > 0 ? storeAudits[0].completedAt : null,
      negativeEvidence,
      categoryStats,
      history: storeAudits
    };
  };

  const getRankedStores = () => {
    const defaultStores = locationData["Karnataka"]?.["Bengaluru"] || [];
    const allLocations = [
      ...(customStores || []),
      ...defaultStores.filter(s => s && s.code !== 'CUSTOM')
    ];
    
    const storePerformance = allLocations.map(s => {
      const stats = getStoreStats(s.code);
      return { ...s, ...stats };
    });

    const ranked = [...storePerformance]
      .filter(s => s.avgScore !== null)
      .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

    return {
      topPerformers: ranked.slice(0, 2),
      actionRequired: [...ranked].reverse().slice(0, 2),
      allStores: storePerformance
    };
  };

  const getChartData = () => {
    const defaultStores = locationData["Karnataka"]?.["Bengaluru"] || [];
    const allLocations = [
      ...(customStores || []),
      ...defaultStores.filter(s => s && s.code !== 'CUSTOM')
    ];
    
    const labels = allLocations.map(s => {
      if (!s || !s.code) return 'N/A';
      const parts = s.code.split('/');
      return parts.length > 1 ? parts[1].trim() : s.code.substring(0, 4);
    });
    const data = allLocations.map(s => {
      if (!s || !s.code) return 0;
      return Math.round(getStoreStats(s.code).avgScore || 0);
    });
    
    return {
      labels,
      datasets: [{ data }]
    };
  };

  return {
    earnedScore: currentStats.earnedScore,
    totalMaxScore: currentStats.totalMaxScore,
    percentage: currentStats.percentage,
    categoryScores: currentStats.categoryScores,
    isReadOnly,
    fleetStats,
    fleetCategoryStats,
    getStoreStats,
    getRankedStores,
    getChartData
  };
}
