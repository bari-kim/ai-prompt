import fs from "node:fs/promises";
import path from "node:path";
import { getSqlitePath } from "@/db";

export const LOCAL_IMAGE_PREFIX = "local:";

export function localImagePath(key: string) {
  const parts = key.split("/");
  if (parts.length !== 3 || parts[0] !== "prompts" || parts.some((part) => !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(part))) {
    throw new Error("올바르지 않은 이미지 경로입니다.");
  }
  return path.join(path.dirname(getSqlitePath()), "uploads", ...parts);
}

export async function writeLocalImage(key: string, body: Buffer) {
  const filename = localImagePath(key);
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, body, { flag: "wx" });
  return LOCAL_IMAGE_PREFIX + key;
}

export async function deleteLocalImage(key: string) {
  await fs.rm(localImagePath(key), { force: true });
}

export async function readLocalImage(key: string) {
  return fs.readFile(localImagePath(key));
}
