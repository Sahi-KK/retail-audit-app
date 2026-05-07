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

export interface Terminology {
  id: string;
  word: string;
  definition: string;
  imageUri?: string;
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
  remarks: Record<string, string>;
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
  remarks: Record<string, string>;
  photos: PhotoEvidence[];
  
  // History & Custom Data
  completedAudits: SavedAudit[];
  customStores: { name: string, code: string, brand: StoreBrand }[];
  terminology: Terminology[];
  isReadOnly: boolean;
  
  // Actions
  updateAuth: (name: string, id: string) => void;
  setHeaderField: (field: keyof HeaderInfo, value: string | boolean) => void;
  setScore: (questionId: string, score: number) => void;
  setRemark: (questionId: string, remark: string) => void;
  addPhoto: (photo: PhotoEvidence) => void;
  updatePhoto: (photoId: string, updatedData: Partial<PhotoEvidence>) => void;
  removePhoto: (photoId: string) => void;
  startNewAudit: () => void;
  loadAudit: (audit: SavedAudit) => void;
  setReadOnly: (val: boolean) => void;
  submitAudit: (stats: { percentage: number, earned: number, total: number }) => void;
  saveDraft: (stats: { percentage: number, earned: number, total: number }) => void;
  markAsSynced: (auditId: string, cloudFileUrl?: string) => void;
  deleteAudit: (auditId: string) => void;
  resetAudit: () => void;
  
  // Custom Store Management
  addCustomStore: (store: { name: string, code: string, brand: StoreBrand }) => void;
  deleteCustomStore: (code: string) => void;
  updateStore: (code: string, updatedStore: { name: string, code: string, brand: StoreBrand }) => void;
  
  // Terminology Management
  addTerm: (term: Terminology) => void;
  deleteTerm: (id: string) => void;
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
      remarks: {},
      photos: [],
      completedAudits: [],
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

      setRemark: (questionId, remark) => {
        if (get().isReadOnly) return;
        set((state) => ({
          remarks: { ...state.remarks, [questionId]: remark },
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
          remarks: {},
          photos: [],
          isReadOnly: false
        });
      },

      loadAudit: (audit) => 
        set({
          activeAuditId: audit.id,
          headerInfo: audit.headerInfo,
          scores: audit.scores,
          remarks: audit.remarks || {},
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
          remarks: state.remarks,
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
            remarks: {},
            photos: []
          };
        });
      },

      saveDraft: (stats) => {
        const state = get();
        const auditId = state.activeAuditId || Date.now().toString();
        
        const draftAudit: SavedAudit = {
          id: auditId,
          headerInfo: state.headerInfo,
          scores: state.scores,
          remarks: state.remarks,
          photos: state.photos,
          finalPercentage: stats.percentage,
          finalScore: stats.earned,
          totalMax: stats.total,
          completedAt: new Date().toISOString(),
          isDraft: true,
          isSynced: false
        };

        set((state) => {
          const index = state.completedAudits.findIndex(a => a.id === auditId);
          let newCompleted = [...state.completedAudits];
          if (index !== -1) {
            newCompleted[index] = draftAudit;
          } else {
            newCompleted = [draftAudit, ...newCompleted];
          }
          return { completedAudits: newCompleted };
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
          remarks: {},
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
      },

      addTerm: (term) => {
        set((state) => ({
          terminology: [term, ...state.terminology]
        }));
      },

      deleteTerm: (id) => {
        set((state) => ({
          terminology: state.terminology.filter(t => t.id !== id)
        }));
      }
    }),
    {
      name: 'essilor-audit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
