import { getAdmin } from "@/lib/auth";
import { listPrompts } from "@/lib/prompt-service";
import { PromptCard } from "@/components/prompt-card";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; tag?: string; sort?: string }> }) {
  const params = await searchParams;
  const admin = Boolean(await getAdmin());
  const items = await listPrompts({ admin, q: params.q, tag: params.tag, sort: params.sort });
  return (
    <main className="gallery home-gallery" aria-label={admin ? "전체 이미지 갤러리" : "공개 이미지 갤러리"}>
      {items.map((item) => (
        <PromptCard key={item.id} prompt={item} admin={admin} imageOnly />
      ))}
    </main>
  );
}
