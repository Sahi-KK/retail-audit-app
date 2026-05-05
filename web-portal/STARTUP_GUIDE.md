# 🌐 EssilorLuxottica Web Portal: Startup Guide

Welcome to the Enterprise Web Portal. This guide provides the exact steps to launch your high-fidelity "Strategic Hub" and activate the account-based cloud syncing.

## 🚀 1. Launching the Web Portal
To start the primary user interface:
1.  Open your terminal.
2.  Navigate to the `web-portal` directory.
3.  Run the following command:
    ```bash
    npm run dev
    ```
4.  Open your browser to: **http://localhost:5173**

---

## 🛡️ 2. Activating the 'Ghost Shield' Sync Gateway
For account-based history and cloud persistence to work, you must start the local sync server. This acts as the gateway between your browser and the `cloud_vault`.

**Command to start the Gateway:**
```bash
node sync-server.cjs
```

> **IMPORTANT**: Keep this terminal window open. If this server stops, your audits will save locally in the browser but will NOT transmit to the `cloud_vault`.

---

## 🔐 3. Account Login (Krishnakant Singh)
When the portal opens, use your enterprise credentials:
- **Full Name**: `Krishnakant Singh`
- **Employee ID**: Your professional ID (e.g., `EMP-1234`)

Once logged in, the **Strategic Hub** will automatically filter all stats, charts, and history to show only your specific account data.

---

## 📂 4. Where is my Data?
- **Browser Storage**: Audits are instantly cached in your browser's local storage for offline access.
- **Cloud Vault**: Every time you click "Complete Audit", a JSON report is transmitted to:
  `/Applications/Antigravitty/EssilorLuxottice - Audit App/web-portal/cloud_vault/`
