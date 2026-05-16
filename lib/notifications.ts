// lib/notifications.ts
import { prisma } from "./prisma"; // Adapte le chemin vers ton fichier lib/prisma.ts
export async function notifierUser(userId: string, type: any, titre: string, contenu: string, lien?: string) {
  return await prisma.notification.create({
    data: { userId, type, titre, contenu, lien }
  });
}