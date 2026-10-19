import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import Database from "better-sqlite3";

test("Pages export includes only public content, escapes HTML, works below a repository path, and removes stale pages", async () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const fixture = await fs.mkdtemp(path.join(root, ".pages-export-test-"));
  let db;
  try {
    const frontend = path.join(fixture, "frontend");
    for (const file of ["scripts/export-pages.ts", "scripts/pages-client.js", "src/app/globals.css", "public/placeholder-1.svg"]) {
      const destination = path.join(frontend, file);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(path.join(root, "frontend", file), destination);
    }
    const dbPath = path.join(fixture, "test.sqlite");
    db = new Database(dbPath);
    db.exec(`CREATE TABLE prompts(id TEXT,title TEXT,slug TEXT,positive_prompt TEXT,negative_prompt TEXT,created_at INTEGER,visibility TEXT);
      CREATE TABLE prompt_images(prompt_id TEXT,object_key TEXT,is_cover INTEGER,sort_order INTEGER);
      CREATE TABLE tags(id TEXT,name TEXT);
      CREATE TABLE prompt_tags(prompt_id TEXT,tag_id TEXT);
      CREATE TABLE sessions(token_hash TEXT);`);
    db.prepare("INSERT INTO prompts VALUES(?,?,?,?,?,?,?)").run("public", '<script>alert("title")</script>', "한글 제목", "<script>public text</script>", "negative", 1000, "public");
    db.prepare("INSERT INTO prompts VALUES(?,?,?,?,?,?,?)").run("private", "PRIVATE_TITLE_SENTINEL", "private", "PRIVATE_TEXT_SENTINEL", null, 2000, "private");
    db.prepare("INSERT INTO sessions VALUES(?)").run("SECRET_SESSION_SENTINEL");
    db.prepare("INSERT INTO prompt_images VALUES(?,?,?,?)").run("public", "local:prompts/public/cover.png", 1, 0);
    db.prepare("INSERT INTO prompt_images VALUES(?,?,?,?)").run("public", "local:prompts/public/second.png", 0, 1);
    db.prepare("INSERT INTO prompt_images VALUES(?,?,?,?)").run("private", "local:prompts/private/secret.png", 1, 0);
    await fs.mkdir(path.join(fixture, "uploads/prompts/public"), { recursive: true });
    await fs.mkdir(path.join(fixture, "uploads/prompts/private"), { recursive: true });
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=", "base64");
    await fs.writeFile(path.join(fixture, "uploads/prompts/public/cover.png"), png);
    await fs.writeFile(path.join(fixture, "uploads/prompts/public/second.png"), png);
    await fs.writeFile(path.join(fixture, "uploads/prompts/private/secret.png"), "PRIVATE_IMAGE_SENTINEL");
    const run = () => spawnSync(process.execPath, ["--experimental-strip-types", path.join(frontend, "scripts/export-pages.ts")], { env: { ...process.env, SQLITE_DB_PATH: dbPath }, encoding: "utf8" });
    let result = run();
    assert.equal(result.status, 0, result.stderr);
    const output = path.join(fixture, "pages-site");
    const files = await fs.readdir(output, { recursive: true });
    assert.equal(files.filter((file) => file.endsWith(".png")).length, 2);
    const htmlFiles = files.filter((file) => file.endsWith(".html"));
    assert.equal(htmlFiles.length, 2);
    for (const file of htmlFiles) {
      const html = await fs.readFile(path.join(output, file), "utf8");
      assert.ok(!html.includes("<script>alert"));
      assert.ok(!html.includes("PRIVATE_") && !html.includes("SECRET_SESSION"));
      assert.ok(html.includes("&lt;script&gt;"));
      for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        assert.ok(!match[1].startsWith("/"), "Links must work under /repository/");
        await fs.access(path.resolve(path.dirname(path.join(output, file)), match[1]));
      }
    }
    assert.ok(!files.some((file) => /sqlite|admin|private|\.env/.test(file)));
    // Failed export must leave the last complete site untouched.
    await fs.unlink(path.join(fixture, "uploads/prompts/public/cover.png"));
    result = run();
    assert.notEqual(result.status, 0);
    await fs.access(path.join(output, "assets/images/0.png"));
    db.exec("UPDATE prompts SET visibility = 'private'");
    result = run();
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual((await fs.readdir(output, { recursive: true })).filter((file) => file.endsWith(".png")), []);
    assert.ok(!(await fs.readdir(output, { recursive: true })).includes("prompts"));
    db.close();
  } finally {
    if (db?.open) db.close();
    await fs.rm(fixture, { recursive: true, force: true, maxRetries: 3 });
  }
});
