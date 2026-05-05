/** 
 * ESSILOR LUXOTTICA - AUDIT MASTER HUB v3.0 (MULTI-USER ENTERPRISE)
 * Deployment: Deploy as Web App -> Execute as "Me" -> Access "Anyone"
 */

const MASTER_FILE_NAME = "RETAIL_AUDIT_MASTER_DATABASE";
const MASTER_ARCHIVE_FOLDER = "RETAIL_AUDIT_DOCUMENTS";

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

  return ContentService.createTextOutput("🛡️ ENTERPRISE HUB v3.0 | STATUS: ACTIVE")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getAuditDetail(auditId) {
  try {
    const ssFile = getFileByName(MASTER_FILE_NAME, "spreadsheet");
    const ss = SpreadsheetApp.openById(ssFile.getId());
    const indexSheet = ss.getSheetByName("GLOBAL_INDEX");
    
    if (!indexSheet) return ContentService.createTextOutput(JSON.stringify({error: "No Index Found"})).setMimeType(ContentService.MimeType.JSON);
    
    const data = indexSheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf("Record ID");
    const dataIdx = headers.indexOf("RAW_DATA");
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === auditId) {
        return ContentService.createTextOutput(data[i][dataIdx])
          .setMimeType(ContentService.MimeType.JSON);
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
    const indexSheet = ss.getSheetByName("GLOBAL_INDEX");
    if (!indexSheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

    const data = indexSheet.getDataRange().getValues();
    const headers = data[0];
    const audIdIdx = headers.indexOf("Auditor ID");
    const dateIdx = headers.indexOf("Audit Date");
    const storeIdx = headers.indexOf("Store");
    const scoreIdx = headers.indexOf("Final Score %");
    const linkIdx = headers.indexOf("REPORT LINK");
    const vaultIdx = headers.indexOf("VAULT LINK");
    const recordIdIdx = headers.indexOf("Record ID");
    
    let history = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][audIdIdx].toString().trim() === auditorId) {
        history.push({
          id: data[i][recordIdIdx],
          date: data[i][dateIdx],
          store: data[i][storeIdx],
          score: data[i][scoreIdx],
          link: data[i][linkIdx],
          vaultLink: data[i][vaultIdx],
          timestamp: new Date(data[i][dateIdx]).getTime()
        });
      }
    }

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
    const auditorName = data.header.auditorName || "Unknown Auditor";
    const auditorId = (data.header.auditorId || "NA").toString().trim();
    const storeCode = data.header.storeCode || "NA";
    const storeName = data.header.store || "Unknown Store";
    const tabName = storeCode + " - " + storeName.substring(0, 15);
    
    let ssFile = getFileByName(MASTER_FILE_NAME, "spreadsheet");
    let ss = ssFile ? SpreadsheetApp.openById(ssFile.getId()) : SpreadsheetApp.create(MASTER_FILE_NAME);
    
    // 1. Archive PDF in Auditor Specific Folder
    let pdfUrl = "N/A";
    let vaultUrl = "N/A";
    if (payload.pdfBase64) {
      const archiveResult = archivePdfReport(payload.pdfBase64, storeName + "_" + Date.now() + ".pdf", auditorName, storeName);
      pdfUrl = archiveResult.fileUrl;
      vaultUrl = archiveResult.folderUrl;
    }
    
    // 2. Update Global Index (For Fast Retrieval)
    let indexSheet = ss.getSheetByName("GLOBAL_INDEX") || ss.insertSheet("GLOBAL_INDEX", 0);
    let indexHeaders = ["Audit Date", "Auditor ID", "Auditor Name", "Store", "Final Score %", "REPORT LINK", "VAULT LINK", "Record ID", "RAW_DATA"];
    if (indexSheet.getLastColumn() === 0) {
      indexSheet.getRange(1, 1, 1, indexHeaders.length).setValues([indexHeaders]).setBackground("#0A0F1E").setFontColor("#C9A84C").setFontWeight("bold");
    }

    const auditId = String(data.id);
    const indexRow = [data.header.date, auditorId, auditorName, storeName, data.percentage + "%", pdfUrl, vaultUrl, auditId, JSON.stringify(data)];
    
    // Check if updating existing record in index
    const indexData = indexSheet.getDataRange().getValues();
    const idIdx = indexHeaders.indexOf("Record ID");
    let existingRow = -1;
    for (let i = 1; i < indexData.length; i++) {
      if (indexData[i][idIdx] == auditId) { existingRow = i + 1; break; }
    }
    if (existingRow !== -1) indexSheet.getRange(existingRow, 1, 1, indexRow.length).setValues([indexRow]);
    else indexSheet.appendRow(indexRow);

    // 3. Update Store Specific Tab
    let sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
    let storeHeaders = ["Audit Date", "Auditor ID", "Final Score %", "REPORT LINK", "Record ID"];
    if (sheet.getLastColumn() === 0) {
      sheet.getRange(1, 1, 1, storeHeaders.length).setValues([storeHeaders]).setBackground("#0A0F1E").setFontColor("#C9A84C").setFontWeight("bold");
    }
    sheet.appendRow([data.header.date, auditorId, data.percentage + "%", pdfUrl, auditId]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", pdfLink: pdfUrl, vaultLink: vaultUrl }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function archivePdfReport(base64, name, auditorName, storeName) {
  let masterFolder = getFileByName(MASTER_ARCHIVE_FOLDER, "folder") || DriveApp.createFolder(MASTER_ARCHIVE_FOLDER);
  
  // Auditor Folder
  let auditorFolder;
  const aFolders = masterFolder.getFoldersByName(auditorName);
  if (aFolders.hasNext()) auditorFolder = aFolders.next();
  else auditorFolder = masterFolder.createFolder(auditorName);

  // Store Folder Inside Auditor Folder
  let storeFolder;
  const sFolders = auditorFolder.getFoldersByName(storeName);
  if (sFolders.hasNext()) storeFolder = sFolders.next();
  else storeFolder = auditorFolder.createFolder(storeName);
  
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, MimeType.PDF, name);
  const file = storeFolder.createFile(blob);
  
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  storeFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return { fileUrl: file.getUrl(), folderUrl: storeFolder.getUrl() };
}

function getFileByName(name, type) {
  const iterator = type === "spreadsheet" ? DriveApp.getFilesByName(name) : DriveApp.getFoldersByName(name);
  while (iterator.hasNext()) {
    const item = iterator.next();
    if (!item.isTrashed()) return item;
  }
  return null;
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
