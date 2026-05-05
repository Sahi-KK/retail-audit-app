const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const VAULT_DIR = path.join(__dirname, 'cloud_vault');

if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR);
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // POST /sync - Save a report
  if (req.method === 'POST' && parsedUrl.pathname === '/sync') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const audit = JSON.parse(body);
        const auditorId = audit.headerInfo.auditorId || 'UNKNOWN';
        const auditorDir = path.join(VAULT_DIR, auditorId);
        
        if (!fs.existsSync(auditorDir)) {
          fs.mkdirSync(auditorDir);
        }

        const filename = `CloudReport_${audit.headerInfo.storeCode.replace(/\//g, '_')}_${Date.now()}.json`;
        const filePath = path.join(auditorDir, filename);

        fs.writeFileSync(filePath, JSON.stringify(audit, null, 2));
        console.log(`\n[CLOUD SYNC] SAVED: ${filename} for Auditor: ${auditorId}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, cloudFileId: filename }));
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } 
  // GET /reports - List/Download reports for an auditor
  else if (req.method === 'GET' && parsedUrl.pathname === '/reports') {
    const auditorId = parsedUrl.query.auditorId;
    if (!auditorId) {
      res.writeHead(400);
      res.end('auditorId required');
      return;
    }

    const auditorDir = path.join(VAULT_DIR, auditorId);
    if (!fs.existsSync(auditorDir)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
      return;
    }

    const files = fs.readdirSync(auditorDir);
    const reports = files.map(f => {
      const content = fs.readFileSync(path.join(auditorDir, f), 'utf8');
      return JSON.parse(content);
    });

    console.log(`[CLOUD SYNC] RETRIEVED ${reports.length} reports for Auditor: ${auditorId}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reports));
  }
  else {
    // --- CLOUD PROXY TUNNEL ---
    if (req.url.startsWith('/proxy') && req.method === 'GET') {
      const targetUrl = new URL(req.url, `http://${req.headers.host}`).searchParams.get('url');
      if (!targetUrl) {
        res.writeHead(400);
        return res.end('Missing Target URL');
      }

      console.log(`[CLOUD TUNNEL] Handshaking with: ${targetUrl}`);
      
      const proxyReq = http.get(targetUrl, (proxyRes) => {
        // Handle Google Apps Script Redirects
        if (proxyRes.statusCode === 302 || proxyRes.statusCode === 301) {
          console.log(`[CLOUD TUNNEL] Following Redirect to: ${proxyRes.headers.location}`);
          return http.get(proxyRes.headers.location, (redirRes) => {
            res.writeHead(redirRes.statusCode, { 
              ...redirRes.headers, 
              'Access-Control-Allow-Origin': '*' 
            });
            redirRes.pipe(res);
          }).on('error', (e) => {
            res.writeHead(500);
            res.end(`Cloud Error: ${e.message}`);
          });
        }

        res.writeHead(proxyRes.statusCode, { 
          ...proxyRes.headers, 
          'Access-Control-Allow-Origin': '*' 
        });
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (e) => {
        res.writeHead(500);
        res.end(`Cloud Error: ${e.message}`);
      });
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 8080;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n[GHOST SHIELD] Cloud Gateway Active on port ${PORT}`);
  console.log(`[VAULT] Organized by Auditor ID`);
});
