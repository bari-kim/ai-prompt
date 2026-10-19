import crypto from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { sessions } from "@/db/schema";

const COOKIE = "prompt_archive_session";
const hash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
export async function createSession() { const token = crypto.randomBytes(32).toString("hex"); await getDb().insert(sessions).values({ id: crypto.randomUUID(), tokenHash: hash(token), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) }); (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 }); }
export async function getAdmin() { const token = (await cookies()).get(COOKIE)?.value; if (!token) return null; const rows = await getDb().select({ id: sessions.id }).from(sessions).where(and(eq(sessions.tokenHash, hash(token)), gt(sessions.expiresAt, new Date()))).limit(1); return rows[0] || null; }
export async function destroySession() { const jar = await cookies(); const token = jar.get(COOKIE)?.value; if (token) await getDb().delete(sessions).where(eq(sessions.tokenHash, hash(token))); jar.delete(COOKIE); }
