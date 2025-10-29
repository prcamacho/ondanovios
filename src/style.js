import fs from "fs";
import path from "path";
const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "data/estilo/corpus.md");
const LEXICON = path.join(ROOT, "data/estilo/lexicon.json");
let cachedPairs = [];
let cachedLex = { preferidas: [], evitar: [], muletillas: [] };
function loadCorpus() {
  try {
    const txt = fs.readFileSync(CORPUS, "utf8");
    const lines = txt.split(/\r?\n/);
    const pairs = []; let u=null,a=null;
    for (const line of lines) {
      const mU = /^\s*Usuario\s*:\s*(.*)$/i.exec(line);
      const mA = /^\s*(Vin|Asistente)\s*:\s*(.*)$/i.exec(line);
      if (mU) { u = mU[1]; continue; }
      if (mA && u) { a = mA[2]; pairs.push({ u, a }); u=null;a=null; }
    }
    cachedPairs = pairs;
  } catch { cachedPairs = []; }
}
function loadLexicon(){
  try { cachedLex = JSON.parse(fs.readFileSync(LEXICON, "utf8")); }
  catch { cachedLex = { preferidas: [], evitar: [], muletillas: [] }; }
}
function scoreOverlap(a, b) {
  const tok = (s) => new Set((s||"").toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu,"").split(/\s+/).filter(Boolean));
  const A = tok(a), B = tok(b); let inter = 0; for (const t of A) if (B.has(t)) inter++; return inter / Math.max(1, A.size);
}
export async function buildStyleContext(userText, k = 4) {
  if (!cachedPairs.length) loadCorpus();
  if (!cachedLex.__loaded){ loadLexicon(); cachedLex.__loaded = true; }
  const ranked = cachedPairs
    .map(p => ({ p, s: scoreOverlap(userText, p.u) + scoreOverlap(userText, p.a)*0.5 }))
    .sort((x, y) => y.s - x.s)
    .slice(0, k)
    .map(({ p }) => p);
  const fewshot = [];
  for (const { u, a } of ranked) {
    fewshot.push({ role: "user", content: u });
    fewshot.push({ role: "assistant", content: a });
  }
  const pref = (cachedLex.preferidas||[]).join(", ");
  const avoid = (cachedLex.evitar||[]).join(", ");
  const mu = (cachedLex.muletillas||[]).join(", ");
  const rules = `Estilo obligatorio: pícara y coqueta provocadora, rioplatense, usando el vocativo "Corazón" con naturalidad. ` +
                (pref?`Prioriza estas palabras/giros: ${pref}. `:'') +
                (avoid?`Evita estas palabras: ${avoid}. `:'') +
                (mu?`Puedes espolvorear muletillas: ${mu}. `:'') +
                `Mantén respuestas ágiles, juguetonas, sin caer en lo explícito.`;
  return { fewshot, rules };
}
