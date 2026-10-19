import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { PromptForm } from "@/components/prompt-form";
import { getNextPromptTitle } from "@/lib/prompt-number";

export const metadata = { robots: { index: false, follow: false } };

export default async function NewPrompt() {
  if (!(await getAdmin())) redirect("/admin/login");
  return <div className="prompt-editor"><h1>새 프롬프트 기록</h1><PromptForm title={getNextPromptTitle()} /></div>;
}
