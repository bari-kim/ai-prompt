import { z } from "zod";
import { config } from "./config";

export const promptSchema = z.object({ title: z.string().trim().min(1, "제목을 입력하세요.").max(180), positivePrompt: z.string().trim().min(1, "포지티브 프롬프트를 입력하세요."), negativePrompt: z.string().optional(), visibility: z.enum(["public", "private"]).default("private"), tags: z.string().optional() });
export function parseTags(input = "") { return [...new Map(input.split(",").map((tag) => tag.trim()).filter(Boolean).filter((tag) => tag.length <= 80).map((tag) => [tag.toLocaleLowerCase(), tag])).values()].slice(0, 30); }
export function validateImage(file: File) { if (!config.allowedMimeTypes.includes(file.type)) throw new Error("JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다."); if (file.size > config.maxImageBytes) throw new Error("이미지 파일이 너무 큽니다."); }
