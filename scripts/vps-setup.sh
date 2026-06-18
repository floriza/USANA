#!/bin/bash
# One-time VPS setup script for Hostinger Ubuntu 22.04
# Run as root: bash vps-setup.sh

set -e

echo "=== USANA Store — Hostinger VPS Setup ==="

# ── System update ──────────────────────────────────────────────────────────
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw fail2ban

# ── Docker ────────────────────────────────────────────────────────────────
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# ── Firewall ──────────────────────────────────────────────────────────────
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── Fail2ban (brute force protection) ─────────────────────────────────────
systemctl enable fail2ban
systemctl start fail2ban

# ── App directory ─────────────────────────────────────────────────────────
mkdir -p /opt/usana-store
mkdir -p /var/www/certbot

echo ""
echo "=== Setup complete. Next steps: ==="
echo ""
echo "1. Copy your docker-compose file:"
echo "   scp docker-compose.staging.yml root@YOUR_VPS_IP:/opt/usana-store/"
echo "   scp nginx.staging.conf root@YOUR_VPS_IP:/opt/usana-store/"
echo ""
echo "2. Create your env file on the VPS:"
echo "   nano /opt/usana-store/.env.staging"
echo "   (Fill in values from .env.staging.example)"
echo ""
echo "3. Install SSL certificate:"
echo "   docker run --rm -v /etc/letsencrypt:/etc/letsencrypt \\"
echo "     -v /var/www/certbot:/var/www/certbot certbot/certbot \\"
echo "     certonly --webroot -w /var/www/certbot \\"
echo "     -d staging.yourdomain.com --email you@email.com --agree-tos"
echo ""
echo "4. Add GitHub Actions secrets (Settings → Secrets):"
echo "   STAGING_HOST = $(curl -s ifconfig.me)"
echo "   VPS_USER     = root"
echo "   VPS_SSH_KEY  = (your private SSH key)"
echo ""
echo "5. Push to the staging branch to trigger your first deployment."
