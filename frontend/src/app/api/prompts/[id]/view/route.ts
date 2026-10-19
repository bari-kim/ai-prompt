import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { prompts } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (await getAdmin()) return NextResponse.json({ ok: true });
  const db = getDb();
  const target = await db.select({ id: prompts.id, viewCount: prompts.viewCount }).from(prompts).where(and(eq(prompts.id, id), eq(prompts.visibility, "public"))).limit(1);
  if (!target[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.update(prompts).set({ viewCount: target[0].viewCount + 1 }).where(eq(prompts.id, id));
  return NextResponse.json({ ok: true });
}
