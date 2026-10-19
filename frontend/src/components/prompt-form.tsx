"use client";
import { useState } from "react";
import { savePrompt } from "@/app/admin/actions";

export function PromptForm({ title }: { title: string }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <form action={savePrompt} className="prompt-editor-form">
      <label>제목
        <input name="title" value={title} readOnly aria-describedby="title-hint" />
        <span id="title-hint" className="prompt-field-hint">제목 번호는 저장할 때 자동으로 부여됩니다.</span>
      </label>
      <label>공개 상태
        <select name="visibility" defaultValue="private">
          <option value="private">비공개</option><option value="public">공개</option>
        </select>
      </label>
      <label>포지티브 프롬프트<textarea name="positivePrompt" rows={7} required /></label>
      <label>네거티브 프롬프트<textarea name="negativePrompt" rows={7} /></label>
      <label>태그<input name="tags" placeholder="cinematic, portrait" /></label>
      <label>결과 이미지
        <input type="file" name="images" accept="image/jpeg,image/png,image/webp,image/gif" multiple required aria-describedby="images-hint" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
        <span id="images-hint" className="prompt-field-hint">{files.length}장 선택됨 · 최대 8장 · 첫 이미지가 대표 이미지입니다.</span>
      </label>
      <button className="button prompt-save-button" type="submit">저장하기</button>
    </form>
  );
}
