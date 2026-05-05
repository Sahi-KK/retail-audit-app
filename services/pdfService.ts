import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface AuditReportData {
  id: string;
  header: {
    store: string;
    storeCode: string;
    storeBrand: string;
    auditorName: string;
    date: string;
  };
  percentage: number;
  earned: number;
  total: number;
  categoryBreakdown: { [key: string]: number };
  details: { [key: string]: number };
}

export const pdfService = {
  generateAuditPdf: async (data: AuditReportData): Promise<string> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { color: #C9A84C; font-size: 10px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; }
            .title { font-size: 24px; font-weight: 800; margin-top: 5px; }
            
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .meta-item { border-left: 2px solid #f1f5f9; padding-left: 15px; }
            .label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
            .value { font-size: 14px; font-weight: 600; margin-top: 2px; }

            .score-container { background: #0f172a; border-radius: 20px; padding: 30px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
            .score-label { font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }
            .score-value { font-size: 48px; font-weight: 800; color: #C9A84C; }
            .score-detail { font-size: 14px; color: rgba(255,255,255,0.6); }

            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 2px; margin-bottom: 20px; }
            .category-card { background: #f8fafc; border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
            .cat-name { font-weight: 600; font-size: 14px; }
            .cat-score { color: #0f172a; font-weight: 700; }
            
            .footer { margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; }
            .footer-text { font-size: 8px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">EssilorLuxottica Strategic Asset</div>
            <div class="title">Operational Diagnostic Report</div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="label">Location Name</div>
              <div class="value">${data.header.store}</div>
            </div>
            <div class="meta-item">
              <div class="label">Store Code</div>
              <div class="value">${data.header.storeCode}</div>
            </div>
            <div class="meta-item">
              <div class="label">Field Auditor</div>
              <div class="value">${data.header.auditorName}</div>
            </div>
            <div class="meta-item">
              <div class="label">Assessment Date</div>
              <div class="value">${data.header.date}</div>
            </div>
          </div>

          <div class="score-container">
            <div style="flex: 1">
              <div class="score-label">Efficiency Performance Index</div>
              <div class="score-detail">Aggregated category scores and visual compliance metrics</div>
            </div>
            <div style="text-align: right">
              <div class="score-value">${data.percentage}%</div>
              <div class="score-detail">${data.earned} / ${data.total} Pts</div>
            </div>
          </div>

          <div class="section-title">Categorical Performance</div>
          ${Object.entries(data.categoryBreakdown).map(([cat, score]) => `
            <div class="category-card">
              <div class="cat-name">${cat.toUpperCase()}</div>
              <div class="cat-score">${score}%</div>
            </div>
          `).join('')}

          <div class="footer">
            <div class="footer-text">© 2026 ESSILORLUXOTTICA RETAIL AUDIT HUB • GHOST SHIELD ARCHIVER</div>
          </div>
        </body>
      </html>
    `;

    if (Platform.OS === 'web') {
      return html;
    }

    try {
      // 1. Generate PDF file
      const { uri } = await Print.printToFileAsync({ html });
      
      // 2. Read as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      return base64;
    } catch (error) {
      console.error("PDF Generation Error:", error);
      throw error;
    }
  }
};
