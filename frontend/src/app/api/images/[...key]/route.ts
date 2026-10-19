import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { promptImages, prompts } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { LOCAL_IMAGE_PREFIX, localImagePath, readLocalImage } from "@/lib/local-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.join("/");
  try {
    localImagePath(objectKey);
  } catch {
    return new Response(null, { status: 404 });
  }
  const image = getDb().select({ mimeType: promptImages.mimeType, visibility: prompts.visibility })
    .from(promptImages).innerJoin(prompts, eq(promptImages.promptId, prompts.id))
    .where(eq(promptImages.objectKey, LOCAL_IMAGE_PREFIX + objectKey)).get();
  if (!image || (image.visibility !== "public" && !(await getAdmin()))) {
    return new Response(null, { status: 404 });
  }
  try {
    const body = await readLocalImage(objectKey);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": image.mimeType,
        "Content-Length": String(body.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Response(null, { status: 404 });
    throw error;
  }
}
