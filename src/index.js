import { PORT, assertRequired } from "./config.js";
import { launchBot } from "./bot.js";
import http from "http";

function startHealth(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((_, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("OK");
    });
    server.on("error", (err) => {
      console.error("[health:error]", err.code || err.message);
      reject(err);
    });
    // Forzamos bind explícito al loopback
    server.listen(port, "127.0.0.1", () => {
      console.log(`[health] escuchando en http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

(async () => {
  try {
    assertRequired(); // ya tenés las vars cargadas
    await startHealth(PORT || 3000); // levanta health ANTES
    await launchBot();               // y luego el bot
    console.log("Bot de Telegram iniciado ✅");
  } catch (err) {
    console.error("[fatal]", err?.message || err);
    process.exit(1);
  }
})();
