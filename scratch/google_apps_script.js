/** 
 * ESSILOR LUXOTTICA - AUDIT MASTER HUB v2.5 (COMPLETE GHOST SHIELD)
 * Deployment: Deploy as Web App -> Execute as "Me" -> Access "Anyone"
 */

const MASTER_FILE_NAME = "RETAIL_AUDIT_MASTER_DATABASE";
const PDF_FOLDER_NAME = "AUDIT_REPORT_PDFS";

// RUN ONCE TO AUTHORIZE
function authorize() {
  DriveApp.getRootFolder();
}

function doGet(e) {
  const action = e.parameter.action;
  const auditorId = (e.parameter.auditorId || "").trim();
  const auditId = (e.parameter.auditId || "").trim();

  if (action === "getHistory") {
    return getAuditorHistory(auditorId);
  }

  if (action === "getAuditDetail") {
    return getAuditDetail(auditId);
  }

  return ContentService.createTextOutput("🛡️ MASTER HUB ACTIVE | TARGET ID: " + (auditorId || auditId))
    .setMimeType(ContentService.MimeType.TEXT);
}

function getAuditDetail(auditId) {
  try {
    const file = getFileByName(MASTER_FILE_NAME, "spreadsheet");
    if (!file) return ContentService.createTextOutput(JSON.stringify({})).setMimeType(ContentService.MimeType.JSON);
    
    const ss = SpreadsheetApp.openById(file.getId());
    const sheets = ss.getSheets();
    
    for (let sheet of sheets) {
      if (sheet.getName() === "GLOBAL_SUMMARY") continue;
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("Record ID");
      const dataIdx = headers.indexOf("RAW_DATA");
      
      if (idIdx === -1 || dataIdx === -1) continue;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIdx].toString() === auditId) {
          return ContentService.createTextOutput(data[i][dataIdx])
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({error: "Not Found"})).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getAuditorHistory(auditorId) {
  try {
    const file = getFileByName(MASTER_FILE_NAME, "spreadsheet");
    if (!file) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const ss = SpreadsheetApp.openById(file.getId());
    const sheets = ss.getSheets();
    let history = [];

    // Pre-cache folder link for faster lookup if possible
    let masterFolder = getFileByName(MASTER_ARCHIVE_FOLDER, "folder");
    let folderMap = {};

    sheets.forEach(sheet => {
      if (sheet.getName() === "GLOBAL_SUMMARY") return;
      
      const data = sheet.getDataRange().getValues();
      if (data.length < 2) return;
      
      const headers = data[0];
      const audIdIdx = headers.findIndex(h => h.toString().replace(/\s/g, '').toLowerCase() === "auditorid");
      const linkIdx = headers.findIndex(h => h.toString().trim().toUpperCase().includes("LINK"));
      const dateIdx = headers.findIndex(h => h.toString().trim().toUpperCase().includes("DATE"));
      const scoreIdx = headers.findIndex(h => h.toString().trim().toUpperCase().includes("SCORE"));
      const recordIdIdx = headers.findIndex(h => h.toString().trim().toUpperCase().includes("RECORD ID"));
      
      if (audIdIdx === -1) return;

      // Find store folder link
      let vaultLink = "N/A";
      const storeName = sheet.getName().split(" - ")[1] || sheet.getName();
      if (masterFolder) {
        if (!folderMap[storeName]) {
          const folders = masterFolder.getFoldersByName(storeName);
          if (folders.hasNext()) {
            folderMap[storeName] = folders.next().getUrl();
          }
        }
        vaultLink = folderMap[storeName] || "N/A";
      }

      for (let i = 1; i < data.length; i++) {
        const rowId = (data[i][audIdIdx] || "").toString().trim();
        if (rowId === auditorId) {
          history.push({
            id: recordIdIdx !== -1 ? data[i][recordIdIdx] : i,
            date: dateIdx !== -1 ? data[i][dateIdx] : "N/A",
            store: sheet.getName(),
            score: scoreIdx !== -1 ? data[i][scoreIdx] : "0%",
            link: linkIdx !== -1 ? data[i][linkIdx] : "N/A",
            vaultLink: vaultLink,
            timestamp: new Date(data[i][dateIdx] || Date.now()).getTime()
          });
        }
      }
    });

    history.sort((a, b) => b.timestamp - a.timestamp);
    return ContentService.createTextOutput(JSON.stringify(history)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const data = payload.auditData;
    const storeCode = data.header.storeCode || "NA";
    const storeName = data.header.store || "Unknown Store";
    const tabName = storeCode + " - " + storeName.substring(0, 15);
    
    let file = getFileByName(MASTER_FILE_NAME, "spreadsheet");
    let ss = file ? SpreadsheetApp.openById(file.getId()) : SpreadsheetApp.create(MASTER_FILE_NAME);
    
    let pdfUrl = "N/A";
    if (payload.pdfBase64) {
      pdfUrl = archivePdfReport(payload.pdfBase64, storeName + "_" + storeCode + "_" + Date.now() + ".pdf", storeName);
    }
    
    let sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
    let headers = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    
    // Auto-Healing Headers with RAW_DATA support
    if (headers.indexOf("RAW_DATA") === -1) {
      headers = ["Audit Date", "Auditor ID", "Auditor Name", "Final Score %", "Total Points", "Cleanliness", "Merchandising", "Operations", "Staff", "Clinical", "REPORT LINK", "Record ID", "RAW_DATA"];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground("#0A0F1E").setFontColor("#C9A84C").setFontWeight("bold");
    }
    
    const auditId = String(data.id);
    const catScores = data.categoryBreakdown || {};
    const fullRow = [];
    headers.forEach(h => {
      const hNorm = h.toString().trim();
      if (hNorm === "Audit Date") fullRow.push(data.header.date);
      else if (hNorm === "Auditor ID") fullRow.push((data.header.auditorId || "NA").toString().trim());
      else if (hNorm === "Auditor Name") fullRow.push(data.header.auditorName || "Unknown");
      else if (hNorm === "Final Score %") fullRow.push(data.percentage + "%");
      else if (hNorm === "Total Points") fullRow.push(data.earned + " / " + data.total);
      else if (hNorm === "REPORT LINK") fullRow.push(pdfUrl);
      else if (hNorm === "Record ID") fullRow.push(auditId);
      else if (hNorm === "RAW_DATA") fullRow.push(JSON.stringify(data));
      else {
        const key = hNorm.toLowerCase();
        fullRow.push(catScores[key] || 0);
      }
    });

    sheet.appendRow(fullRow);
    const linkIdx = headers.indexOf("REPORT LINK");
    if (linkIdx !== -1 && pdfUrl !== "N/A") {
      sheet.getRange(sheet.getLastRow(), linkIdx + 1).setFormula('=HYPERLINK("' + pdfUrl + '", "View Report")');
    }
    
    updateSummaryTab(ss, tabName, data.header.date, data.percentage);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", pdfLink: pdfUrl }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

const MASTER_ARCHIVE_FOLDER = "RETAIL_AUDIT_DOCUMENTS";

function archivePdfReport(base64, name, storeName) {
  // 1. Get or Create Master Folder
  let masterFolder = getFileByName(MASTER_ARCHIVE_FOLDER, "folder") || DriveApp.createFolder(MASTER_ARCHIVE_FOLDER);
  
  // 2. Get or Create Store Sub-folder
  const subFolderName = storeName || "General Reports";
  let storeFolder;
  const folders = masterFolder.getFoldersByName(subFolderName);
  if (folders.hasNext()) {
    storeFolder = folders.next();
  } else {
    storeFolder = masterFolder.createFolder(subFolderName);
  }
  
  // 3. Create File
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, MimeType.PDF, name);
  const file = storeFolder.createFile(blob);
  
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getFileByName(name, type) {
  const iterator = type === "spreadsheet" ? DriveApp.getFilesByName(name) : DriveApp.getFoldersByName(name);
  while (iterator.hasNext()) {
    const item = iterator.next();
    if (!item.isTrashed()) return item;
  }
  return null;
}

function updateSummaryTab(ss, tabName, date, score) {
  let summary = ss.getSheetByName("GLOBAL_SUMMARY");
  if (!summary) {
    summary = ss.insertSheet("GLOBAL_SUMMARY", 0);
    summary.appendRow(["Store Tab", "Total Audits", "Last Audit", "Avg Score %"]);
    summary.getRange(1, 1, 1, 4).setBackground("#0A0F1E").setFontColor("#C9A84C").setFontWeight("bold");
  }
  const data = summary.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === tabName) {
      const count = (parseInt(data[i][1]) || 0) + 1;
      const avg = Math.round(((parseFloat(data[i][3]) || 0) * (count - 1) + score) / count);
      summary.getRange(i + 1, 2).setValue(count);
      summary.getRange(i + 1, 3).setValue(date);
      summary.getRange(i + 1, 4).setValue(avg);
      found = true; break;
    }
  }
  if (!found) summary.appendRow([tabName, 1, date, score]);
}
