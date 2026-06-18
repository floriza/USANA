# Hostinger VPS Deployment Guide

## Prerequisites

- Hostinger VPS (Ubuntu 22.04 LTS recommended, min 2 vCPU, 4GB RAM)
- Domain name pointed to VPS IP
- GitHub account with this repo

---

## 1. Initial VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx certbot (for SSL)
apt install -y nginx certbot python3-certbot-nginx
```

---

## 2. Configure SSL Certificate

```bash
# Replace yourdomain.com with your actual domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
certbot renew --dry-run
```

---

## 3. Deploy Application

```bash
# Create deployment directory
mkdir -p /opt/usana-store
cd /opt/usana-store

# Clone repository
git clone https://github.com/yourusername/usana-store.git .

# Create production environment file
cp .env.example .env
nano .env  # Fill in all production values
```

### Required Environment Variables

```env
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@db:5432/usana_store
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
PAYMONGO_PUBLIC_KEY=pk_live_...
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=usana-store
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.r2.dev
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=USANA Store Philippines
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=USANA Store Philippines
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_live_...
```

```bash
# Update nginx.conf with your domain
sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN/g' nginx.conf

# Build and start
docker-compose up -d --build

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Seed database (first time only)
docker-compose exec app npx tsx prisma/seed.ts

# Verify health
curl https://yourdomain.com/api/health
```

---

## 4. GitHub Actions CI/CD Setup

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `PRODUCTION_HOST` | Your VPS IP address |
| `VPS_USER` | `root` or your VPS username |
| `VPS_SSH_KEY` | Your private SSH key |
| `PRODUCTION_URL` | `https://yourdomain.com` |

---

## 5. PayMongo Webhook Configuration

In PayMongo Dashboard:
1. Go to Webhooks → Create Webhook
2. URL: `https://yourdomain.com/api/webhooks/paymongo`
3. Events: `payment.paid`, `payment.failed`
4. Copy the webhook secret to `.env` as `PAYMONGO_WEBHOOK_SECRET`

---

## 6. Post-Deployment Checklist

- [ ] SSL certificate active (`https://` works)
- [ ] Health check passes: `GET /api/health` returns `200`
- [ ] Admin login works: `admin@usanastore.ph` / `Admin@123456` (change immediately!)
- [ ] Google OAuth configured and working
- [ ] PayMongo webhook registered and verified
- [ ] Test order placement end-to-end
- [ ] Verify compliance checker blocks prohibited phrases
- [ ] Check health disclaimers visible on product pages
- [ ] Verify footer shows "Independent USANA Distributor" notice
- [ ] Test email sending (order confirmation)
- [ ] Set up automated DB backups

---

## 7. Maintenance

```bash
# View logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Update application
git pull && docker-compose up -d --build app

# Database backup
docker-compose exec db pg_dump -U postgres usana_store > backup_$(date +%Y%m%d).sql
```
