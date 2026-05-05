import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationData, StoreBrand } from '../data/locationData';

export interface PhotoEvidence {
  id: string;
  uri: string;
  title: string;
  remark: string;
  tag: 'positive' | 'negative';
  timestamp: string;
}

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
  photos: PhotoEvidence[];
  finalPercentage: number;
  finalScore: number;
  totalMax: number;
  completedAt: string;
  isDraft: boolean;
  isSynced?: boolean;
  cloudFileUrl?: string;
}

interface AuditStore {
  // User Profile
  auth: {
    auditorName: string;
    auditorId: string;
  };
  
  // Current Draft / Active Session
  activeAuditId: string | null;
  headerInfo: HeaderInfo;
  scores: Record<string, number>;
  photos: PhotoEvidence[];
  
  // History & Custom Data
  completedAudits: SavedAudit[];
  customStores: { name: string, code: string, brand: StoreBrand }[];
  isReadOnly: boolean;
  
  // Actions
  updateAuth: (name: string, id: string) => void;
  setHeaderField: (field: keyof HeaderInfo, value: string | boolean) => void;
  setScore: (questionId: string, score: number) => void;
  addPhoto: (photo: PhotoEvidence) => void;
  updatePhoto: (photoId: string, updatedData: Partial<PhotoEvidence>) => void;
  removePhoto: (photoId: string) => void;
  startNewAudit: () => void;
  loadAudit: (audit: SavedAudit) => void;
  setReadOnly: (val: boolean) => void;
  submitAudit: (stats: { percentage: number, earned: number, total: number }) => void;
  markAsSynced: (auditId: string, cloudFileUrl?: string) => void;
  deleteAudit: (auditId: string) => void;
  resetAudit: () => void;
  
  // Custom Store Management
  addCustomStore: (store: { name: string, code: string, brand: StoreBrand }) => void;
  deleteCustomStore: (code: string) => void;
  updateStore: (code: string, updatedStore: { name: string, code: string, brand: StoreBrand }) => void;
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
      auth: {
        auditorName: '',
        auditorId: '',
      },
      activeAuditId: null,
      headerInfo: DEFAULT_HEADER,
      scores: {},
      photos: [],
      completedAudits: [],
      customStores: [],
      isReadOnly: false,
      
      updateAuth: (name, id) => {
        set((state) => ({
          auth: { auditorName: name, auditorId: id },
          headerInfo: { ...state.headerInfo, auditorName: name, auditorId: id }
        }));
      },

      setHeaderField: (field, value) => {
        if (get().isReadOnly) return;
        set((state) => ({ 
          headerInfo: { ...state.headerInfo, [field]: value },
          activeAuditId: state.activeAuditId || Date.now().toString()
        }));
      },
        
      setScore: (questionId, score) => {
        if (get().isReadOnly) return;
        set((state) => ({
          scores: { ...state.scores, [questionId]: score },
          activeAuditId: state.activeAuditId || Date.now().toString()
        }));
      },
        
      addPhoto: (photo) => {
        if (get().isReadOnly) return;
        set((state) => ({
          photos: [...state.photos, photo],
          activeAuditId: state.activeAuditId || Date.now().toString()
        }));
      },

      updatePhoto: (photoId, updatedData) => {
        if (get().isReadOnly) return;
        set((state) => ({
          photos: state.photos.map(p => p.id === photoId ? { ...p, ...updatedData } : p)
        }));
      },
        
      removePhoto: (photoId) => {
        if (get().isReadOnly) return;
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== photoId)
        }));
      },

      startNewAudit: () => {
        const { auditorName, auditorId } = get().auth;
        set({
          activeAuditId: Date.now().toString(),
          headerInfo: { 
            ...DEFAULT_HEADER, 
            date: new Date().toISOString().split('T')[0],
            auditorName,
            auditorId
          },
          scores: {},
          photos: [],
          isReadOnly: false
        });
      },

      loadAudit: (audit) => 
        set({
          activeAuditId: audit.id,
          headerInfo: audit.headerInfo,
          scores: audit.scores,
          photos: audit.photos
        }),

      setReadOnly: (val) => set({ isReadOnly: val }),

      submitAudit: (stats) => {
        const state = get();
        const auditId = state.activeAuditId || Date.now().toString();
        
        const newAudit: SavedAudit = {
          id: auditId,
          headerInfo: state.headerInfo,
          scores: state.scores,
          photos: state.photos,
          finalPercentage: stats.percentage,
          finalScore: stats.earned,
          totalMax: stats.total,
          completedAt: new Date().toISOString(),
          isDraft: false,
          isSynced: false
        };

        set((state) => {
          const index = state.completedAudits.findIndex(a => a.id === auditId);
          let newCompleted = [...state.completedAudits];
          
          if (index !== -1) {
            newCompleted[index] = newAudit;
          } else {
            newCompleted = [newAudit, ...newCompleted];
          }

          const { auditorName, auditorId } = state.auth;
          return {
            completedAudits: newCompleted,
            activeAuditId: null,
            headerInfo: { ...DEFAULT_HEADER, auditorName, auditorId },
            scores: {},
            photos: []
          };
        });
      },

      markAsSynced: (auditId, cloudFileUrl) => {
        set((state) => ({
          completedAudits: state.completedAudits.map(a => 
            a.id === auditId ? { ...a, isSynced: true, cloudFileUrl } : a
          )
        }));
      },

      deleteAudit: (auditId) => {
        set((state) => ({
          completedAudits: state.completedAudits.filter(a => a.id !== auditId)
        }));
      },
        
      resetAudit: () => {
        const { auditorName, auditorId } = get().auth;
        set({
          activeAuditId: null,
          headerInfo: { 
            ...DEFAULT_HEADER, 
            date: new Date().toISOString().split('T')[0],
            auditorName,
            auditorId
          },
          scores: {},
          photos: [],
        });
      },

      addCustomStore: (store) => {
        set((state) => {
          const exists = state.customStores.find(s => s.code === store.code);
          if (exists) return state;
          return {
            customStores: [...state.customStores, store]
          };
        });
      },

      deleteCustomStore: (code) => {
        set((state) => ({
          customStores: state.customStores.filter(s => s.code !== code)
        }));
      },

      updateStore: (code, updatedStore) => {
        set((state) => ({
          customStores: state.customStores.map(s => s.code === code ? updatedStore : s)
        }));
      }
    }),
    {
      name: 'essilor-audit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
