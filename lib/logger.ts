import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

interface LogParams { niveau?: $Enums.LogNiveau; action: string; userId?: string; cible?: string; details?: Record<string, unknown>; ip?: string; userAgent?: string; }

export async function logAction(params: LogParams): Promise<void> {
  try {
    await prisma.logSysteme.create({ data: { niveau: params.niveau ?? "INFO", action: params.action, userId: params.userId, cible: params.cible, details: params.details as any, ip: params.ip, userAgent: params.userAgent } });
  } catch { console.error("[LOGGER]", params.action); }
}