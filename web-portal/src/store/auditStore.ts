import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PhotoEvidence {
  id: string;
  uri: string;
  title: string;
  remark: string;
  timestamp: string;
  tag: 'positive' | 'negative';
}

export interface Terminology {
  id: string;
  word: string;
  definition: string;
  imageUri?: string;
}

export type StoreBrand = 'Sunglass Hut' | 'LensCrafters';

export interface HeaderInfo {
  store: string;
  storeCode: string;
  storeBrand: StoreBrand;
  state: string;
  city: string;
  isCustomStore: boolean;
  date: string;
  auditorName: string;
  auditorId: string;
}

export interface SavedAudit {
  id: string;
  headerInfo: HeaderInfo;
  scores: Record<string, number>;
  remarks: Record<string, string>;
  photos: PhotoEvidence[];
  finalPercentage: number;
  finalScore: number;
  totalMax: number;
  completedAt: string;
  isDraft: boolean;
  isSynced?: boolean;
  cloudFileId?: string;
  vaultLink?: string;
}

interface AuditStore {
  auth: { auditorName: string; auditorId: string };
  activeAuditId: string | null;
  headerInfo: HeaderInfo;
  scores: Record<string, number>;
  remarks: Record<string, string>;
  photos: PhotoEvidence[];
  completedAudits: SavedAudit[];
  cloudAudits: any[];
  customStores: { name: string, code: string, brand: StoreBrand, city: string }[];
  terminology: Terminology[];
  
  updateAuth: (name: string, id: string) => void;
  setHeaderField: (field: keyof HeaderInfo, value: string | boolean) => void;
  setScore: (questionId: string, score: number) => void;
  setRemark: (questionId: string, remark: string) => void;
  addPhoto: (photo: PhotoEvidence) => void;
  updatePhoto: (id: string, updates: Partial<PhotoEvidence>) => void;
  removePhoto: (photoId: string) => void;
  submitAudit: (stats: { percentage: number, earned: number, total: number }) => Promise<void>;
  resetAudit: () => void;
  startNewAudit: () => void;
  loadAudit: (audit: SavedAudit) => void;
  markAsSynced: (auditId: string, cloudFileId: string, vaultLink?: string) => void;
  addCustomStore: (store: { name: string, code: string, brand: StoreBrand, city: string }) => void;
  deleteCustomStore: (code: string) => void;
  updateStore: (code: string, updates: Partial<{ name: string, code: string, brand: StoreBrand, city: string }>) => void;
  syncFromCloud: () => Promise<void>;
  addTerm: (term: Terminology) => void;
  deleteTerm: (id: string) => void;
  logout: () => void;
}

const CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycbwJovoCFrraGJbDtJL-xrB7KtsizsBWs1lRXqxkwBqx1mcXxRXpoo5yh6ztb4hllyt7/exec";

const DEFAULT_HEADER: HeaderInfo = {
  store: '',
  storeCode: '',
  storeBrand: 'Sunglass Hut',
  state: 'Karnataka',
  city: 'Bengaluru',
  isCustomStore: false,
  date: new Date().toISOString().split('T')[0],
  auditorName: '',
  auditorId: '',
};

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      auth: { auditorName: '', auditorId: '' },
      activeAuditId: null,
      headerInfo: DEFAULT_HEADER,
      scores: {},
      remarks: {},
      photos: [],
      completedAudits: [],
      cloudAudits: [],
      customStores: [],
      terminology: [
        { id: '1', word: 'Planogram', definition: 'The corporate visual map for store layout and product placement. All stores must strictly follow the current issue.' },
        { id: '2', word: 'NPI (New Product Introduction)', definition: 'High-priority launch models placed in prime eye-level zones to drive traffic and curiosity.' },
        { id: '3', word: 'Acrylic Glorifier', definition: 'Premium lit display stands used to highlight key equity frames and campaign collections.' },
        { id: '4', word: 'Celebration Table', definition: 'The primary front-of-store display featuring the current marketing campaign and alternative articles.' },
        { id: '5', word: 'Tone of Voice', definition: 'The specific corporate language and brand messaging required during customer interaction to ensure premium status.' },
        { id: '6', word: 'Ray-Ban Meta AI', definition: 'The smart eyewear collection featuring AI assistance, hands-free media capture, and live translation.' },
        { id: '7', word: 'Clinical Pre-Test', definition: 'The initial patient diagnostic phase using sanitized equipment to ensure health standards and comfort.' },
        { id: '8', word: 'Price Anchoring', definition: 'A sales technique where staff initiate conversations with the most premium option first to set a quality standard.' },
        { id: '9', word: 'F.A.B.', definition: 'Features, Advantages, Benefits. The structured articulation used by associates to explain specific product value.' },
        { id: '10', word: 'Omnichannel', definition: 'The integration of physical store presence with digital tools like iPads for Ship-to-Home orders.' }
      ],

      updateAuth: (name, id) => set({ auth: { auditorName: name, auditorId: id } }),
      
      setHeaderField: (field, value) => set((state) => ({
        headerInfo: { ...state.headerInfo, [field]: value }
      })),

      setScore: (id, score) => set((state) => ({
        scores: { ...state.scores, [id]: score }
      })),

      setRemark: (id, remark) => set((state) => ({
        remarks: { ...state.remarks, [id]: remark }
      })),

      addPhoto: (photo) => set((state) => ({
        photos: [...state.photos, photo]
      })),

      updatePhoto: (id, updates) => set((state) => ({
        photos: state.photos.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      removePhoto: (photoId) => set((state) => ({
        photos: state.photos.filter(p => p.id !== photoId)
      })),

      startNewAudit: () => set((state) => ({
        activeAuditId: Date.now().toString(),
        scores: {},
        remarks: {},
        photos: [],
        headerInfo: { ...DEFAULT_HEADER, ...state.auth }
      })),

      loadAudit: (audit) => set({
        activeAuditId: audit.id,
        headerInfo: audit.headerInfo,
        scores: audit.scores,
        remarks: audit.remarks || {},
        photos: audit.photos
      }),

      submitAudit: async (stats) => {
        const state = get();
        
        const { customStores } = get();
        const currentStore = (customStores || []).find((s: any) => s.code.toLowerCase() === state.headerInfo.storeCode.toLowerCase());
        const resolvedCity = state.headerInfo.city || currentStore?.city || 'Bengaluru';

        const newAudit: SavedAudit = {
          id: state.activeAuditId || Date.now().toString(),
          headerInfo: { ...state.headerInfo, city: resolvedCity },
          scores: state.scores,
          remarks: state.remarks,
          photos: state.photos,
          finalPercentage: stats.percentage,
          finalScore: stats.earned,
          totalMax: stats.total,
          completedAt: new Date().toISOString(),
          isDraft: false,
          isSynced: false
        };

        set({
          completedAudits: [newAudit, ...state.completedAudits],
          activeAuditId: null,
          scores: {},
          remarks: {},
          photos: []
        });

        // Master Hub Sync (Enterprise v3.0)
        try {
          const payload = {
            auditData: {
              ...newAudit,
              header: newAudit.headerInfo,
              percentage: newAudit.finalPercentage,
              earned: newAudit.finalScore,
              total: newAudit.totalMax,
              timestamp: newAudit.completedAt
            }
          };

          const response = await fetch(CLOUD_SYNC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              get().markAsSynced?.(newAudit.id, data.fileId, data.vaultLink);
            }
          }
        } catch (e) {
          console.warn('[MASTER HUB] Sync failed, audit cached locally');
        }
      },

      resetAudit: () => set({ scores: {}, remarks: {}, photos: [], activeAuditId: null }),

      markAsSynced: (auditId, cloudFileId, vaultLink) => set((state) => ({
        completedAudits: state.completedAudits.map(a => 
          a.id === auditId ? { ...a, isSynced: true, cloudFileId, vaultLink } : a
        )
      })),

      addCustomStore: (store) => set((state) => ({
        customStores: [store, ...(state.customStores || [])]
      })),

      deleteCustomStore: (code) => set((state) => ({
        customStores: state.customStores.filter(s => s.code !== code)
      })),

      updateStore: (code, updates) => set((state) => ({
        customStores: state.customStores.map(s => s.code === code ? { ...s, ...updates } : s)
      })),

      syncFromCloud: async () => {
        const state = get();
        if (!state.auth.auditorId) return;

        try {
          const response = await fetch(`${CLOUD_SYNC_URL}?action=getHistory&auditorId=${state.auth.auditorId}`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              set({ cloudAudits: data });
            }
          }
        } catch (e) {
          console.warn('[MASTER HUB] History retrieval failed');
        }
      },

      addTerm: (term) => set((state) => ({
        terminology: [term, ...state.terminology]
      })),

      deleteTerm: (id) => set((state) => ({
        terminology: state.terminology.filter(t => t.id !== id)
      })),

      logout: () => set({ auth: { auditorName: '', auditorId: '' } })
    }),
    {
      name: 'essilor-web-audit-storage-v5',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
