import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { listPrompts } from "@/lib/prompt-service";
import { PromptCard } from "@/components/prompt-card";
import { logoutAction } from "./logout-action";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Admin({ searchParams }: { searchParams: Promise<{ visibility?: string }> }) {
  if (!(await getAdmin())) redirect("/admin/login");
  const params = await searchParams;
  const visibility = params.visibility === "public" || params.visibility === "private" ? params.visibility : undefined;
  const items = await listPrompts({ admin: true, visibility });
  const filters = [
    { label: "전체", href: "/admin", active: !visibility },
    { label: "공개", href: "/admin?visibility=public", active: visibility === "public" },
    { label: "비공개", href: "/admin?visibility=private", active: visibility === "private" },
  ];

  return <>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div><p className="eyebrow">PRIVATE CONTROL ROOM</p><h1 className="mt-3 text-5xl font-bold">내 프롬프트</h1></div>
      <div className="flex shrink-0 items-center gap-2">
        <Link className="admin-control" href="/admin/prompts/new">+ 새 기록</Link>
        <form action={logoutAction} className="flex items-center">
          <button type="submit" className="admin-control">로그아웃</button>
        </form>
      </div>
    </div>
    <nav className="mb-7 flex gap-2" aria-label="공개 상태 필터">
      {filters.map((filter) => (
        <Link key={filter.href} href={filter.href} className="admin-control" aria-current={filter.active ? "page" : undefined}>
          {filter.label}
        </Link>
      ))}
    </nav>
    <section className="admin-gallery grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => <PromptCard key={item.id} prompt={item} admin />)}
    </section>
  </>;
}
