import { getDb } from "@/db";
import { promptSequence } from "@/db/schema";

export function formatPromptTitle(number: number) {
  return String(number).padStart(4, "0");
}

export function getNextPromptTitle() {
  const sequence = getDb().select().from(promptSequence).get();
  return formatPromptTitle((sequence?.value ?? 0) + 1);
}
