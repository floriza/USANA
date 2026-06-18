# USANA Store — IIS Deployment Guide (Windows)

## Architecture

```
Browser → IIS (port 80/443) → URL Rewrite Proxy → Node.js/Next.js (port 3000)
                                                         ↕
                                                   Supabase (PostgreSQL)
```

IIS handles SSL termination and static files; Next.js runs as a background service managed by PM2.

---

## Prerequisites

Install these once on the machine:

| Tool | Download |
|------|----------|
| Node.js 20 LTS | https://nodejs.org |
| IIS (Windows Feature) | Control Panel → Turn Windows features on/off → Internet Information Services |
| IIS URL Rewrite Module | https://www.iis.net/downloads/microsoft/url-rewrite |
| IIS Application Request Routing (ARR) | https://www.iis.net/downloads/microsoft/application-request-routing |
| PM2 (Node process manager) | `npm install -g pm2` |

Enable ARR proxy in IIS Manager:
1. Open IIS Manager → server root node
2. Double-click "Application Request Routing Cache"
3. Click "Server Proxy Settings" (right panel)
4. Check "Enable proxy" → Apply

---

## Step 1 — Build the App

```powershell
cd D:\Project\Claude Code\Usana\usana-store

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build (outputs to .next/standalone)
npm run build
```

---

## Step 2 — Prepare the Deployment Folder

```powershell
# Create deployment directory
New-Item -ItemType Directory -Force "C:\inetpub\usana-store"

# Copy standalone server
Copy-Item -Recurse -Force ".next\standalone\*" "C:\inetpub\usana-store\"

# Copy static assets (required — standalone does NOT include these)
Copy-Item -Recurse -Force ".next\static" "C:\inetpub\usana-store\.next\static"
Copy-Item -Recurse -Force "public" "C:\inetpub\usana-store\public"

# Copy environment file
Copy-Item ".env" "C:\inetpub\usana-store\.env"
```

---

## Step 3 — Configure Environment Variables

Edit `C:\inetpub\usana-store\.env` and confirm these are set correctly:

```env
DATABASE_URL="postgresql://postgres.umvodutowgjofvygdkqx:...@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
AUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost"          # or your actual domain
NEXT_PUBLIC_APP_URL="http://localhost"   # or your actual domain
NODE_ENV="production"
PORT=3000
```

---

## Step 4 — Start the App with PM2

```powershell
cd C:\inetpub\usana-store

# Start the Next.js server
pm2 start server.js --name "usana-store" --env production

# Save the process list so it survives reboots
pm2 save

# Set PM2 to auto-start on Windows boot
pm2 startup

# Verify it's running
pm2 status
pm2 logs usana-store --lines 20
```

Confirm Node.js is listening: open http://localhost:3000 in the browser — you should see the site.

---

## Step 5 — Create the IIS Site

1. Open **IIS Manager**
2. Right-click **Sites** → **Add Website**
   - Site name: `usana-store`
   - Physical path: `C:\inetpub\usana-store\public` (IIS needs a physical path even as a proxy)
   - Binding: HTTP, port 80, hostname: `localhost` (or your domain)
3. Click **OK**

---

## Step 6 — Add web.config (Reverse Proxy + Static Files)

Copy the `web.config` from `deploy\web.config` (in this repo) to `C:\inetpub\usana-store\`:

```powershell
Copy-Item "D:\Project\Claude Code\Usana\usana-store\deploy\web.config" "C:\inetpub\usana-store\web.config"
```

---

## Step 7 — Verify

1. Browse to http://localhost — homepage should load
2. Click a product — product detail page should load
3. Check PM2 logs: `pm2 logs usana-store`
4. Check IIS logs: `C:\inetpub\logs\LogFiles\W3SVC*`

---

## Updating the App

```powershell
cd "D:\Project\Claude Code\Usana\usana-store"

git pull origin main
npm ci
npm run build

# Re-copy build artifacts
Copy-Item -Recurse -Force ".next\standalone\*" "C:\inetpub\usana-store\"
Copy-Item -Recurse -Force ".next\static" "C:\inetpub\usana-store\.next\static"
Copy-Item -Recurse -Force "public" "C:\inetpub\usana-store\public"

# Restart the Node process (zero-downtime reload)
pm2 reload usana-store
```

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 502 Bad Gateway | PM2 process stopped — run `pm2 status` and `pm2 restart usana-store` |
| 404 on static assets | Static folder not copied — re-run Step 2 copy commands |
| Prisma connection error | Check `.env` DATABASE_URL, confirm Supabase pooler is reachable |
| "Cannot find module" on start | Run `npm ci` in the deployment folder |
| App not starting after reboot | Run `pm2 startup` again and follow its output instructions |
