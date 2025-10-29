import dotenv from "dotenv";
dotenv.config();
function requireEnv(key) {
  const v = process.env[key];
  if (!v) console.warn(`[WARN] Falta variable de entorno: ${key}`);
  return v;
}
export const TELEGRAM_BOT_TOKEN = requireEnv("TELEGRAM_BOT_TOKEN");
export const ADMIN_CHAT_ID = requireEnv("ADMIN_CHAT_ID");
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const MEMORY_MESSAGE_LIMIT = parseInt(process.env.MEMORY_MESSAGE_LIMIT || "50", 10);
export const PORT = parseInt(process.env.PORT || "3000", 10);
export function assertRequired() {
  const missing = ["TELEGRAM_BOT_TOKEN", "ADMIN_CHAT_ID", "OPENAI_API_KEY"].filter(
    (k) => !process.env[k] || process.env[k] === ""
  );
  if (missing.length) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(", ")}`);
  }
}
