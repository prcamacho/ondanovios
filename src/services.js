// src/services.js

// === Precios y seña (editables) ===
const PRICE_15 = 30000;   // 15 min
const PRICE_30 = 45000;   // 30 min
const PRICE_60 = 90000;   // 1 hora
const DEPOSIT  = 2000;    // seña para reservar (si usás seña)


function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function listServices() {
  const variants = [
    `tengo *VIP privado*, *Encuentro* y *Audios*, corazón. decime cuál te tienta y te paso precio y cómo accedés.`,
    `manejo tres cositas: *VIP privado*, *Encuentro* y *Audios*. querés que te cuente rapidito cada uno?`,
    `hay *VIP privado*, *Encuentro* y *Audios*. si me decís uno, te mando info concreta (precio + forma de pago).`
  ];
  return pick(variants);
}

export function servicePitch(svc) {
  const s = (svc || '').toLowerCase();
  if (s.includes('vip') || s.includes('grupo')) return pitchVIP();
  if (s.includes('encuentro') || s.includes('presencial') || s.includes('depto') || s.includes('departamento')) return pitchEncuentro();
  if (s.includes('audio')) return pitchAudios();
  // default: si no supo clasificar, presentá corto y pedí señal
  return listServices();
}

function pitchVIP() {
  const variants = [
    `vip privado: acceso a contenido y transmisiones privadas + prioridad para charlar conmigo. pago: transferencia/billetera. cuando acreditás te paso link.`,
    `el vip es un espacio cerrado: contenido + lives y trato más cercano. se abona por mes y al acreditarse te comparto el acceso.`,
    `mi vip: contenido privado, vivos tranquilos y más cercanía. se paga por mes; una vez acreditado te mando el link por privado.`
  ];
  return pick(variants);
}

function pitchEncuentro() {
  const p15 = PRICE_15 >= 1000 ? (PRICE_15 === 30000 ? '30 mil' : Math.round(PRICE_15/1000)+'k') : PRICE_15.toString();
  const p30 = PRICE_30 >= 1000 ? (PRICE_30 === 45000 ? '45 mil' : Math.round(PRICE_30/1000)+'k') : PRICE_30.toString();
  const p60 = PRICE_60 >= 1000 ? (PRICE_60 === 90000 ? '90 mil' : Math.round(PRICE_60/1000)+'k') : PRICE_60.toString();
  const sena = DEPOSIT >= 1000 ? (DEPOSIT/1000 + 'k') : DEPOSIT.toString();

  const variants = [
    `la modalidad es “convencional / onda novios” corazon: Oral + Vag, mimos y besos si hay buena higiene. siempre con protección. valores:
15 min → ${p15}
30 min → ${p30}
1 hora → ${p60}
se reserva con seña de ${sena}. extras aparte; info extendida en vinsalta.com. si querés, pasame dia y hora y vemos.`,

    `es presencial y tipo “onda novios”, con conexión real y cuidado. incluye besos si hay buena higiene y todo con protección corazon. orientativo:
15 min → ${p15}
30 min → ${p30}
1h → ${p60}
reserva con seña (${sena}) y el resto el día de la cita. extras aparte. que dia vendrias?`,

    `encuentro íntimo, clima cariñoso y respeto. besos si hay buena higiene; todo con protección. valores:
15 min → ${p15}
30 min → ${p30}
1h → ${p60}
para reservar uso una seña de ${sena} corazon. extras van aparte; más detalle en vinsalta.com. cuando te gustaria venir?`,

    `si te interesa un encuentro corazon, coordinamos día y horario. manejo reserva con seña (${sena}) y el resto el día de la cita. valores:
15 min → ${p15}
30 min → ${p30}
1h → ${p60}
extras aparte. Te gustaria reservar?.`
  ];
  return pick(variants);
}


function pitchAudios() {
  const variants = [
    `audios: te grabo uno a tu nombre con el tono que te gusta. te paso precio por unidad y te llega dentro de 24h.`,
    `también hago audios personalizados. son por unidad, con entrega rápida. si te copan, te digo el valor ahora.`,
    `audiecitos a medida: te nombro y juego con tu estilo. te paso precio y listo.`
  ];
  return pick(variants);
}
