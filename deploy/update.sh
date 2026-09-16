#!/usr/bin/env bash
# Обновление сайта после git push. Запуск: bash /var/www/dryleaf/deploy/update.sh
set -e

APP_DIR="/var/www/dryleaf"
APP_NAME="dryleaf"

say() { echo -e "\n\033[1;32m▸ $1\033[0m"; }

cd "$APP_DIR"

say "Забираю обновления с GitHub"
git pull

say "Зависимости"
npm ci --silent

say "База и Prisma"
npx prisma db push --skip-generate
npx prisma generate >/dev/null

say "Сборка"
npm run build

say "Перезапуск"
pm2 restart "$APP_NAME" --update-env
pm2 save >/dev/null

echo -e "\n✅ Обновлено. Логи: pm2 logs $APP_NAME\n"
