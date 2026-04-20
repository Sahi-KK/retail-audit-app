/**
 * ESSILOR LUXOTTICA - AUDIT MASTER HUB v2.0
 * Features: Centralized Spreadsheet, Per-Store Tabs, PDF Report Archiving
 * Deployment: Deploy as Web App -> Execute as "Me" -> Access "Anyone"
 */

const MASTER_FILE_NAME = "RETAIL_AUDIT_MASTER_DATABASE";
const PDF_FOLDER_NAME = "AUDIT_REPORT_PDFS";

// RUN THIS FUNCTION ONCE IN THE EDITOR TO FIX PERMISSIONS
function authorize() {
  const root = DriveApp.getRootFolder();
  Logger.log("Authorization Successful: " + root.getName());
}

function doGet(e) {
  const action = e.parameter.action;
  const auditorId = e.parameter.auditorId;
  const storeCode = e.parameter.storeCode;

  if (action === "getHistory") {
    return getAuditorHistory(auditorId);
  }

  return ContentService.createTextOutput("🛡️ ESSILOR LUXOTTICA AUDIT MASTER HUB: ACTIVE")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getAuditorHistory(auditorId) {
  try {
    const file = getFileByName(MASTER_FILE_NAME, "spreadsheet");
    if (!file) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const ss = SpreadsheetApp.openById(file.getId());
    const sheets = ss.getSheets();
    let history = [];

    sheets.forEach(sheet => {
      if (sheet.getName() === "GLOBAL_SUMMARY") return;
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const audIdIdx = headers.indexOf("Auditor ID");
      const linkIdx = headers.indexOf("REPORT LINK");
      const dateIdx = headers.indexOf("Audit Date");
      const scoreIdx = headers.indexOf("Final Score %");
      
      if (audIdIdx === -1) return;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][audIdIdx]) === String(auditorId)) {
          history.push({
            date: data[i][dateIdx],
            store: sheet.getName(),
            score: data[i][scoreIdx],
            link: data[i][linkIdx],
            timestamp: new Date(data[i][dateIdx]).getTime()
          });
        }
      }
    });

    // Sort by most recent
    history.sort((a, b) => b.timestamp - a.timestamp);

    return ContentService.createTextOutput(JSON.stringify(history))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const data = payload.auditData;
    const pdfBase64 = payload.pdfBase64;
    
    const storeCode = data.header.storeCode || "NA";
    const storeName = data.header.store || "Unknown Store";
    const tabName = storeCode + " - " + storeName.substring(0, 15); // Length limit
    
    // 1. Get or Create the Master File
    let file = getFileByName(MASTER_FILE_NAME, "spreadsheet");
    let ss;
    if (!file) {
       ss = SpreadsheetApp.create(MASTER_FILE_NAME);
       setupSummaryTab(ss);
    } else {
       ss = SpreadsheetApp.openById(file.getId());
    }
    
    // 2. Handle PDF Archiving
    let pdfUrl = "N/A";
    if (pdfBase64) {
      const city = data.header.city || "Global";
      const date = data.header.date || new Date().toISOString().split('T')[0];
      const customFileName = storeName + "_" + storeCode + " | " + city + " | " + date + ".pdf";
      pdfUrl = archivePdfReport(pdfBase64, customFileName);
    }
    
    // 3. Get or Create the Store-Specific Tab
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      // New Header with Auditor ID
      sheet.appendRow(["Audit Date", "Auditor ID", "Auditor Name", "Final Score %", "Total Points", "Cleanliness", "Merchandising", "Operations", "Staff", "Clinical", "REPORT LINK", "Record ID"]);
      sheet.getRange(1, 1, 1, 12).setBackground("#0A0F1E").setFontColor("#C9A84C").setFontWeight("bold");
      sheet.hideColumns(12);
    }
    
    // Dynamically find the Record ID column
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let idColIndex = headers.indexOf("Record ID");
    
    // If Record ID column is missing, add it
    if (idColIndex === -1) {
      idColIndex = headers.length;
      sheet.getRange(1, idColIndex + 1).setValue("Record ID").setBackground("#0A0F1E").setFontColor("#C9A84C").setFontWeight("bold");
      sheet.hideColumns(idColIndex + 1);
    }

    // 4. Upsert (Update or Insert) the Audit Record
    const auditId = String(data.id);
    const catScores = data.categoryBreakdown || {};
    const rowContent = [
      data.header.date,
      data.header.auditorId || "NA",
      data.header.auditorName || "Unknown",
      data.percentage + "%",
      data.earned + " / " + data.total,
      catScores.cleanliness || 0,
      catScores.merchandising || 0,
      catScores.operations || 0,
      catScores.staff || 0,
      catScores.clinical || 0,
      pdfUrl
    ];
    
    // Prepare the final row for saving (insert the ID at the correct index)
    const fullRow = [...rowContent];
    fullRow[idColIndex] = auditId;

    const existingData = sheet.getDataRange().getValues();
    let rowToUpdate = -1;
    
    for (let i = 1; i < existingData.length; i++) {
      if (String(existingData[i][idColIndex]) === auditId) {
        rowToUpdate = i + 1;
        break;
      }
    }

    if (rowToUpdate !== -1) {
      Logger.log("Match Found: Updating Row " + rowToUpdate);
      sheet.getRange(rowToUpdate, 1, 1, fullRow.length).setValues([fullRow]);
    } else {
      Logger.log("No Match: Appending New Record");
      sheet.appendRow(fullRow);
    }
    
    // Add Link formatting to the URL cell (Column 10 is 'REPORT LINK')
    const targetRow = rowToUpdate !== -1 ? rowToUpdate : sheet.getLastRow();
    if (pdfUrl !== "N/A") {
      sheet.getRange(targetRow, 10).setFormula('=HYPERLINK("' + pdfUrl + '", "View Report")');
    }
    
    // 5. Update the MASTER SUMMARY Tab (Dashboard)
    updateSummaryTab(ss, tabName, data.header.date, data.percentage, (rowToUpdate === -1));
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", pdfLink: pdfUrl, debug: { match: rowToUpdate !== -1, id: auditId } }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    Logger.log("FAILED: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function archivePdfReport(base64, name) {
  let folder = getFileByName(PDF_FOLDER_NAME, "folder");
  if (!folder) {
    folder = DriveApp.createFolder(PDF_FOLDER_NAME);
  } else {
    folder = DriveApp.getFolderById(folder.getId());
  }
  
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, MimeType.PDF, name);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}

function getFileByName(name, type) {
  const files = type === "spreadsheet" ? DriveApp.getFilesByName(name) : DriveApp.getFoldersByName(name);
  if (files.hasNext()) {
    const file = files.next();
    return file;
  }
  return null;
}

function setupSummaryTab(ss) {
  let summary = ss.getSheetByName("GLOBAL_SUMMARY");
  if (!summary) {
    summary = ss.getSheets()[0];
    summary.setName("GLOBAL_SUMMARY");
  }
  summary.appendRow(["Store Tab", "Total Audits", "Last Audit", "Avg Score %"]);
  summary.getRange(1, 1, 1, 4).setBackground("#0A0F1E").setFontColor("#C9A84C").setFontWeight("bold");
}

function updateSummaryTab(ss, tabName, date, score) {
  const summary = ss.getSheetByName("GLOBAL_SUMMARY");
  const data = summary.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === tabName) {
      const currentCount = parseInt(data[i][1]) || 0;
      const currentAvg = parseFloat(data[i][3]) || 0;
      
      const newCount = currentCount + 1;
      const newAvg = Math.round(((currentAvg * currentCount) + score) / newCount);
      
      summary.getRange(i + 1, 2).setValue(newCount);
      summary.getRange(i + 1, 3).setValue(date);
      summary.getRange(i + 1, 4).setValue(newAvg);
      found = true;
      break;
    }
  }
  
  if (!found) {
    summary.appendRow([tabName, 1, date, score]);
  }
}
