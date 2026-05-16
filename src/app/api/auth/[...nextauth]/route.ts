// src/app/api/auth/[...nextauth]/route.ts — next-auth v5
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
