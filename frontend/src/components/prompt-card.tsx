import Link from "next/link";

type Prompt = { id:string; slug:string; title:string; viewCount:number; positiveCopyCount:number; tags?:string[]; cover?:{url:string|null}|null };

export function PromptCard({ prompt, admin = false, imageOnly = false }: { prompt: Prompt; admin?: boolean; imageOnly?: boolean }) {
  const tags = (prompt.tags || []).slice(0, 4).map((tag) => `#${tag}`).join(" ");
  return (
    <Link className="gallery-card" href={admin ? `/admin/prompts/${prompt.id}/edit` : `/prompts/${prompt.slug}`} aria-label={prompt.title}>
      <img src={prompt.cover?.url || "/placeholder-1.svg"} alt="" />
      <div className="gallery-overlay"><h3>{prompt.title}</h3>{!imageOnly && <p>{tags}</p>}</div>
      {!imageOnly && <>
        <div className="mobile-card-info"><h3>{prompt.title}</h3><p>{tags}</p></div>
      </>}
    </Link>
  );
}
