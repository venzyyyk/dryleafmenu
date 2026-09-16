// Запуск Next.js через собственный HTTP-сервер.
// Нужен для хостингов, где приложение слушает unix-сокет (Cityhost «Хостинг 2.0»).
// Локально и на обычных хостингах PORT — число, тогда слушаем порт.
const next = require("next");
const fs = require("fs");
const http = require("http");

const target = process.env.PORT || 3000;
const isSocket = typeof target === "string" && Number.isNaN(Number(target));
const dev = process.env.NODE_ENV === "development";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  // Старый сокет мог остаться после падения — убираем
  if (isSocket && fs.existsSync(target)) {
    fs.unlinkSync(target);
  }

  server.listen(isSocket ? target : Number(target), () => {
    if (isSocket) {
      fs.chmodSync(target, "0777");
      console.log(`▸ Next.js слухає сокет ${target}`);
    } else {
      console.log(`▸ Next.js слухає порт ${target}`);
    }
  });
});
