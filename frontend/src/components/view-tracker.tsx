"use client";
import { useEffect } from "react";
export function ViewTracker({ promptId }: { promptId:string }) { useEffect(() => { fetch(`/api/prompts/${promptId}/view`, { method:"POST" }).catch(()=>{}); }, [promptId]); return null; }
