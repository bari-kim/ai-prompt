import { redirect } from "next/navigation";

export default async function Prompts({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["q", "tag", "sort"] as const) {
    if (params[key]) query.set(key, params[key]);
  }
  redirect(query.size ? `/?${query}` : "/");
}
