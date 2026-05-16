// lib/cookies.ts — Helpers cookies server-side (next/headers)
import { cookies } from "next/headers";

export function getCookie(name: string): string | undefined {
  return cookies().get(name)?.value;
}

export function getCookieJSON<T>(name: string): T | null {
  try {
    const value = cookies().get(name)?.value;
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
