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
  remarks: Record<string, string>; // Legacy support
  photos: PhotoEvidence[];
  finalPercentage: number;
  finalScore: number;
  totalMax: number;
  completedAt: string;
  isDraft: boolean;
  isSynced?: boolean;
}

interface AuditStore {
  auth: { auditorName: string; auditorId: string };
  activeAuditId: string | null;
  headerInfo: HeaderInfo;
  scores: Record<string, number>;
  photos: PhotoEvidence[];
  completedAudits: SavedAudit[];
  cloudAudits: any[];
  customStores: { name: string, code: string, brand: StoreBrand }[];
  
  updateAuth: (name: string, id: string) => void;
  setHeaderField: (field: keyof HeaderInfo, value: string | boolean) => void;
  setScore: (questionId: string, score: number) => void;
  addPhoto: (photo: PhotoEvidence) => void;
  updatePhoto: (id: string, updates: Partial<PhotoEvidence>) => void;
  removePhoto: (photoId: string) => void;
  submitAudit: (stats: { percentage: number, earned: number, total: number }) => Promise<void>;
  resetAudit: () => void;
  startNewAudit: () => void;
  markAsSynced: (auditId: string, cloudFileId: string) => void;
  addCustomStore: (store: { name: string, code: string, brand: StoreBrand }) => void;
  deleteCustomStore: (code: string) => void;
  updateStore: (code: string, updates: Partial<{ name: string, code: string, brand: StoreBrand }>) => void;
  syncFromCloud: () => Promise<void>;
  logout: () => void;
}

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
      photos: [],
      completedAudits: [],
      cloudAudits: [],
      customStores: [],

      updateAuth: (name, id) => set({ auth: { auditorName: name, auditorId: id } }),
      
      setHeaderField: (field, value) => set((state) => ({
        headerInfo: { ...state.headerInfo, [field]: value }
      })),

      setScore: (id, score) => set((state) => ({
        scores: { ...state.scores, [id]: score }
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
        photos: [],
        headerInfo: { ...DEFAULT_HEADER, ...state.auth }
      })),

      submitAudit: async (stats) => {
        const state = get();
        const CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycbypy7sK63OxQWqR9RzvZ3xMw47pJukssnIdPlRXad0-3o6wblJ5T7lLv19DCpAeKOuL/exec";
        
        const newAudit: SavedAudit = {
          id: state.activeAuditId || Date.now().toString(),
          headerInfo: state.headerInfo,
          scores: state.scores,
          remarks: {}, // Legacy
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
          photos: []
        });

        // Master Hub Sync (Google Apps Script)
        try {
          const response = await fetch(CLOUD_SYNC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ auditData: newAudit })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              get().markAsSynced?.(newAudit.id, data.fileId);
            }
          }
        } catch (e) {
          console.warn('[MASTER HUB] Sync failed, audit cached locally');
        }
      },

      resetAudit: () => set({ scores: {}, photos: [], activeAuditId: null }),

      markAsSynced: (auditId, cloudFileId) => set((state) => ({
        completedAudits: state.completedAudits.map(a => 
          a.id === auditId ? { ...a, isSynced: true, cloudFileId } : a
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
        const CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycbypy7sK63OxQWqR9RzvZ3xMw47pJukssnIdPlRXad0-3o6wblJ5T7lLv19DCpAeKOuL/exec";
        
        if (!state.auth.auditorId) return;

        try {
          const response = await fetch(`${CLOUD_SYNC_URL}?action=getHistory&auditorId=${state.auth.auditorId}`);
          if (response.ok) {
            const rawText = await response.text();
            
            // Clean JSON discovery
            const jsonStart = rawText.indexOf('[');
            if (jsonStart !== -1) {
              const cleanJson = rawText.substring(jsonStart);
              const data = JSON.parse(cleanJson);
              if (Array.isArray(data)) {
                set({ cloudAudits: data });
              }
            }
          }
        } catch (e) {
          console.warn('[MASTER HUB] History retrieval failed');
        }
      },

      logout: () => set({ auth: { auditorName: '', auditorId: '' } })
    }),
    {
      name: 'essilor-web-audit-storage-v4',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
