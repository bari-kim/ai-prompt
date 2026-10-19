import { notFound, redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { getPrompt } from "@/lib/prompt-service";
import { EditPromptForm } from "@/components/edit-prompt-form";

export const metadata = { robots: { index: false, follow: false } };

export default async function EditPrompt({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) redirect("/admin/login");
  const { id } = await params;
  const prompt = await getPrompt(id, true);
  if (!prompt) notFound();
  return <div className="prompt-editor"><h1>프롬프트 수정</h1><EditPromptForm prompt={prompt} /></div>;
}
