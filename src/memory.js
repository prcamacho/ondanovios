import Database from "better-sqlite3";
import { MEMORY_MESSAGE_LIMIT } from "./config.js";
let db;
export function ensureDb() {
  if (!db) {
    db = new Database("data/bot.db");
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY,
        username TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        role TEXT CHECK(role IN ('user','assistant')),
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS profiles(
        user_id INTEGER PRIMARY KEY,
        summary TEXT DEFAULT ''
      );
    `);
  }
}
export async function saveMessage(user, role, content) {
  ensureDb();
  db.prepare("INSERT OR IGNORE INTO users(id, username) VALUES (?, ?)").run(user.id, user.username || null);
  db.prepare("INSERT INTO messages(user_id, role, content) VALUES (?, ?, ?)").run(user.id, role, content);
  const count = db.prepare("SELECT COUNT(1) as c FROM messages WHERE user_id = ?").get(user.id).c;
  if (count > MEMORY_MESSAGE_LIMIT) {
    const toDelete = count - MEMORY_MESSAGE_LIMIT;
    db.prepare("DELETE FROM messages WHERE id IN (SELECT id FROM messages WHERE user_id = ? ORDER BY id ASC LIMIT ?)").run(user.id, toDelete);
  }
}
export async function getRecentHistory(userId) {
  ensureDb();
  const msgs = db.prepare("SELECT role, content FROM messages WHERE user_id = ? ORDER BY id ASC").all(userId);
  const profile = db.prepare("SELECT summary FROM profiles WHERE user_id = ?").get(userId)?.summary || "";
  return { messages: msgs, profile };
}
export async function wipeUser(user) {
  ensureDb();
  db.prepare("DELETE FROM messages WHERE user_id = ?").run(user.id);
  db.prepare("DELETE FROM profiles WHERE user_id = ?").run(user.id);
}
