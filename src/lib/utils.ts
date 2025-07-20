import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { rateLimit } from "./upstash-ratelimit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function isRateLimited(id: string): Promise<boolean> {
  const { success } = await rateLimit.limit(id);
  return !success; 
}