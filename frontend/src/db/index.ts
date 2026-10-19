import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

type DbGlobals = { sqlite?: Database.Database; db?: ReturnType<typeof drizzle>; schemaVersion?: number };
const globalForDb = globalThis as typeof globalThis & DbGlobals;

function frontendRoot() {
  return path.basename(process.cwd()).toLowerCase() === "frontend" ? process.cwd() : path.join(process.cwd(), "frontend");
}
function databasePath() {
  const configured = process.env.SQLITE_DB_PATH;
  return configured ? path.resolve(frontendRoot(), configured) : path.join(frontendRoot(), "data", "prompt-archive.sqlite");
}
function ensureSchema(sqlite: Database.Database) {
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec([
    "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at)",
    "CREATE TABLE IF NOT EXISTS prompts (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, positive_prompt TEXT NOT NULL, negative_prompt TEXT, visibility TEXT NOT NULL DEFAULT 'private', view_count INTEGER NOT NULL DEFAULT 0, positive_copy_count INTEGER NOT NULL DEFAULT 0, negative_copy_count INTEGER NOT NULL DEFAULT 0, slug TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, CHECK (visibility IN ('public', 'private')))",
    "CREATE INDEX IF NOT EXISTS prompts_visibility_idx ON prompts (visibility)",
    "CREATE INDEX IF NOT EXISTS prompts_created_idx ON prompts (created_at)",
    "CREATE INDEX IF NOT EXISTS prompts_popular_idx ON prompts (positive_copy_count, negative_copy_count)",
    "CREATE TABLE IF NOT EXISTS prompt_images (id TEXT PRIMARY KEY NOT NULL, prompt_id TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE, object_key TEXT NOT NULL, mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, is_cover INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS prompt_images_prompt_idx ON prompt_images (prompt_id)",
    "CREATE INDEX IF NOT EXISTS prompt_images_cover_idx ON prompt_images (prompt_id, is_cover)",
    "CREATE TABLE IF NOT EXISTS tags (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, normalized_name TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS prompt_tags (prompt_id TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE, tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (prompt_id, tag_id))",
    "CREATE INDEX IF NOT EXISTS prompt_tags_prompt_idx ON prompt_tags (prompt_id)",
    "CREATE INDEX IF NOT EXISTS prompt_tags_tag_idx ON prompt_tags (tag_id)",
    "CREATE TABLE IF NOT EXISTS prompt_sequence (id INTEGER PRIMARY KEY CHECK (id = 1), value INTEGER NOT NULL)",
    "INSERT OR IGNORE INTO prompt_sequence (id, value) SELECT 1, MAX(COUNT(*), COALESCE(MAX(CASE WHEN title LIKE '프롬프트 %' THEN CAST(SUBSTR(title, 6) AS INTEGER) ELSE 0 END), 0)) FROM prompts"
  ].join(";\n"));
}
export function getDb() {
  if (!globalForDb.db) {
    const filename = databasePath();
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    globalForDb.sqlite = new Database(filename);
    globalForDb.db = drizzle(globalForDb.sqlite);
  }
  if (globalForDb.sqlite && globalForDb.schemaVersion !== 1) {
    ensureSchema(globalForDb.sqlite);
    globalForDb.schemaVersion = 1;
  }
  return globalForDb.db;
}
export function getSqlitePath() { return databasePath(); }
