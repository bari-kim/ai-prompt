"use server";
import { redirect } from "next/navigation";
import argon2 from "argon2";
import { createSession } from "@/lib/auth";
export async function loginAction(formData: FormData) {
  const inputPassword = String(formData.get("password") || "");
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const loaded = Boolean(hash);
  const isArgonHash = Boolean(hash && /^\$argon2(id|i|d)\$/.test(hash));
  console.info(`[auth] ADMIN_PASSWORD_HASH loaded: ${loaded}; Argon2 format: ${isArgonHash}`);
  if (!hash || !isArgonHash) redirect("/admin/login?config=1");
  let validPassword: boolean;
  try {
    validPassword = await argon2.verify(hash, inputPassword);
  } catch {
    redirect("/admin/login?config=1");
  }
  if (!validPassword) redirect("/admin/login?error=1");
  await createSession();
  redirect("/admin");
}
