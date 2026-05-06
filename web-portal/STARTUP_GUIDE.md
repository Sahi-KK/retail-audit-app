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
4.  Open your browser to: **http://localhost:5073**

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

## 🌐 5. Official Live Enterprise URL
For access outside of your local environment (mobile, tablet, or remote desktop), use the official live hub:

**Live Link:** [https://sahi-kk.github.io/retail-audit-app/](https://sahi-kk.github.io/retail-audit-app/)

### 🏷️ Professional Re-branding (Custom Domain)
To remove the "github" naming and use a professional domain (e.g., `audit.luxottica.com`):
1.  **Purchase Domain**: Acquire your preferred domain from a registrar.
2.  **GitHub Config**: Go to Repository Settings -> Pages -> Custom Domain.
3.  **DNS Update**: Add a **CNAME** record in your domain dashboard pointing to `sahi-kk.github.io`.

---

## 📂 6. Where is my Data?
- **Browser Storage**: Audits are instantly cached in your browser's local storage for offline access.
- **Master Cloud Hub**: High-fidelity PDF reports and data are synced to your **Google Drive Master Vault** and the **Global Index Spreadsheet**.
- **Local Cloud Vault**: A backup JSON report is also transmitted to the local `/cloud_vault/` directory if the sync server is running.

