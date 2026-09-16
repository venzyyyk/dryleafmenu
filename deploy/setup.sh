#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  Dry Leaf — первичная настройка VPS (Ubuntu 22.04 / 24.04)
#  Запуск: sudo bash deploy/setup.sh
#  Ставит: Node 20, PM2, nginx, SSL, firewall, swap, сам сайт
# ═══════════════════════════════════════════════════════════
set -e

APP_DIR="/var/www/dryleaf"
APP_NAME="dryleaf"

say() { echo -e "\n\033[1;32m▸ $1\033[0m"; }
err() { echo -e "\n\033[1;31m✖ $1\033[0m"; exit 1; }

[ "$EUID" -eq 0 ] || err "Запусти от root: sudo bash deploy/setup.sh"

# ─── 1. Вопросы ────────────────────────────────────────────
echo "═══════════════════════════════════════════"
echo "  Настройка сайта Dry Leaf"
echo "═══════════════════════════════════════════"
read -rp "Домен (например dryleaf.com.ua; Enter — работать по IP): " DOMAIN
read -rp "DATABASE_URL (строка подключения из Neon): " DB_URL
[ -z "$DB_URL" ] && err "Без DATABASE_URL сайт не заработает"
read -rp "Email для входа в админку [admin@dryleaf.local]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@dryleaf.local}
read -rp "Пароль для админки: " ADMIN_PASS
[ -z "$ADMIN_PASS" ] && err "Пароль админки обязателен"

SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -n "$DOMAIN" ]; then
  APP_URL="https://$DOMAIN"
  SERVER_NAME="$DOMAIN www.$DOMAIN"
else
  APP_URL="http://$SERVER_IP"
  SERVER_NAME="_"
fi

# ─── 2. Система ────────────────────────────────────────────
say "Обновление системы"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git nginx ufw ca-certificates gnupg >/dev/null

# ─── 3. Swap (страховка от нехватки памяти при сборке) ─────
if [ ! -f /swapfile ]; then
  say "Создаю swap 2GB"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ─── 4. Node.js 20 ─────────────────────────────────────────
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  say "Устанавливаю Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs >/dev/null
fi
say "Node $(node -v), npm $(npm -v)"

# ─── 5. PM2 ────────────────────────────────────────────────
command -v pm2 >/dev/null || { say "Устанавливаю PM2"; npm install -g pm2 --silent >/dev/null; }

# ─── 6. Файл окружения ─────────────────────────────────────
say "Создаю .env"
SECRET=$(openssl rand -base64 32)
cat > "$APP_DIR/.env" <<ENVFILE
DATABASE_URL="$DB_URL"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_URL="$APP_URL"
NEXT_PUBLIC_APP_URL="$APP_URL"
SEED_ADMIN_EMAIL="$ADMIN_EMAIL"
SEED_ADMIN_PASSWORD="$ADMIN_PASS"
ENVFILE
chmod 600 "$APP_DIR/.env"

# ─── 7. Сборка ─────────────────────────────────────────────
cd "$APP_DIR"
say "Устанавливаю зависимости (пара минут)"
npm ci --silent
say "Синхронизирую базу"
npx prisma db push --skip-generate
npx prisma generate >/dev/null
say "Собираю сайт (это дольше всего)"
npm run build

# ─── 8. Запуск через PM2 ───────────────────────────────────
say "Запускаю приложение"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save >/dev/null
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# ─── 9. nginx ──────────────────────────────────────────────
say "Настраиваю nginx"
cat > /etc/nginx/sites-available/dryleaf <<NGINX
server {
    listen 80;
    server_name $SERVER_NAME;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90s;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX
ln -sf /etc/nginx/sites-available/dryleaf /etc/nginx/sites-enabled/dryleaf
rm -f /etc/nginx/sites-enabled/default
nginx -t >/dev/null && systemctl reload nginx

# ─── 10. Firewall ──────────────────────────────────────────
say "Настраиваю firewall"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

# ─── 11. SSL ───────────────────────────────────────────────
if [ -n "$DOMAIN" ]; then
  say "Выпускаю SSL-сертификат"
  apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect || \
    echo "⚠ SSL не выпустился — проверь, что домен уже указывает на $SERVER_IP, потом: certbot --nginx -d $DOMAIN"
fi

# ─── Готово ────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Готово!"
echo "═══════════════════════════════════════════"
echo "  Сайт:    $APP_URL"
echo "  Админка: $APP_URL/admin/login"
echo "  Логин:   $ADMIN_EMAIL"
echo ""
echo "  Логи:        pm2 logs $APP_NAME"
echo "  Перезапуск:  pm2 restart $APP_NAME"
echo "  Обновление:  bash $APP_DIR/deploy/update.sh"
echo "═══════════════════════════════════════════"
