import nextEnv from "@next/env";
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
nextEnv.loadEnvConfig(root);
const output = path.resolve(root, "../pages-site");
const staging = path.resolve(root, "../.pages-site-staging");
const dbPath = path.resolve(root, process.env.SQLITE_DB_PATH || "data/prompt-archive.sqlite");
const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
type Prompt = { id: string; title: string; slug: string; positive_prompt: string; negative_prompt: string | null; created_at: number };
type Image = { object_key: string; is_cover: number };

function document(title: string, body: string, prefix: string) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><link rel="stylesheet" href="${prefix}assets/site.css"><script defer src="${prefix}assets/site.js"></script></head><body><div class="site-shell"><header class="site-header"><a class="logo" href="${prefix}index.html"><span class="logo-mark">✦</span> AI PROMPT ARCHIVE</a></header>${body}</div></body></html>`;
}

async function main() {
  // Open read-only: exporting never creates a new database or changes local content.
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    await fs.rm(staging, { recursive: true, force: true });
    await fs.mkdir(path.join(staging, "assets/images"), { recursive: true });
    const prompts = db.prepare("SELECT id,title,slug,positive_prompt,negative_prompt,created_at FROM prompts WHERE visibility = 'public' ORDER BY created_at DESC").all() as Prompt[];
    const cards: string[] = [];
    let imageCount = 0;
    for (const prompt of prompts) {
      const slug = createHash("sha256").update(prompt.slug).digest("hex").slice(0, 24);
      // Slugs become directory names; reject dot segments and separators on Windows too.
      if (!prompt.slug || /[\\/]/.test(prompt.slug) || /^\.+$/.test(prompt.slug)) throw new Error("Invalid prompt slug");
      const images = db.prepare("SELECT object_key,is_cover FROM prompt_images WHERE prompt_id = ? ORDER BY sort_order ASC").all(prompt.id) as Image[];
      const urls: string[] = [];
      for (const image of images) {
        if (!image.object_key.startsWith("local:")) throw new Error("R2 image found. Download it into local storage before exporting.");
        const parts = image.object_key.slice(6).split("/");
        if (parts.length !== 3 || parts[0] !== "prompts" || parts.some((part) => !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(part))) throw new Error("Invalid local image path");
        const ext = path.extname(parts[2]).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) throw new Error("Unsupported image type");
        const filename = `${imageCount++}${ext}`;
        await fs.copyFile(path.join(path.dirname(dbPath), "uploads", ...parts), path.join(staging, "assets/images", filename));
        urls.push(`assets/images/${filename}`);
      }
      const cover = urls[images.findIndex((image) => image.is_cover)] || urls[0] || "assets/placeholder.svg";
      cards.push(`<a class="gallery-card" href="prompts/${slug}/index.html" aria-label="${escape(prompt.title)}"><img src="${cover}" alt="" loading="lazy"><div class="gallery-overlay"><h3>${escape(prompt.title)}</h3></div></a>`);
      const tags = (db.prepare("SELECT tags.name FROM tags JOIN prompt_tags ON tags.id = prompt_tags.tag_id WHERE prompt_tags.prompt_id = ? ORDER BY tags.name").all(prompt.id) as { name: string }[]).map((tag) => `#${escape(tag.name)}`).join(" ");
      const section = (label: string, value: string) => `<section class="prompt-section"><div class="prompt-section-header"><h2>${label}</h2><button class="copy-button" data-copy>Copy</button></div><pre>${escape(value)}</pre></section>`;
      const allText = prompt.negative_prompt ? `Positive Prompt\n\n${prompt.positive_prompt}\n\nNegative Prompt\n\n${prompt.negative_prompt}` : prompt.positive_prompt;
      const gallery = `<img class="detail-image" id="selected-image" src="../../${urls[0] || cover}" alt="${escape(prompt.title)}">${urls.length > 1 ? `<div class="gallery-thumbs">${urls.map((url, index) => `<button class="${index === 0 ? "selected" : ""}" data-image="../../${url}" aria-label="이미지 ${index + 1}"><img src="../../${url}" alt=""></button>`).join("")}</div>` : ""}`;
      const body = `<main class="detail-layout"><div>${gallery}<p class="detail-tags">${tags}</p></div><div class="detail-panel"><a class="archive-back" href="../../index.html">← Archive</a><h1 class="detail-title">${escape(prompt.title)}</h1><p class="detail-tags">${new Date(prompt.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</p>${section("Positive Prompt", prompt.positive_prompt)}${prompt.negative_prompt ? section("Negative Prompt", prompt.negative_prompt) : ""}<button class="copy-button copy-all" data-copy>전체 복사</button><pre hidden>${escape(allText)}</pre><p role="status" id="copy-status"></p></div></main>`;
      const directory = path.join(staging, "prompts", slug);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, "index.html"), document(prompt.title, body, "../../"));
    }
    await fs.writeFile(path.join(staging, "index.html"), document("AI Prompt Archive", `<main class="gallery home-gallery" aria-label="공개 이미지 갤러리">${cards.join("")}${cards.length ? "" : "<p>공개된 프롬프트가 없습니다.</p>"}</main>`, "./"));
    const css = (await fs.readFile(path.join(root, "src/app/globals.css"), "utf8")).replace('@import "tailwindcss";', "");
    await fs.writeFile(path.join(staging, "assets/site.css"), css + "\n[hidden]{display:none!important}.copy-all{margin-top:24px}.gallery-card:focus-visible{outline:2px solid currentColor;outline-offset:3px}\n");
    await fs.copyFile(path.join(root, "public/placeholder-1.svg"), path.join(staging, "assets/placeholder.svg"));
    await fs.copyFile(path.join(root, "scripts/pages-client.js"), path.join(staging, "assets/site.js"));
    await fs.writeFile(path.join(staging, ".nojekyll"), "");
    // Only replace the fixed export directory after every public image was copied successfully.
    await fs.rm(output, { recursive: true, force: true });
    await fs.rename(staging, output);
    console.log(`Exported ${prompts.length} public prompts and ${imageCount} images to pages-site/`);
  } finally {
    db.close();
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
