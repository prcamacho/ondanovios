import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID } from "./config.js";
import { getReply } from "./llm.js";
import { ensureDb, saveMessage, getRecentHistory, wipeUser } from "./memory.js";
import { detectIntent } from "./intents.js";
import { servicePitch } from "./services.js";
import { buildStyleContext } from "./style.js";
import fs from "fs";
import { checkExplicitQuestion } from "./safety.js";

function kbEncuentroOVip() {
  return {
    inline_keyboard: [[
      { text: '👩‍❤️‍💋‍👨 Encuentro', callback_data: 'opt:encuentro' },
      { text: '🔞 Contenido VIP', callback_data: 'opt:vip' }
    ]]
  };
}

function kbVipPago(mpLink) {
  const rows = [];
  if (mpLink) rows.push([{ text: '💳 Pagar VIP', url: mpLink }]); // botón abre URL directo
  rows.push([
    { text: 'ℹ️ Qué incluye', callback_data: 'vip:info' },
    { text: '⬅️ Volver', callback_data: 'back:root' },
  ]);
  return { inline_keyboard: rows };
}

function kbEncuentroAcciones() {
  return {
    inline_keyboard: [[
      { text: '🕒 Ver precios', callback_data: 'enc:precios' },
      { text: '📅 Reservar',   callback_data: 'enc:reservar' }
    ],[
      { text: '⬅️ Volver', callback_data: 'back:root' }
    ]]
  };
}


export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

function humanize(text) {
  let t = String(text || '');

  // 1) bajar formalidad: minúsculas al inicio de frase a veces
  if (Math.random() < 0.6) {
    t = t.replace(/(^|\n)([A-ZÁÉÍÓÚÑ])/g, (m, pre, ch) => pre + ch.toLowerCase());
  }

  // 2) reducir puntuación perfecta
  if (Math.random() < 0.6) {
    t = t.replace(/\.\s+/g, ' ');        // quita algunos puntos
    t = t.replace(/,{1}\s+/g, ' ');      // quita algunas comas
  }

  // 3) reemplazos suaves de estilo
  const swaps = [
    [/ de\s+hecho/gi, ' la verdad'],
    [/ sin\s+embargo/gi, ' igual'],
    [/ además/gi, ' y también'],
    [/ entonces/gi, ' así que'],
  ];
  swaps.forEach(([re, rep]) => { if (Math.random() < 0.4) t = t.replace(re, rep); });

  // 4) muletillas muy leves y aleatorias
  if (Math.random() < 0.35) t = (Math.random() < 0.5 ? 'mmm ' : 'ok… ') + t;

  // 5) espaciado final y evitar vacío
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t || 'mmm';
}

// Heurística simple para “sólo emojis/puntuación”
function isOnlyEmojiLike(s) {
  return /^[\p{P}\s\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+$/u.test(s || "");
}
function isTrivial(text) {
  const t = (text || "").trim().toLowerCase();
  if (!t) return true;
  if (t.length <= 3 && /^(ok|si|sí|ya|va|dale|aja|aha|ey)$/.test(t)) return true;
  if (/^(gracias|grcs|ty|okey|okay|thanks|👌|👍|✨|❤️|😍|jaja|jeje|jajaj|jajj)$/.test(t)) return true;
  if (isOnlyEmojiLike(t)) return true;
  return false;
}
export async function launchBot() {
  ensureDb();
  bot.start(async (ctx) => {
    await saveMessage(ctx.from, "user", "/start");
    const intro = `Hola ${ctx.from.first_name || ""}… soy **Vin**. Si sos mayor de 18 y te copa un tono juguetón, quedate conmigo 😉
Contame algo de vos, **Corazón**.`;
    await ctx.reply(intro);
  });
  // Comando oculto de privacidad
  bot.command("borrar", async (ctx) => {
    await wipeUser(ctx.from);
    await ctx.reply("Listo, Corazón: tu historial y perfil se borraron.");
  });
  // Respuesta mínima a stickers (cero tokens)
  bot.on("sticker", async (ctx) => {
    await ctx.reply("💋");
  });
  bot.on("message", async (ctx) => {
    const user = ctx.from;
    const text = ctx.message?.text || "";

    // Filtro de preguntas explícitas (responde y corta; sin notificar)
// Filtro explícito (antes de intents/LLM)
if (text) {
  const exp = checkExplicitQuestion(text);
  if (exp) {
    const replyText = exp.reply;
    await saveMessage(ctx.from, "user", text);
    await saveMessage(ctx.from, "assistant", replyText);

    // Si es explícito o crudo, ofrezco dos caminos: Encuentro / VIP
    await ctx.reply(replyText, { reply_markup: kbEncuentroOVip() });
    return; // no pasa al LLM ni a intents
  }
}


    if (!text && !ctx.message?.sticker) return;
    // 0) Filtrar mensajes “vacíos” para no gastar tokens
    if (text && isTrivial(text)) {
      await ctx.reply("mmm 😊");
      return;
    }
    if (text) await saveMessage(user, "user", text);
    // 1) Intenciones (compra / encuentro)
    const intent = text ? await detectIntent(text) : { type: "SMALLTALK" };
    if (intent.type === "ENCOUNTER_INTENT") {
      // Notificar al admin de forma inmediata
      const handle = user.username ? `@${user.username}` : `${user.first_name || ""} ${user.last_name || ""}`;
      const adminMsg = `📍 *Posible encuentro*
Usuario: ${handle} (id:${user.id})
Texto: ${text}`;
      if (ADMIN_CHAT_ID) {
        try { await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: "Markdown" }); } catch {}
      }
      // Responder al usuario con info del servicio
      await ctx.reply(servicePitch('encuentro'));
      return;
    }
    if (intent.type === "BUY_INTENT") {
  // 1) Notificación al admin (texto plano para evitar errores de Markdown)
  const handle =
    user.username ? `@${user.username}` : `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const adminMsg =
    `🛎️ Interés de compra\n` +
    `Usuario: ${handle} (id:${user.id})\n` +
    `Texto: ${text}\n` +
    `Inferido: ${intent.payload?.service || "desconocido"}`;

  if (ADMIN_CHAT_ID) {
    try { await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg); } catch {}
  }

  // 2) Respuesta al usuario con teclados según el servicio
  const base = servicePitch(intent.payload?.service);
  const mp = process.env.MP_VIP_LINK || "";
  const svc = (intent.payload?.service || "").toLowerCase();

  if (svc.includes("vip")) {
    // VIP → botones de pago/info
    await ctx.reply(base, { reply_markup: kbVipPago(mp) });
  } else if (svc.includes("encuentro")) {
    // Encuentro → ver precios / reservar
    await ctx.reply(base, { reply_markup: kbEncuentroAcciones() });
  } else {
    // No se clasificó bien → mostrar ambas rutas
    await ctx.reply(base, { reply_markup: kbEncuentroOVip() });
  }
  return;
}

    // 2) Memoria + estilo (LLM)
    const { messages, profile } = await getRecentHistory(user.id);
    const style = await buildStyleContext(text || "");
    const system = [
      fs.readFileSync("src/prompts/system.txt", "utf8").trim(),
      `
Perfil del usuario (resumen):
${profile}`,
      `
${style.rules}`
    ].join("");
    const chatMessages = [
      ...style.fewshot,
      ...messages,
      ...(text ? [{ role: "user", content: text }] : [])
    ];
    const raw = await getReply(system, chatMessages);
const reply = humanize(raw);

await saveMessage(user, "assistant", reply);
await ctx.reply(reply);
  });
  await bot.launch();
  console.log("Bot de Telegram iniciado ✅");
}


bot.on('callback_query', async (ctx) => {
  try {
    const data = ctx.callbackQuery?.data || '';
    const mp = process.env.MP_VIP_LINK || '';

    switch (data) {
      case 'opt:vip':
        await ctx.answerCbQuery(); // quita “relojito”
        await ctx.editMessageReplyMarkup(); // limpia teclado anterior (opcional)
        await ctx.reply(
          servicePitch('vip'),
          { reply_markup: kbVipPago(mp) }
        );
        break;

      case 'opt:encuentro':
        await ctx.answerCbQuery();
        await ctx.editMessageReplyMarkup();
        await ctx.reply(
          servicePitch('encuentro'),
          { reply_markup: kbEncuentroAcciones() }
        );
        break;

      case 'vip:info':
        await ctx.answerCbQuery();
        await ctx.reply(servicePitch('vip'));
        break;

      case 'enc:precios':
        await ctx.answerCbQuery();
        await ctx.reply(servicePitch('encuentro'));
        break;

      case 'enc:reservar':
        await ctx.answerCbQuery();
        await ctx.reply(
          'dale, para reservar necesito:\n• día y franja horaria\n• zona de donde venís\n\nsi hay seña, te paso alias/MP y reservo 😉'
        );
        break;

      case 'back:root':
        await ctx.answerCbQuery();
        await ctx.reply('te dejo las dos opciones:', { reply_markup: kbEncuentroOVip() });
        break;

      default:
        await ctx.answerCbQuery(); // ignora
    }
  } catch (err) {
    console.error('callback error', err);
  }
});
