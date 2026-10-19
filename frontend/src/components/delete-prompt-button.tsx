"use client";

import { useFormStatus } from "react-dom";
import { deletePrompt } from "@/app/admin/actions";

function DeleteButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-control admin-delete-button" disabled={pending} aria-label={`${title} 삭제`}>
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}

export function DeletePromptButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deletePrompt.bind(null, id)} onSubmit={(event) => {
      if (!window.confirm(`‘${title}’ 기록을 삭제할까요? 프롬프트와 첨부 이미지가 삭제되며 복구할 수 없습니다.`)) {
        event.preventDefault();
      }
    }}>
      <DeleteButton title={title} />
    </form>
  );
}
