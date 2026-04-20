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
      return { status: 'error', message: 'Cloud Sync URL not configured.' };
    }

    // GHOST SHIELD: Retry logic for flaky connections
    let attempts = 0;
    while (attempts < 2) {
      try {
        const response = await fetch(CLOUD_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(auditData),
        });

        const responseText = await response.text();
        if (response.ok) {
           return JSON.parse(responseText);
        }
        attempts++;
      } catch (error) {
        attempts++;
        if (attempts === 2) {
           const msg = error instanceof Error ? error.message : 'Unknown Hub Error';
           return { status: 'error', message: `MASTER HUB UNREACHABLE: ${msg}` };
        }
      }
    }
    return { status: 'error', message: 'Master Hub Connection Timed Out' };
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
