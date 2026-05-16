import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

interface NotifParams { type: $Enums.NotificationType; titre: string; contenu: string; lien?: string; }

export async function notifierUser(userId: string, params: NotifParams) {
  try { await prisma.notification.create({ data: { userId, ...params } }); sseEmit(userId, "notification", params); } catch { console.error("[NOTIF] notifierUser", userId); }
}

export async function notifierAdmins(params: NotifParams) {
  try {
    const admins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true, isBanned: false }, select: { id: true } });
    if (admins.length > 0) { await prisma.notification.createMany({ data: admins.map((a: { id: string }) => ({ userId: a.id, ...params })) }); admins.forEach((a: { id: string }) => sseEmit(a.id, "notification", params)); }
  } catch { console.error("[NOTIF] notifierAdmins"); }
}

export async function notifierRole(role: $Enums.Role, params: NotifParams) {
  try {
    const users = await prisma.user.findMany({ where: { role, isActive: true, isBanned: false }, select: { id: true } });
    if (users.length > 0) { await prisma.notification.createMany({ data: users.map((u: { id: string }) => ({ userId: u.id, ...params })) }); users.forEach((u: { id: string }) => sseEmit(u.id, "notification", params)); }
  } catch { console.error("[NOTIF] notifierRole", role); }
}

type SSEWriter = { write: (data: string) => void };
const sseClients = new Map<string, SSEWriter>();
export function sseRegister(userId: string, writer: SSEWriter) { sseClients.set(userId, writer); }
export function sseUnregister(userId: string) { sseClients.delete(userId); }
export function sseEmit(userId: string, event: string, data: unknown) {
  const client = sseClients.get(userId);
  if (client) { try { client.write(`event:${event}\ndata:${JSON.stringify(data)}\n\n`); } catch { sseClients.delete(userId); } }
}