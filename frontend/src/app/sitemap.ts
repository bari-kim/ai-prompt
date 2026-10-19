import type { MetadataRoute } from "next";
import { listPrompts } from "@/lib/prompt-service";
import { config } from "@/lib/config";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const prompts=await listPrompts({admin:false}); return [{url:config.siteUrl,lastModified:new Date()},...prompts.map((prompt)=>({url:`${config.siteUrl}/prompts/${prompt.slug}`,lastModified:prompt.updatedAt}))]; }
