# Запуск сайта на Cityhost «Хостинг 2.0»

VPS не нужен — на этом тарифе есть Node.js и SSH, Next.js официально поддерживается.

Твои данные (из панели):

- Хостинг: `chf69d2806`, домен `billardermenu.pp.ua`
- SSH-хост: `forle.cityhost.com.ua`
- SSH-логин: `chf69d2806`

---

## Шаг 1. Включить SSH (в панели)

1. Открой: панель → Хостинг 2.0 → Керування → вкладка **SSH**
2. Кнопка **Керування** справа → включи доступ и задай пароль (запиши его).
3. Там же в блоке **Дозволені IP** добавь свой IP (обычно есть кнопка «додати поточний IP»).

## Шаг 2. Включить Node.js (в панели)

1. Панель → Хостинг 2.0 → твой сайт → строка **Node JS** → **Редагувати**
2. Выбери версию **22.x** (если её нет — 24.19.0) → **Зберегти**

## Шаг 3. Залить проект

В PowerShell на своём компьютере:

```
ssh chf69d2806@forle.cityhost.com.ua
```

(пароль из шага 1, при вводе не отображается)

Дальше на сервере:

```
cd www
rm -rf billardermenu.pp.ua
git clone https://github.com/venzyyyk/rezervmenu.git billardermenu.pp.ua
cd billardermenu.pp.ua
```

## Шаг 4. Настройки окружения

Создай файл `.env` (вставь свою строку от Neon вместо `ВСТАВЬ_СЮДА`):

```
cat > .env << 'EOF'
DATABASE_URL="ВСТАВЬ_СЮДА"
NEXTAUTH_SECRET="Kv8mQ2xR7pLnW4tYcJ9bAfE6hUzD3sGi5oNjM1wVqXk="
NEXTAUTH_URL="https://billardermenu.pp.ua"
NEXT_PUBLIC_APP_URL="https://billardermenu.pp.ua"
SEED_ADMIN_EMAIL="admin@dryleaf.local"
SEED_ADMIN_PASSWORD="ПРИДУМАЙ_ПАРОЛЬ"
NODE_ENV="production"
EOF
```

## Шаг 5. Собрать

```
npm install
npx prisma generate
npm run build
```

Сборка идёт 3–7 минут. Если упадёт с ошибкой памяти — напиши мне, соберём локально и зальём готовое.

## Шаг 6. Запустить

В панели: строка **Node JS** → запусти приложение.
Стартовый файл — `server.js` (он уже в проекте), команда запуска — `npm start`.

Сайт: `https://billardermenu.pp.ua`
Админка: `https://billardermenu.pp.ua/admin/login`

## Шаг 7. SSL

Панель → твой сайт → вкладка **SSL** → включить бесплатный Let's Encrypt.

---

## Обновление после моих правок

Ты у себя делаешь `git push`, потом на сервере:

```
cd www/billardermenu.pp.ua
git pull
npm install
npx prisma generate
npm run build
```

и перезапускаешь приложение в панели (кнопка рестарта в строке Node JS).

---

## Важно про QR-коды

Адрес сменился на `billardermenu.pp.ua` — все напечатанные QR со старым адресом
перестанут работать. Перепечатай их из админки → Заклади после переезда.

## Что отключить потом

- Сервис на Render (Settings → Delete Service)
- Пингер на cron-job.org

База Neon остаётся как есть.
