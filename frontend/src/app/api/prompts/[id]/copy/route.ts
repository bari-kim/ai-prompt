import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { prompts } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (await getAdmin()) return NextResponse.json({ ok: true });
  const { field } = await request.json().catch(() => ({}));
  const db = getDb();
  const target = await db.select({ id: prompts.id, positiveCopyCount: prompts.positiveCopyCount, negativeCopyCount: prompts.negativeCopyCount }).from(prompts).where(and(eq(prompts.id, id), eq(prompts.visibility, "public"))).limit(1);
  if (!target[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (field === "all") await db.update(prompts).set({ positiveCopyCount: target[0].positiveCopyCount + 1, negativeCopyCount: target[0].negativeCopyCount + 1 }).where(eq(prompts.id, id));
  else if (field === "negative") await db.update(prompts).set({ negativeCopyCount: target[0].negativeCopyCount + 1 }).where(eq(prompts.id, id));
  else await db.update(prompts).set({ positiveCopyCount: target[0].positiveCopyCount + 1 }).where(eq(prompts.id, id));
  return NextResponse.json({ ok: true });
}
