import fs from "node:fs";
import path from "node:path";
import { getSqlitePath } from "../src/db";

const source = getSqlitePath();
if (!fs.existsSync(source)) {
  console.error("SQLite database does not exist yet. Start the app once before backing it up.");
  process.exit(1);
}
const backupDir = path.join(path.dirname(source), "backups");
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = path.join(backupDir, "prompt-archive-" + stamp + ".sqlite");
fs.copyFileSync(source, target);
console.log("SQLite backup created: " + target);
