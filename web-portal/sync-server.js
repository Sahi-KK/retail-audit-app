const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const VAULT_DIR = path.join(__dirname, 'cloud_vault');

// Ensure vault exists
if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR);
}

app.post('/sync', (req, res) => {
  const audit = req.body;
  const filename = `Report_${audit.headerInfo.storeCode.replace(/\//g, '_')}_${Date.now()}.json`;
  const filePath = path.join(VAULT_DIR, filename);

  fs.writeFileSync(filePath, JSON.stringify(audit, null, 2));
  console.log(`[CLOUD SYNC] Audit ${audit.id} archived to ${filePath}`);
  
  res.json({ success: true, cloudFileId: filename });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[GHOST SHIELD] Sync Server active on port ${PORT}`);
  console.log(`[INFO] Reports will be archived in: ${VAULT_DIR}`);
});
