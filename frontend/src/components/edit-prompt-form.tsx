"use client";
import { useState } from "react";
import { updatePrompt } from "@/app/admin/actions";
import { DeletePromptButton } from "@/components/delete-prompt-button";

type Image = { id: string; url: string | null; isCover: boolean };
type Prompt = { id: string; title: string; positivePrompt: string; negativePrompt: string | null; visibility: "public" | "private"; tags?: { name: string }[] | string[]; images: Image[] };

export function EditPromptForm({ prompt }: { prompt: Prompt }) {
  const [images, setImages] = useState(prompt.images);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const active = images.filter((image) => !deleted.includes(image.id));
  const formId = `edit-prompt-${prompt.id}`;
  const move = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= active.length) return;
    const next = [...images], a = images.indexOf(active[index]), b = images.indexOf(active[target]);
    [next[a], next[b]] = [next[b], next[a]];
    setImages(next);
  };

  return <>
    <form id={formId} action={updatePrompt.bind(null, prompt.id)} className="prompt-editor-form">
      <label>제목<input name="title" defaultValue={prompt.title} required /></label>
      <label>공개 상태
        <select name="visibility" defaultValue={prompt.visibility}>
          <option value="private">비공개</option><option value="public">공개</option>
        </select>
      </label>
      <label>포지티브 프롬프트<textarea name="positivePrompt" rows={7} defaultValue={prompt.positivePrompt} required /></label>
      <label>네거티브 프롬프트<textarea name="negativePrompt" rows={7} defaultValue={prompt.negativePrompt || ""} /></label>
      <label>태그<input name="tags" defaultValue={(prompt.tags || []).map((tag) => typeof tag === "string" ? tag : tag.name).join(", ")} /></label>
      <div>
        <p className="mb-3 text-sm font-semibold">결과 이미지</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {active.map((image, index) => (
            <div className="min-w-0 rounded-lg border border-[var(--border)] p-2" key={image.id}>
              <img className="aspect-square w-full rounded object-cover" src={image.url || "/placeholder-1.svg"} alt={`결과 이미지 ${index + 1}`} />
              <button type="button" className="mt-2 w-full text-xs" onClick={() => setImages(images.map((item) => ({ ...item, isCover: item.id === image.id })))}>
                {image.isCover ? "대표 이미지" : "대표로 지정"}
              </button>
              <div className="mt-1 flex gap-1">
                <button type="button" className="w-1/2 text-xs disabled:opacity-30" disabled={index === 0} aria-label="이미지 앞으로 이동" onClick={() => move(index, -1)}>←</button>
                <button type="button" className="w-1/2 text-xs disabled:opacity-30" disabled={index === active.length - 1} aria-label="이미지 뒤로 이동" onClick={() => move(index, 1)}>→</button>
              </div>
              <button type="button" className="mt-1 w-full text-xs text-red-700" onClick={() => setDeleted([...deleted, image.id])}>이미지 삭제</button>
            </div>
          ))}
        </div>
      </div>
      <label>이미지 추가
        <input type="file" name="images" accept="image/jpeg,image/png,image/webp,image/gif" multiple aria-describedby="edit-images-hint" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
        <span id="edit-images-hint" className="prompt-field-hint">기존 {active.length}장 · 새 이미지 {files.length}장 선택됨 · 최대 8장</span>
      </label>
      <input type="hidden" name="deleteImageIds" value={deleted.join(",")} />
      <input type="hidden" name="imageOrder" value={active.map((image) => image.id).join(",")} />
      <input type="hidden" name="coverImageId" value={active.find((image) => image.isCover)?.id || active[0]?.id || ""} />
    </form>
    <div className="mt-5 flex items-center justify-end gap-2">
      <button type="submit" form={formId} className="admin-control admin-save-button">수정 저장</button>
      <DeletePromptButton id={prompt.id} title={prompt.title} />
    </div>
  </>;
}
