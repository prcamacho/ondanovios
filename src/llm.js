import { OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL } from "./config.js";
import fetch from "node-fetch";
export async function getReply(system, messages) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "DUMMY_TEMP") {
    // Modo de prueba sin API: devolver respuesta placeholder
    return "Mi respuesta de prueba (API no configurada aún).";
  }
  const body = { model: OPENAI_MODEL, messages: [{ role: "system", content: system }, ...messages], temperature: 0.85 };
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI-like API error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || "...";
}
