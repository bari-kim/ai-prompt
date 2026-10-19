import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import argon2 from "argon2";

async function main() {
  const terminal = readline.createInterface({ input, output });
  try {
    const password = await terminal.question("새 관리자 비밀번호를 입력하세요:\n> ");
    if (!password) throw new Error("빈 비밀번호는 사용할 수 없습니다.");
    if (password.length < 8) throw new Error("비밀번호는 8자 이상이어야 합니다.");

    const confirmation = await terminal.question("비밀번호를 한 번 더 입력하세요:\n> ");
    if (password !== confirmation) throw new Error("비밀번호가 일치하지 않습니다.");

    const hash = await argon2.hash(password, { type: argon2.argon2id });
    if (!(await argon2.verify(hash, password))) throw new Error("생성된 해시 검증에 실패했습니다.");
    // Next.js expands $VARIABLE references, even inside quoted .env values.
    const envHash = hash.replace(/\$/g, "\\$");
    console.log(`ADMIN_PASSWORD_HASH="${envHash}"`);
  } finally {
    terminal.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "비밀번호 해시 생성에 실패했습니다.");
  process.exitCode = 1;
});
