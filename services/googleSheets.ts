import { Alert } from 'react-native';
// REPLACE THIS with your deployed Google Apps Script URL
const CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycbxvuGteIcBY7Ah56xzsizMtnr0spRpfDO9YtMKosawJC4YAwTOQQ-HZEZbGpz6dBAXr/exec";

export interface SyncResult {
  status: 'success' | 'error';
  message?: string;
  fileId?: string;
}

export const googleSheetsService = {
  syncAudit: async (auditData: any): Promise<SyncResult> => {
    if (!CLOUD_SYNC_URL) {
      console.warn("Cloud Sync URL not configured.");
      return { status: 'error', message: 'Cloud Sync URL is not configured in services/googleSheets.ts' };
    }

    try {
      const response = await fetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(auditData),
      });

      const responseText = await response.text();

      if (!response.ok && response.status !== 0) {
        return { status: 'error', message: `HTTP ${response.status}: ${responseText.substring(0, 100)}` };
      }

      try {
        const result = JSON.parse(responseText);
        return result;
      } catch (e) {
        return { status: 'error', message: `Invalid JSON: ${responseText.substring(0, 100)}` };
      }
    } catch (error) {
      console.error("Cloud Sync Failed:", error);
      const msg = error instanceof Error ? error.message : 'Unknown network error';
      Alert.alert("🚨 CLOUD SYNC ERROR", msg);
      return { status: 'error', message: msg };
    }
  },

  fetchHistory: async (auditorId: string): Promise<any[]> => {
    try {
      const response = await fetch(`${CLOUD_SYNC_URL}?action=getHistory&auditorId=${auditorId}`, {
        method: 'GET',
      });
      const result = await response.json();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Fetch History Failed:", error);
      return [];
    }
  }
};
