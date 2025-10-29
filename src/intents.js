import { getReply } from "./llm.js";
// Señales de compra (servicios en general, inclusión VIP discreto)
const BUY_HINTS = [
  "comprar","precio","pago","tarifa","suscrib","vip","grupo","contenido","live","lives",
  "video","fotos","exclusivo","premium","reservar"
];
// Señales de interés de ENCUENTRO (notificar admin)
const ENCOUNTER_HINTS = [
  "vernos","cita","presencial","encuentro","salir","verme","vernos en",
  "departamento","depto","direccion","dirección",
  "queres que vaya","quieres que vaya","voy","ahi voy","ahí voy",
  "en camino","llego","estoy llegando","toque timbre","tocando timbre"
];
export async function detectIntent(text) {
  const t = (text || "").toLowerCase();
  if (ENCOUNTER_HINTS.some(k => t.includes(k))) {
    return { type: "ENCOUNTER_INTENT" };
  }
  if (BUY_HINTS.some(k => t.includes(k))) {
    try {
      const cls = await getReply(
        'Clasifica intención de compra y servicio probable (incluye "VIP" y "encuentro"). Responde JSON {"buy":boolean,"service":string|null}',
        [{ role: "user", content: t }]
      );
      const parsed = safeJson(cls);
      if (parsed?.buy) return { type: "BUY_INTENT", payload: { service: parsed.service || null } };
    } catch {}
    return { type: "BUY_INTENT", payload: { service: null } };
  }
  return { type: "SMALLTALK" };
}
function safeJson(s){ try { return JSON.parse(s); } catch { return null; } }
